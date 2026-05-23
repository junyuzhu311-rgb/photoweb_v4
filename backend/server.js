require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const sharp = require('sharp');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);

// ── Storage mode ───────────────────────────────────────────
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
const USE_R2 = !!(R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ── Database ──────────────────────────────────────────────
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    takenAt TEXT,
    camera TEXT,
    lens TEXT,
    aperture TEXT,
    shutter TEXT,
    iso INTEGER,
    description TEXT,
    url TEXT NOT NULL,
    thumbnailUrl TEXT NOT NULL,
    featured INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now'))
  )`);

  db.run('ALTER TABLE photos ADD COLUMN webpUrl TEXT', () => {});
  db.run('ALTER TABLE photos ADD COLUMN thumbnailWebpUrl TEXT', () => {});

  db.run('CREATE INDEX IF NOT EXISTS idx_photos_city ON photos(city)');
  db.run('CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(featured)');
  db.run('CREATE INDEX IF NOT EXISTS idx_photos_takenAt ON photos(takenAt)');
  db.run('CREATE INDEX IF NOT EXISTS idx_photos_createdAt ON photos(createdAt)');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const defaultAdminHash = bcrypt.hashSync('admin123', 10);
  db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
    ['admin', defaultAdminHash, 'admin']);

  const defaultGuestHash = bcrypt.hashSync('guest123', 10);
  db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
    ['guest', defaultGuestHash, 'user']);
});

// ── R2 Client ─────────────────────────────────────────────
const r2 = USE_R2 ? new S3Client({
  endpoint: R2_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
}) : null;

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'photoweb';

function getBaseUrl(req) {
  if (USE_R2) return R2_PUBLIC_URL;
  return `${req.protocol}://${req.get('host')}`;
}

function storageKey(url) {
  if (!url) return '';
  if (USE_R2) return url.replace(R2_PUBLIC_URL + '/', '');
  // local: extract the path after /uploads/
  const idx = url.indexOf('/uploads/');
  return idx >= 0 ? url.slice(idx + 1) : ''; // "uploads/xxx.jpg"
}

async function uploadFile(key, buffer, contentType) {
  if (USE_R2) {
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: contentType,
    }));
  } else {
    const filePath = path.join(__dirname, key);
    fs.writeFileSync(filePath, buffer);
  }
}

async function deleteFile(key) {
  if (!key) return;
  try {
    if (USE_R2) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    } else {
      const filePath = path.join(__dirname, key);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error('File delete error:', e.message);
  }
}

// ── Auth Middleware ────────────────────────────────────────
function auth(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: '未登录' });
    try {
      const decoded = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: '无权限' });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: '登录过期' });
    }
  };
}

// ── Multer ─────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ── Sharp Processing ───────────────────────────────────────
async function processImage(buffer) {
  const [origJpeg, origWebp, thumbJpeg, thumbWebp] = await Promise.all([
    sharp(buffer).jpeg({ quality: 90, mozjpeg: true }).toBuffer(),
    sharp(buffer).webp({ quality: 85, effort: 6 }).toBuffer(),
    sharp(buffer).resize(800, null, { fit: 'inside' }).jpeg({ quality: 90 }).toBuffer(),
    sharp(buffer).resize(800, null, { fit: 'inside' }).webp({ quality: 85, effort: 6 }).toBuffer(),
  ]);
  return { origJpeg, origWebp, thumbJpeg, thumbWebp };
}

// ═══════════════════════════════════════════════════════════
//  Frontend APIs
// ═══════════════════════════════════════════════════════════

app.get('/api/photos', (req, res) => {
  const { city, sort } = req.query;
  let sql = 'SELECT id, title, city, country, latitude, longitude, takenAt, camera, lens, aperture, shutter, iso, description, url, thumbnailUrl, featured, createdAt FROM photos';
  const params = [];
  if (city) { sql += ' WHERE city = ?'; params.push(city); }
  sql += ' ORDER BY takenAt ' + (sort === 'oldest' ? 'ASC' : 'DESC');
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/photos/featured', (_req, res) => {
  db.all('SELECT id, title, city, country, latitude, longitude, takenAt, camera, lens, aperture, shutter, iso, description, url, thumbnailUrl, featured, createdAt FROM photos WHERE featured = 1 ORDER BY createdAt DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/photos/city/:cityName', (req, res) => {
  db.all('SELECT id, title, city, country, latitude, longitude, takenAt, camera, lens, aperture, shutter, iso, description, url, thumbnailUrl, featured, createdAt FROM photos WHERE city = ? ORDER BY takenAt DESC', [req.params.cityName], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/photos/:id', (req, res) => {
  db.get('SELECT id, title, city, country, latitude, longitude, takenAt, camera, lens, aperture, shutter, iso, description, url, thumbnailUrl, featured, createdAt FROM photos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '照片不存在' });
    res.json(row);
  });
});

app.get('/api/cities', (_req, res) => {
  db.all('SELECT city as name, country, AVG(latitude) as latitude, AVG(longitude) as longitude, COUNT(*) as photoCount FROM photos GROUP BY city ORDER BY name ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ═══════════════════════════════════════════════════════════
//  Unified Login
// ═══════════════════════════════════════════════════════════

app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: '请填写完整信息' });
  }
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: '无效的角色' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    if (user.role !== role) {
      return res.status(403).json({ error: '身份不匹配，请选择正确的登录身份' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' },
    );
    res.json({ token, role: user.role, username: user.username });
  });
});

// ═══════════════════════════════════════════════════════════
//  Admin APIs
// ═══════════════════════════════════════════════════════════

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: '请输入密码' });
  if (!bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: '密码错误' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/api/admin/storage-info', auth('admin'), (_req, res) => {
  res.json({
    mode: USE_R2 ? 'r2' : 'local',
    message: USE_R2 ? 'R2 云存储' : '本地存储 (uploads/)',
  });
});

app.get('/api/admin/test-r2', auth('admin'), async (_req, res) => {
  if (!USE_R2) return res.json({ success: false, message: 'R2 未配置，当前使用本地存储' });
  try {
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET, Key: '.test-r2-connection', Body: 'test',
    }));
    res.json({ success: true, message: 'R2连接成功' });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

app.get('/api/admin/photos', auth('admin'), (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  const countSql = search
    ? 'SELECT COUNT(*) as total FROM photos WHERE title LIKE ? OR city LIKE ? OR country LIKE ?'
    : 'SELECT COUNT(*) as total FROM photos';
  const dataSql = search
    ? 'SELECT * FROM photos WHERE title LIKE ? OR city LIKE ? OR country LIKE ? ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    : 'SELECT * FROM photos ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  const searchParam = search ? `%${search}%` : '';

  db.get(countSql, search ? [searchParam, searchParam, searchParam] : [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = row.total;
    const totalPages = Math.ceil(total / limit);
    const params = search
      ? [searchParam, searchParam, searchParam, limit, offset]
      : [limit, offset];

    db.all(dataSql, params, (err2, photos) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ photos, total, page, totalPages });
    });
  });
});

app.delete('/api/admin/photos/:id', auth('admin'), (req, res) => {
  db.get('SELECT url, webpUrl, thumbnailUrl, thumbnailWebpUrl FROM photos WHERE id = ?', [req.params.id], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '照片不存在' });

    await Promise.all([
      deleteFile(storageKey(row.url)),
      deleteFile(storageKey(row.webpUrl)),
      deleteFile(storageKey(row.thumbnailUrl)),
      deleteFile(storageKey(row.thumbnailWebpUrl)),
    ]);

    db.run('DELETE FROM photos WHERE id = ?', [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

app.post('/api/admin/batch', auth('admin'), (req, res) => {
  const { action, ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ error: '请选择照片' });
  if (!['delete', 'setFeatured', 'unsetFeatured'].includes(action)) {
    return res.status(400).json({ error: '无效操作' });
  }

  if (action === 'delete') {
    const placeholders = ids.map(() => '?').join(',');
    db.all(`SELECT url, webpUrl, thumbnailUrl, thumbnailWebpUrl FROM photos WHERE id IN (${placeholders})`, ids, async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      await Promise.all(rows.flatMap((r) => [
        deleteFile(storageKey(r.url)),
        deleteFile(storageKey(r.webpUrl)),
        deleteFile(storageKey(r.thumbnailUrl)),
        deleteFile(storageKey(r.thumbnailWebpUrl)),
      ]));
      db.run(`DELETE FROM photos WHERE id IN (${placeholders})`, ids, (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      });
    });
  } else {
    const val = action === 'setFeatured' ? 1 : 0;
    const placeholders = ids.map(() => '?').join(',');
    db.run(`UPDATE photos SET featured = ? WHERE id IN (${placeholders})`, [val, ...ids], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }
});

app.post('/api/admin/upload', auth('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请选择文件' });

  const uploadedPaths = [];
  try {
    const { origJpeg, origWebp, thumbJpeg, thumbWebp } = await processImage(req.file.buffer);
    const prefix = Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    const baseUrl = getBaseUrl(req);
    const localFiles = [
      { name: `${prefix}-orig.jpg`, buffer: origJpeg, type: 'image/jpeg' },
      { name: `${prefix}-orig.webp`, buffer: origWebp, type: 'image/webp' },
      { name: `${prefix}-thumb.jpg`, buffer: thumbJpeg, type: 'image/jpeg' },
      { name: `${prefix}-thumb.webp`, buffer: thumbWebp, type: 'image/webp' },
    ];

    for (const f of localFiles) {
      const storagePath = USE_R2 ? f.name : `uploads/${f.name}`;
      await uploadFile(storagePath, f.buffer, f.type);
      uploadedPaths.push(storagePath);
    }

    const body = req.body;
    db.run(
      `INSERT INTO photos (title, city, country, latitude, longitude, takenAt, camera, lens, aperture, shutter, iso, description, url, thumbnailUrl, webpUrl, thumbnailWebpUrl, featured)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        body.title || '', body.city || '', body.country || '',
        parseFloat(body.latitude) || 0, parseFloat(body.longitude) || 0,
        body.takenAt || '', body.camera || '', body.lens || '',
        body.aperture || '', body.shutter || '',
        parseInt(body.iso) || 0, body.description || '',
        `${baseUrl}/${uploadedPaths[0]}`, `${baseUrl}/${uploadedPaths[2]}`,
        `${baseUrl}/${uploadedPaths[1]}`, `${baseUrl}/${uploadedPaths[3]}`,
        body.featured === '1' ? 1 : 0,
      ],
      function (err) {
        if (err) {
          uploadedPaths.forEach((p) => deleteFile(p));
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
      },
    );
  } catch (e) {
    await Promise.all(uploadedPaths.map(deleteFile));
    res.status(500).json({ error: e.message });
  }
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Storage mode: ${USE_R2 ? 'R2 cloud' : 'Local (uploads/)'}`);
});
