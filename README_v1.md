# Photography Portfolio

个人摄影作品展示网站，基于 React + TypeScript + Tailwind CSS 构建。

## 启动项目

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 构建部署

```bash
npm run build
npm run preview
```

## 对接真实后端

设置环境变量 `VITE_API_BASE_URL` 指向你的后端 API 地址：

```bash
# .env
VITE_API_BASE_URL=https://your-api.com/api
```

API 接口需实现以下端点：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/photos | 获取所有照片 |
| GET | /api/photos/:id | 获取单张照片详情 |
| GET | /api/cities | 获取城市列表 |
| GET | /api/photos/city/:name | 按城市获取照片 |
| GET | /api/photos/featured | 获取精选照片 |

当未设置 `VITE_API_BASE_URL` 时，项目自动使用内置 Mock 数据运行。

## 项目结构

```
src/
├── api/          # 接口定义与请求封装
├── components/   # 通用组件
├── pages/        # 页面组件
├── mock/         # 模拟数据
├── utils/        # 工具函数
├── styles/       # 全局样式
├── App.tsx       # 路由配置
└── main.tsx      # 入口文件
```

## 技术栈

- React 18 + TypeScript
- Tailwind CSS v3
- Framer Motion（动画）
- Leaflet + react-leaflet（地图）
- Axios（网络请求）
- React Router v6（路由）
- Vite（构建工具）
