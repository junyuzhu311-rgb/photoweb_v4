# Photography Portfolio — 全栈摄影作品展示平台

> React 18 + TypeScript 前端 | Express + SQLite3 后端 | Sharp 图片处理 | 双模存储

---

## 一、项目架构

```
D:\photoweb_v2\
├── front/                          # 前端 SPA
│   ├── src/
│   │   ├── api/                    # Axios 封装 + 接口定义
│   │   │   ├── request.ts          # 统一请求实例（拦截器/baseURL/超时）
│   │   │   └── photo.ts            # Photo/City 类型 + 5个API函数
│   │   ├── components/             # 9个通用组件
│   │   │   ├── Button.tsx          # 无边框按钮 + hover流动下划线
│   │   │   ├── Card.tsx            # 毛玻璃卡片
│   │   │   ├── Navbar.tsx          # 顶部固定透明导航（移动端汉堡菜单）
│   │   │   ├── ParallaxHero.tsx    # 全屏视差首屏（Framer Motion useScroll）
│   │   │   ├── PhotoGrid.tsx       # 3/4列响应式照片网格（懒加载+hover缩放+遮罩）
│   │   │   ├── ImageWithZoom.tsx   # 点击全屏放大预览
│   │   │   ├── CityScroller.tsx    # 城市横向滚动条
│   │   │   ├── Footer.tsx          # 极简版权+社交链接
│   │   │   └── Skeleton.tsx        # 骨架屏占位
│   │   ├── pages/                  # 5个页面
│   │   │   ├── HomePage.tsx        # 首屏视差 + 精选作品3列 + 城市入口 + 页脚
│   │   │   ├── PortfolioPage.tsx   # 地图视图 / 列表视图（双标签切换）
│   │   │   ├── PhotoDetailPage.tsx # 全屏照片 + EXIF详情 + 同城推荐
│   │   │   ├── AboutPage.tsx       # 摄影师头像 + 简介 + 设备清单
│   │   │   └── ContactPage.tsx     # 极简下划线表单 + 联系方式
│   │   ├── mock/data.ts            # 开发用模拟数据（10城市/50照片）
│   │   ├── styles/index.css        # Tailwind指令 + .btn-base/.card-base组件样式
│   │   ├── utils/animation.ts      # Framer Motion动画variants
│   │   ├── App.tsx                 # React Router路由 + AnimatePresence
│   │   ├── main.tsx                # React入口（StrictMode）
│   │   └── vite-env.d.ts          # Vite环境变量类型
│   ├── .env                        # VITE_API_BASE_URL（连接后端）
│   ├── tailwind.config.js          # 自定义黑灰色调系统
│   ├── vite.config.ts              # Vite构建配置
│   └── package.json                # 前端依赖
│
├── backend/                        # 后端 API 服务
│   ├── server.js                   # Express核心（~350行，全部路由）
│   ├── .env                        # 环境变量（密码/存储模式/R2凭证）
│   ├── public/admin/
│   │   └── index.html              # 后台管理单页面（暗色主题，内联CSS+JS）
│   ├── uploads/                    # 本地存储的图片文件（自动创建）
│   ├── data.db                     # SQLite数据库（自动创建）
│   └── package.json                # 后端依赖
│
├── README_v1.md                    # v1 前端独立版说明
└── v2.md                           # v2 后端需求方案
```

---

## 二、技术栈详情

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.3 | UI框架（StrictMode） |
| TypeScript | ^5.5 | 类型安全（strict模式） |
| Tailwind CSS | ^3.4 | 原子化CSS + 自定义黑灰色调系统 |
| Framer Motion | ^11.3 | 页面过渡/视差滚动/元素入场/交互动画 |
| Leaflet + react-leaflet | ^1.9 / ^4.2 | 深色主题地图 + CircleMarker交互 |
| React Router | ^6.26 | SPA路由 + 动态参数(/photo/:id) |
| Axios | ^1.7 | HTTP请求统一封装 |
| react-lazyload | ^3.2 | 图片懒加载 |
| Vite | ^5.4 | 构建工具（HMR热更新） |
| ESLint + Prettier | ^8.57 / ^3.3 | 代码规范与自动格式化 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express.js | ^4.19 | HTTP服务框架 |
| SQLite3 | ^5.1 | 本地关系型数据库（零配置） |
| Multer | ^1.4 | 多部件文件上传（内存缓冲） |
| Sharp | ^0.33 | 图片处理（压缩/格式转换/缩放） |
| @aws-sdk/client-s3 | ^3.577 | Cloudflare R2 对象存储（S3兼容协议） |
| jsonwebtoken | ^9.0 | JWT 管理员认证 |
| bcryptjs | ^2.4 | 密码哈希 |
| cors | ^2.8 | 跨域资源共享 |

---

## 三、设计系统

### 色调
所有颜色严格限定在无彩黑灰色调，无任何亮色/彩色：

| Token | Hex | 用途 |
|-------|-----|------|
| `black` | `#0a0a0a` | 主背景 |
| `dark` | `#121212` | 卡片背景 |
| `gray-100` | `#f5f5f5` | 正文 |
| `gray-200` | `#e5e5e5` | 次要文字 |
| `gray-300` | `#d4d4d4` | 边框/分割线 |
| `gray-400` | `#a3a3a3` | 提示文字 |
| `gray-500` | `#737373` | 禁用状态 |
| `gray-600` | `#525252` | hover背景 |
| `gray-700` | `#404040` | 毛玻璃背景 |
| `gray-800` | `#262626` | 深色卡片 |
| `gray-900` | `#171717` | 深色背景 |
| `white` | `#ffffff` | 高亮文字 |

### 通用组件规范
- **按钮**：无边框无背景，hover毛玻璃+底部1px流动下划线（`::after`伪元素）
- **卡片**：`bg-dark/60` + `backdrop-blur-md` + `border-gray-700/50` + `rounded-lg`
- **间距**：8px网格系统（Tailwind默认p-2/p-4/p-6/p-8）
- **字体**：Inter，仅300/400/500字重，禁用粗体
- **动画**：Framer Motion，过渡时长0.3-0.5s

---

## 四、API 接口全表

### 主站前端接口（5个）

| 方法 | 路径 | 参数 | 返回 |
|------|------|------|------|
| GET | `/api/photos` | `?city=&sort=newest/oldest` | `Photo[]` |
| GET | `/api/photos/:id` | — | `Photo` |
| GET | `/api/cities` | — | `City[]`（含photoCount，AVG坐标） |
| GET | `/api/photos/city/:cityName` | — | `Photo[]` |
| GET | `/api/photos/featured` | — | `Photo[]`（featured=1） |

### 后台管理接口（7个，需JWT认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | `{password}` → 返回JWT token |
| GET | `/api/admin/photos` | `?page=&limit=20&search=` → 分页+模糊搜索 |
| POST | `/api/admin/upload` | Multipart上传 → Sharp处理4版本 → 存储 |
| DELETE | `/api/admin/photos/:id` | 删除照片+清理存储文件 |
| POST | `/api/admin/batch` | `{action, ids}` 批量删除/设精选/取消精选 |
| GET | `/api/admin/test-r2` | R2连接测试 |
| GET | `/api/admin/storage-info` | 当前存储模式（local/r2） |

### Photo 数据结构
```typescript
interface Photo {
  id: number;
  title: string;       city: string;        country: string;
  latitude: number;    longitude: number;
  takenAt: string;     camera: string;      lens: string;
  aperture: string;    shutter: string;     iso: number;
  description: string;
  url: string;              // JPEG原图
  thumbnailUrl: string;     // JPEG缩略图(800px)
  webpUrl: string;          // WebP原图
  thumbnailWebpUrl: string; // WebP缩略图(800px)
  featured: 0|1;
  createdAt: string;
}
```

---

## 五、存储双模设计

### 本地存储（默认，无需任何配置）
- 图片保存到 `backend/uploads/` 目录
- 通过 Express 静态文件服务暴露 `/uploads/`
- URL 格式：`http://localhost:3000/uploads/xxx.jpg`

### Cloudflare R2（可选，配置即切换）
- 图片上传到 R2 对象存储
- URL 格式：`https://你的域名/xxx.jpg`
- 配置方法：填写 `backend/.env` 中的 R2 参数
- 已有本地数据不受影响，无需迁移

---

## 六、图片处理流水线

```
用户上传 → Multer内存接收
  → Sharp 并行生成4个版本:
    1. JPEG原图:    jpeg(quality:90, mozjpeg:true)
    2. WebP原图:    webp(quality:85, effort:6)
    3. JPEG缩略图:  resize(800).jpeg(quality:90)
    4. WebP缩略图:  resize(800).webp(quality:85, effort:6)
  → 逐个上传到存储（R2或本地）
  → 任意文件失败 → 回滚删除已上传文件
  → 全部成功 → 写入SQLite数据库
  → 数据库写入失败 → 清理所有存储文件
```

---

## 七、页面功能矩阵

| 功能 | 首页 | 作品集 | 详情页 | 关于 | 联系 |
|------|:--:|:--:|:--:|:--:|:--:|
| 全屏视差首屏 | ✓ | — | — | — | — |
| 精选照片3列网格 | ✓ | — | — | — | — |
| 城市横向滚动入口 | ✓ | — | — | — | — |
| Leaflet深色地图 | — | ✓ | — | — | — |
| 地图/列表双视图 | — | ✓ | — | — | — |
| 国家→城市层级分类 | — | ✓ | — | — | — |
| 排序（最新/最早）| — | ✓ | — | — | — |
| 照片hover放大+遮罩 | ✓ | ✓ | — | — | — |
| 全屏点击放大 | — | — | ✓ | — | — |
| EXIF参数展示 | — | — | ✓ | — | — |
| 同城推荐 | — | — | ✓ | — | — |
| 骨架屏加载 | ✓ | ✓ | ✓ | — | — |
| 图片懒加载 | ✓ | ✓ | ✓ | — | — |
| 摄影师简介+设备 | — | — | — | ✓ | — |
| 联系表单 | — | — | — | — | ✓ |
| 页脚社交链接 | ✓ | — | — | — | — |

---

## 八、后台管理功能

| 功能 | 说明 |
|------|------|
| 登录认证 | JWT 24小时有效期，bcrypt密码哈希 |
| 照片上传 | 文件选择 + 14个元数据字段 + 经纬度N/S/E/W选择器 |
| 照片列表 | 缩略图卡片展示，精选标签 |
| 分页 | 每页20张，最多5个页码按钮，首页/末页禁用 |
| 搜索 | 标题/城市/国家模糊搜索，300ms防抖，自动重置页码 |
| 批量操作 | 全选/Shift范围多选/批量删除/批量设精选/批量取消精选 |
| 单张删除 | 每张卡片右上角删除按钮，confirm确认 |
| 存储测试 | `/api/admin/test-r2` 连接检测 |

---

## 九、动画与交互清单

| 场景 | 实现 |
|------|------|
| 页面切换 | `AnimatePresence` + opacity淡入淡出（0.3s） |
| 首页视差 | `useScroll` + `useTransform`（系数0.3） |
| 元素入场 | `whileInView` opacity:0→1 + y:20→0 |
| 按钮hover | CSS `::after` 下划线从左到右流动（0.5s） |
| 按钮点击 | `whileTap` scale:0.95 |
| 卡片hover | `hover:border-gray-600/80` + scale:1.02 |
| 照片hover遮罩 | 毛玻璃叠加层 + 标题地点文字 |
| 地图标记hover | radius放大 + fillOpacity增加 |
| 骨架屏 | `animate-pulse` bg-gray-800/50 |

---

## 十、启动与部署

### 本地开发

```bash
# 1. 后端
cd backend
npm install
npm start                  # → http://localhost:3000

# 2. 前端（新开终端）
cd front
npm install
npm run dev                # → http://localhost:5173
```

### 连接前后端

在 `front/.env` 中设置：
```
VITE_API_BASE_URL=http://localhost:3000/api
```

未设置时前端自动使用内置 Mock 数据独立运行。

### 管理后台

访问 `http://localhost:3000/admin/index.html`
默认密码：`admin123`

### 生产部署

```bash
# 前端构建
cd front && npm run build    # 输出到 dist/

# 后端启动（使用PM2等进程管理）
cd backend && node server.js
```

---

## 十一、环境变量参考

### backend/.env

```
PORT=3000
JWT_SECRET=你的随机密钥
ADMIN_PASSWORD_HASH=bcrypt哈希值

# 本地存储模式（留空即本地存储）
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=photoweb
R2_PUBLIC_URL=

# 切换R2：填入以上5个参数，重启后端即可
```

### front/.env

```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 十二、移动端适配

断点：768px

| 桌面 | 移动端 |
|------|--------|
| 3列照片网格 | 单列 |
| 4列照片网格 | 2列 |
| 顶部导航栏 | 汉堡菜单 |
| 列表视图侧边栏 | 顶部下拉菜单 |
| 地图60vh | 全屏 |
| 表单多列 | 单列 |

---

## 十三、关键设计决策

1. **Sharp处理在内存中进行**，不产生临时文件（`multer.memoryStorage()`）
2. **上传失败自动回滚**：R2/本地上传失败 → 删已传文件；DB写入失败 → 删所有文件
3. **删除照片同步清理存储**：支持R2本地双模，用一个`storageKey()`函数统一提取文件路径
4. **前端自动切换Mock/真实API**：检测`VITE_API_BASE_URL`是否存在，组件代码零改动
5. **后端存储自动检测**：R2_ENDPOINT + AK + SK三者齐全才启用R2，否则本地存储
6. **城市坐标取平均值**：`AVG(latitude), AVG(longitude)` 确保地图标记在照片群中心
