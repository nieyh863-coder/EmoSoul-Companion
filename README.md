# 语你相伴 - AI情感陪护虚拟数字人

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/Koa-2.15-green" alt="Koa">
  <img src="https://img.shields.io/badge/Node.js-18+-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-8.0-orange" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

## 项目介绍

「语你相伴」是一个面向用户的AI情感陪伴类全栈应用，通过虚拟数字人实现情感对话交互，为用户提供温暖的陪伴体验。

### 核心功能

- **用户系统**：支持手机号/邮箱注册登录，JWT认证，密码加密存储
- **数字人对话**：虚拟数字人根据对话内容展示不同情绪表情，支持实时对话
- **个人中心**：支持头像裁剪上传、昵称修改、密码修改
- **安全防护**：登录防刷、Token黑名单、接口参数校验

## 技术栈

### 前端
- React 18 + React Router 6
- Zustand 状态管理
- Axios HTTP请求
- react-cropper 头像裁剪
- react-hot-toast 消息提示

### 后端
- Koa 2.15 + Node.js
- MySQL 8.0 + mysql2
- JWT 认证
- bcrypt 密码加密
- Joi 参数校验

## 项目结构

```
.
├── backend/                # 后端项目
│   ├── src/
│   │   ├── config/         # 配置（MySQL连接等）
│   │   ├── controllers/    # 控制器层
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型层
│   │   ├── routes/         # 路由层
│   │   ├── services/       # 服务层
│   │   ├── utils/          # 工具函数
│   │   └── app.js          # 应用入口
│   ├── .env                # 环境变量
│   ├── .env.example        # 环境变量示例
│   ├── README.md           # 后端开发文档
│   └── package.json
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/     # 组件层
│   │   ├── pages/          # 页面层
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   ├── styles/         # 样式
│   │   ├── utils/          # 工具函数
│   │   ├── App.jsx         # 应用入口
│   │   └── index.js
│   ├── README.md           # 前端开发文档
│   └── package.json
├── Dockerfile              # Docker构建文件
├── docker-compose.yml      # Docker Compose配置（含MySQL）
├── nginx.conf              # Nginx配置
└── readme.md               # 项目文档
```

## 快速开始

### 环境要求
- Node.js 18+
- MySQL 8.0
- npm 或 yarn
- Docker (可选)

### 1. 克隆项目
```bash
git clone <repository-url>
cd yu-ni-xiang-ban
```

### 2. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE yu_ni_xiang_ban CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置数据库密码等配置

# 启动服务
npm run dev
```

后端启动在 http://localhost:3001

### 4. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端启动在 http://localhost:3000

### Docker 一键启动

```bash
# 启动应用+MySQL
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

## 开发文档

- [后端开发文档](backend/README.md) - 后端架构、API接口、数据库操作
- [前端开发文档](frontend/README.md) - 组件开发、状态管理、API调用

## 架构说明

### 后端分层架构

```
请求 → 路由层(routes) → 控制层(controllers) → 服务层(services) → 数据层(models)
         ↓                    ↓                      ↓
      中间件层(middleware)  工具层(utils)        MySQL数据库
```

### 前端分层架构

```
页面层(pages) → 组件层(components) → 工具层(utils)
     ↓                                    ↓
状态管理层(store) ←─────────────── API服务层(services)
```

## 核心特性详解

### 1. JWT认证机制
- 登录成功后签发Token，存储于localStorage
- 请求时携带Authorization头
- Token过期自动跳转登录页
- 支持无感刷新Token

### 2. 登录防刷机制
- 连续失败5次锁定账号15分钟
- 登录成功自动清除失败记录
- 基于MySQL记录，服务重启不影响

### 3. 数字人情绪系统
- 预设5种情绪表情：开心、温柔、思考、难过、惊讶
- 根据用户输入内容智能分析情绪
- 情绪切换带有平滑过渡动画

### 4. 头像裁剪功能
- 支持JPG/PNG格式
- 最大2MB限制
- 圆形裁剪预览
- 支持缩放、拖动调整

## 扩展开发

### 接入扣子工作流
修改 `backend/src/services/chatService.js`：

```javascript
static async callCozeWorkflow(userId, message, context = []) {
  // 替换为真实的扣子API调用
  const response = await axios.post('https://api.coze.com/workflow', {
    user_id: userId,
    message,
    context
  });
  
  return {
    response: response.data.content,
    emotion: response.data.emotion,
    timestamp: new Date().toISOString()
  };
}
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

## 许可证

[MIT](LICENSE)

---

<p align="center">Made with ❤️ by 语你相伴团队</p>
