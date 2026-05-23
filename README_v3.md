# Photography Portfolio v3 — 统一认证摄影作品平台

> React 18 + TypeScript 前端 | Express + SQLite3 后端 | Sharp 图片处理 | 双模存储 | JWT 角色认证

---

## 一、项目架构

```
D:\photoweb_v3\
├── front/                          # 前端 SPA (React 18 + TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   ├── request.ts          # Axios 实例（baseURL /api, JWT 自动附加, 10s 超时）
│   │   │   └── photo.ts            # Photo/City 类型 + 5 个 API 函数（Mock 降级）
│   │   ├── components/             # 10 个通用组件
│   │   │   ├── Button.tsx          # 无边框按钮 + hover 流动下划线
│   │   │   ├── Card.tsx            # 毛玻璃卡片
│   │   │   ├── Navbar.tsx          # 顶部固定透明导航（角色感知 + 桌面/移动端）
│   │   │   ├── ParallaxHero.tsx    # 全屏视差首屏（Framer Motion useScroll）
│   │   │   ├── PhotoGrid.tsx       # 3/4 列响应式照片网格（懒加载 + hover 缩放 + 遮罩）
│   │   │   ├── ImageWithZoom.tsx   # 点击全屏放大预览
│   │   │   ├── CityScroller.tsx    # 城市横向滚动条
│   │   │   ├── Footer.tsx          # 极简版权 + 社交链接
│   │   │   ├── Skeleton.tsx        # 骨架屏占位
│   │   │   └── AdminOnly.tsx       # 管理员条件渲染包裹器
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # 全局认证状态（token/role/username + login/logout）
│   │   ├── pages/                  # 6 个页面
│   │   │   ├── LoginPage.tsx       # 统一登录（角色 radio + 账号密码 + 跳过浏览）
│   │   │   ├── HomePage.tsx        # 首屏视差 + 精选作品 3 列 + 城市入口 + 页脚
│   │   │   ├── PortfolioPage.tsx   # 地图视图 / 列表视图（双标签切换）
│   │   │   ├── PhotoDetailPage.tsx # 全屏照片 + EXIF 详情 + 同城推荐
│   │   │   ├── AboutPage.tsx       # 摄影师头像 + 简介 + 设备清单
│   │   │   └── ContactPage.tsx     # 极简下划线表单 + 联系方式
│   │   ├── mock/data.ts            # 开发用模拟数据（10 城市/50 照片）
│   │   ├── styles/index.css        # Tailwind 指令 + .btn-base/.card-base 组件样式
│   │   ├── utils/animation.ts      # Framer Motion 动画 variants
│   │   ├── App.tsx                 # 路由表 + AdminRoute 守卫 + iframe 消息监听
│   │   ├── main.tsx                # React 入口（StrictMode + AuthProvider）
│   │   └── vite-env.d.ts          # Vite 环境变量类型
│   ├── .env                        # VITE_API_BASE_URL=/api
│   ├── tailwind.config.js          # 自定义黑灰色调系统
│   ├── vite.config.ts              # Vite 配置 + /api /admin 代理
│   └── package.json                # 前端依赖
│
├── backend/                        # 后端 API 服务
│   ├── server.js                   # Express 核心（~410 行，14 个路由 + auth 中间件）
│   ├── .env                        # 环境变量（密码/R2 凭证）
│   ├── public/admin/
│   │   └── index.html              # 后台管理单页面（暗色主题，支持 iframe 嵌入 + URL token）
│   ├── uploads/                    # 本地存储的图片文件（自动创建）
│   ├── data.db                     # SQLite 数据库（photos + users 两表）
│   └── package.json                # 后端依赖
│
├── README_v1.md                    # v1 前端独立版说明
├── README_v2.md                    # v2 后端需求方案
├── v2.md                           # v2 原始需求
└── login-iteration.md              # v3 认证改造方案
```

---

## 二、v3 新增特性（相比 v2）

| 特性 | 说明 |
|------|------|
| **统一登录页** | `/login` — 角色 radio（普通用户/管理员）+ 账号密码 + "跳过直接浏览" |
| **users 表** | SQLite 新增，username/password(bcrypt)/role，默认 admin + guest 账号 |
| **角色认证中间件** | `auth('admin')` 模式，支持可选角色检查，返回 401/403 |
| **AuthContext** | React Context 全局管理 token/role/username，localStorage 持久化 |
| **AdminRoute 路由守卫** | 未登录或非 admin 访问 `/admin` → 自动重定向 `/login` |
| **AdminOnly 组件** | 仅 admin 可见的条件渲染包裹器 |
| **Navbar 角色感知** | 未登录→"登录"按钮 / 已登录→username+角色+登出 / admin→额外"管理"入口 |
| **iframe 嵌入管理后台** | `/admin` 路由以 iframe 嵌入现有 admin/index.html，通过 `?token=` URL 参数传递 JWT |
| **iframe 登出同步** | admin 面板登出时 `postMessage` 通知 React 父窗口同步登出 |
| **Vite 代理** | `/api` 和 `/admin` 代理到 `localhost:3000`，开发环境同源 |
| **Axios JWT 拦截器** | 请求自动附加 `Authorization: Bearer <token>` |
| **旧登录兼容** | `POST /api/admin/login` 仍可用，admin 面板直接访问不受影响 |

---

## 三、技术栈详情

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.3 | UI 框架（StrictMode） |
| TypeScript | ^5.5 | 类型安全（strict 模式） |
| Tailwind CSS | ^3.4 | 原子化 CSS + 自定义黑灰色调系统 |
| Framer Motion | ^11.3 | 页面过渡/视差滚动/元素入场/交互动画 |
| Leaflet + react-leaflet | ^1.9 / ^4.2 | 深色主题地图 + CircleMarker 交互 |
| React Router | ^6.26 | SPA 路由 + 动态参数 + 路由守卫 |
| Axios | ^1.7 | HTTP 请求统一封装 + JWT 拦截器 |
| react-lazyload | ^3.2 | 图片懒加载 |
| Vite | ^5.4 | 构建工具（HMR + 代理） |
| ESLint + Prettier | ^8.57 / ^3.3 | 代码规范与自动格式化 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express.js | ^4.19 | HTTP 服务框架 |
| SQLite3 | ^5.1 | 本地关系型数据库（零配置） |
| Multer | ^1.4 | 多部件文件上传（内存缓冲） |
| Sharp | ^0.33 | 图片处理（压缩/格式转换/缩放） |
| @aws-sdk/client-s3 | ^3.577 | S3 兼容对象存储（Cloudflare R2 / 阿里云 OSS） |
| jsonwebtoken | ^9.0 | JWT 认证（24h 有效期，含 role 字段） |
| bcryptjs | ^2.4 | 密码哈希 |
| cors | ^2.8 | 跨域资源共享 |

---

## 四、数据库表结构

### photos（不变）

```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,        city TEXT NOT NULL,       country TEXT NOT NULL,
  latitude REAL,              longitude REAL,
  takenAt TEXT,               camera TEXT,              lens TEXT,
  aperture TEXT,              shutter TEXT,             iso INTEGER,
  description TEXT,
  url TEXT NOT NULL,          thumbnailUrl TEXT NOT NULL,
  webpUrl TEXT,               thumbnailWebpUrl TEXT,
  featured INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);
```

### users（v3 新增）

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,       -- bcrypt 哈希
  role TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

默认账号：

| username | password | role |
|----------|----------|------|
| `admin` | `admin123` | admin（上传/删除/批量操作） |
| `guest` | `guest123` | user（仅浏览） |

---

## 五、设计系统

### 色调（无彩色系）

| Token | Hex | 用途 |
|-------|-----|------|
| `black` | `#0a0a0a` | 主背景 |
| `dark` | `#121212` | 卡片背景 |
| `gray-100` | `#f5f5f5` | 正文 |
| `gray-200` | `#e5e5e5` | 次要文字 |
| `gray-300` | `#d4d4d4` | 边框/分割线 |
| `gray-400` | `#a3a3a3` | 提示文字 |
| `gray-500` | `#737373` | 禁用/链接 |
| `gray-600` | `#525252` | hover 背景 |
| `gray-700` | `#404040` | 毛玻璃背景 |
| `gray-800` | `#262626` | 深色卡片 |
| `gray-900` | `#171717` | 深色背景 |
| `white` | `#ffffff` | 高亮文字 |

### 通用组件规范

- **按钮**：无边框无背景，hover 毛玻璃 + 底部 1px 流动下划线（`::after` 伪元素 0.5s）
- **卡片**：`bg-dark/60` + `backdrop-blur-md` + `border-gray-700/50` + `rounded-lg`
- **间距**：8px 网格系统（Tailwind 默认 p-2/p-4/p-6/p-8）
- **字体**：Inter，仅 300/400/500 字重，禁用粗体
- **动画**：Framer Motion，过渡时长 0.3-0.5s

---

## 六、认证流程（v3 核心）

### 登录流程

```
用户访问 /login
  │
  ├─ 选择角色: ○ 普通用户  ○ 管理员
  ├─ 输入账号密码
  │
  ├─ POST /api/login { username, password, role }
  │   ├─ 查 users 表
  │   ├─ bcrypt.compare 密码
  │   ├─ 校验 role 是否匹配
  │   └─ 返回 { token, role, username }   ← JWT 含 { id, username, role }
  │
  ├─ AuthContext.login(token, role, username)
  │   └─ localStorage 持久化: token, role, username
  │
  └─ 跳转:
      ├─ admin → /admin （iframe 嵌入后台，?token= 传 JWT）
      └─ user  → /
```

### 角色权限矩阵

| | 未登录访客 | 普通用户 (user) | 管理员 (admin) |
|---|---|---|---|
| 浏览首页/作品集/详情/关于/联系 | 可以 | 可以 | 可以 |
| Navbar 显示 | 4 链接 + "登录" | 4 链接 + 用户名 + "登出" | 4 链接 + "管理" + 用户名 + "登出" |
| 访问 `/login` | 显示登录表单 | 自动跳转 `/` | 自动跳转 `/admin` |
| 访问 `/admin` | 重定向 `/login` | 重定向 `/login` | 进入管理后台（iframe） |
| `GET /api/photos` 等公开接口 | 可以 | 可以 | 可以 |
| `POST /api/admin/upload` 等管理接口 | 401 未登录 | 403 无权限 | 可以使用 |
| 直接访问 `localhost:3000/admin/index.html` | 见 admin 登录页（需密码） | 见 admin 登录页（需密码） | React 已自动登录 |

### Token 流转（iframe 集成）

```
React 登录成功
  └─ navigate('/admin')
       └─ <iframe src={`/admin/index.html?token=${jwt}`} />
            └─ admin/index.html 加载:
                1. 检查 URL ?token=
                2. 有 → localStorage.setItem('admin_token', token)
                3. 跳过登录 → showDashboard()
                4. 无 → 显示自身登录页（直接访问的 fallback）

Admin 面板点击登出
  └─ window.parent.postMessage({ type: 'LOGOUT' }, origin)
       └─ React AppContent 监听 'message' 事件
            └─ AuthContext.logout() + navigate('/login')
```

### 后端认证中间件

```javascript
// 无角色要求（仅验证登录）
app.get('/api/me', auth(), handler);

// 要求 admin 角色
app.post('/api/admin/upload', auth('admin'), upload.single('file'), handler);

// 验证逻辑:
// 1. 检查 Authorization: Bearer <token>
// 2. jwt.verify(token, JWT_SECRET)
// 3. 可选: 检查 decoded.role 是否匹配
// 4. 成功: req.user = decoded，继续
// 5. 失败: 401（未登录）或 403（无权限）
```

---

## 七、API 接口全表

### 公开接口（6 个，无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/photos` | 照片列表 `?city=&sort=newest/oldest` |
| GET | `/api/photos/featured` | 精选照片 `featured=1` |
| GET | `/api/photos/city/:cityName` | 按城市查照片 |
| GET | `/api/photos/:id` | 单张照片详情 |
| GET | `/api/cities` | 城市列表（含 photoCount，AVG 坐标） |
| POST | `/api/login` | **统一登录** `{username, password, role}` → `{token, role, username}` |

### 管理接口（8 个，需 admin JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 旧登录（兼容）`{password}` → `{token}` |
| GET | `/api/admin/storage-info` | 当前存储模式 local/r2 |
| GET | `/api/admin/test-r2` | 对象存储连接测试 |
| GET | `/api/admin/photos` | 分页+搜索 `?page=&limit=20&search=` |
| DELETE | `/api/admin/photos/:id` | 删除单张 + 清理存储文件 |
| POST | `/api/admin/batch` | 批量操作 `{action, ids}` — delete/setFeatured/unsetFeatured |
| POST | `/api/admin/upload` | Multipart 上传 → Sharp 4 版本 → 存储 + DB |

### Photo 数据结构

```typescript
interface Photo {
  id: number;
  title: string;       city: string;        country: string;
  latitude: number;    longitude: number;
  takenAt: string;     camera: string;      lens: string;
  aperture: string;    shutter: string;     iso: number;
  description: string;
  url: string;              // JPEG 原图
  thumbnailUrl: string;     // JPEG 缩略图 (800px)
  webpUrl: string;          // WebP 原图
  thumbnailWebpUrl: string; // WebP 缩略图 (800px)
  featured: 0 | 1;
  createdAt: string;
}
```

---

## 八、存储双模设计

### 本地存储（默认）

- 图片保存到 `backend/uploads/` 目录
- Express 静态文件服务暴露 `/uploads/`
- URL 格式：`http://localhost:3000/uploads/xxx.jpg`

### 对象存储（可选，配置即切换）

当前支持 S3 兼容协议（Cloudflare R2 / 阿里云 OSS）：

```
# backend/.env（配置后自动切换）
R2_ENDPOINT=https://oss-cn-地域.aliyuncs.com
R2_ACCESS_KEY_ID=你的AK
R2_SECRET_ACCESS_KEY=你的SK
R2_BUCKET_NAME=你的Bucket
R2_PUBLIC_URL=https://你的Bucket.oss-cn-地域.aliyuncs.com
```

- `USE_R2` 自动检测：R2_ENDPOINT + AK + SK 三者齐全即启用
- 已有本地数据不受影响，无需迁移
- 阿里云 OSS 与 Cloudflare R2 使用同一套 `@aws-sdk/client-s3` 代码

---

## 九、图片处理流水线

```
用户上传 → Multer 内存接收
  → Sharp 并行生成 4 个版本:
    1. JPEG 原图:    jpeg(quality:90, mozjpeg:true)
    2. WebP 原图:    webp(quality:85, effort:6)
    3. JPEG 缩略图:  resize(800).jpeg(quality:90)
    4. WebP 缩略图:  resize(800).webp(quality:85, effort:6)
  → 逐个上传到存储（R2/OSS 或本地）
  → 任意文件失败 → 回滚删除已上传文件
  → 全部成功 → 写入 SQLite 数据库
  → DB 写入失败 → 清理所有存储文件
```

---

## 十、页面功能矩阵

| 功能 | 首页 | 作品集 | 详情页 | 关于 | 联系 | 登录 |
|------|:--:|:--:|:--:|:--:|:--:|:--:|
| 全屏视差首屏 | ✓ | — | — | — | — | — |
| 精选照片 3 列网格 | ✓ | — | — | — | — | — |
| 城市横向滚动入口 | ✓ | — | — | — | — | — |
| Leaflet 深色地图 | — | ✓ | — | — | — | — |
| 地图/列表双视图 | — | ✓ | — | — | — | — |
| 国家→城市层级分类 | — | ✓ | — | — | — | — |
| 排序（最新/最早） | — | ✓ | — | — | — | — |
| 照片 hover 放大+遮罩 | ✓ | ✓ | — | — | — | — |
| 全屏点击放大 | — | — | ✓ | — | — | — |
| EXIF 参数展示 | — | — | ✓ | — | — | — |
| 同城推荐 | — | — | ✓ | — | — | — |
| 骨架屏加载 | ✓ | ✓ | ✓ | — | — | — |
| 图片懒加载 | ✓ | ✓ | ✓ | — | — | — |
| 摄影师简介+设备 | — | — | — | ✓ | — | — |
| 联系表单 | — | — | — | — | ✓ | — |
| 页脚社交链接 | ✓ | — | — | — | — | — |
| 角色选择登录 | — | — | — | — | — | ✓ |

---

## 十一、后台管理功能

| 功能 | 说明 |
|------|------|
| 双入口登录 | React `/login` 选 admin + 直接 `admin/index.html` 密码登录 |
| JWT 认证 | 24h 有效期，role 字段，`auth('admin')` 中间件保护 |
| 照片上传 | 文件选择 + 14 个元数据字段 + 经纬度 N/S/E/W 方向选择器 |
| 照片列表 | 缩略图卡片，精选标签 |
| 分页 | 每页 20 张，最多 5 个页码按钮 |
| 搜索 | 标题/城市/国家模糊搜索，300ms 防抖，自动重置页码 |
| 批量操作 | 全选/Shift 范围多选/批量删除/设精选/取消精选 |
| 单张删除 | 卡片右上角删除按钮 + confirm 确认 |
| 存储测试 | `/api/admin/test-r2` 连接检测 |
| iframe 嵌入 | 通过 React `/admin` 路由嵌入，`?token=` 自动登录 |
| 登出同步 | admin 面板登出时 postMessage 通知 React 父窗口 |

---

## 十二、动画与交互清单

| 场景 | 实现 |
|------|------|
| 页面切换 | `AnimatePresence` + opacity 淡入淡出（0.3s） |
| 首页视差 | `useScroll` + `useTransform`（系数 0.3） |
| 元素入场 | `whileInView` opacity:0→1 + y:20→0 |
| 登录卡片入场 | opacity:0→1 + y:20→0（0.3s） |
| 按钮 hover | CSS `::after` 下划线从左到右流动（0.5s） |
| 按钮点击 | `whileTap` scale:0.95 |
| 卡片 hover | `hover:border-gray-600/80` + scale:1.02 |
| 照片 hover 遮罩 | 毛玻璃叠加层 + 标题地点文字 |
| 地图标记 hover | radius 放大 + fillOpacity 增加 |
| 骨架屏 | `animate-pulse` bg-gray-800/50 |

---

## 十三、启动与部署

### 本地开发

```bash
# 1. 后端
cd backend
npm install
npm start                    # → http://localhost:3000

# 2. 前端（新开终端）
cd front
npm install
npm run dev                  # → http://localhost:5173
```

### 连接前后端

Vite 开发服务器已配置代理，`front/.env`：
```
VITE_API_BASE_URL=/api
```

- `/api/*` → 代理到 `http://localhost:3000`
- `/admin/*` → 代理到 `http://localhost:3000`
- 开发环境同源，无跨域问题
- 未设置时前端自动降级使用内置 Mock 数据

### 管理后台入口

| 方式 | URL | 说明 |
|------|-----|------|
| React 内（推荐） | `http://localhost:5173/login` → 选 admin 登录 → 自动跳转 | iframe 嵌入，自动登录 |
| 直接访问 | `http://localhost:3000/admin/index.html` | 输入密码 `admin123` |

### 生产部署

```bash
# 前端构建
cd front && npm run build          # 输出到 dist/

# 后端启动（PM2 守护）
cd backend && pm2 start server.js --name photoweb
pm2 save && pm2 startup

# Nginx 配置
# /          → front/dist/ (React 静态文件)
# /api/*     → 127.0.0.1:3000
# /admin/*   → 127.0.0.1:3000
# /uploads/* → 127.0.0.1:3000
```

---

## 十四、环境变量参考

### backend/.env

```
PORT=3000
JWT_SECRET=你的随机密钥
ADMIN_PASSWORD_HASH=$2a$10$...bcrypt哈希

# 对象存储（留空即本地存储，三者齐全即启用）
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=photoweb
R2_PUBLIC_URL=
```

### front/.env

```
VITE_API_BASE_URL=/api
```

---

## 十五、移动端适配

断点：768px

| 桌面 | 移动端 |
|------|--------|
| 3 列照片网格 | 单列 |
| 4 列照片网格 | 2 列 |
| 顶部导航栏（含用户区） | 汉堡菜单（含登录/登出） |
| 列表视图侧边栏 | 顶部下拉菜单 |
| 地图 60vh | 全屏 |
| 表单多列 | 单列 |
| 登录卡片 max-w-sm | 自适应 |

---

## 十六、关键设计决策

1. **Sharp 处理在内存中进行**，不产生临时文件（`multer.memoryStorage()`）
2. **上传失败自动回滚**：存储上传失败 → 删已传文件；DB 写入失败 → 删所有文件
3. **删除照片同步清理存储**：`storageKey()` 统一提取文件路径，支持本地/R2/OSS
4. **前端自动切换 Mock/真实 API**：检测 `VITE_API_BASE_URL` 是否存在，组件代码零改动
5. **后端存储自动检测**：R2_ENDPOINT + AK + SK 三者齐全才启用对象存储
6. **城市坐标取平均值**：`AVG(latitude), AVG(longitude)` 确保地图标记在照片群中心
7. **auth 中间件柯里化**：`auth()` 仅验证登录，`auth('admin')` 验证角色，灵活组合
8. **iframe 嵌入而非重写管理后台**：保留现有 500+ 行管理面板，React 端仅加认证层
9. **双登录接口共存**：`POST /api/login`（统一入口）+ `POST /api/admin/login`（直接访问 admin 面板的 fallback）
10. **iframe 跨窗口登出同步**：`postMessage` + `message` 事件，保证 React 和 iframe 状态一致
11. **Vite 代理实现开发同源**：`/api` 和 `/admin` 双代理，消除跨域和 localStorage 隔离问题
12. **角色不匹配返回 403**：用户选择"管理员"但实际 role=user → 明确提示"身份不匹配"

---

## 十七、路由表

| 路径 | 组件 | 认证要求 | 说明 |
|------|------|----------|------|
| `/` | HomePage | 无 | 首页 |
| `/portfolio` | PortfolioPage | 无 | 作品集 |
| `/photo/:id` | PhotoDetailPage | 无 | 照片详情 |
| `/about` | AboutPage | 无 | 关于 |
| `/contact` | ContactPage | 无 | 联系 |
| `/login` | LoginPage | 无（已登录自动跳转） | 登录页 |
| `/admin/*` | iframe → admin/index.html | AdminRoute 守卫（role=admin） | 管理后台 |
