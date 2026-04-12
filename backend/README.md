# 语你相伴 - 后端开发文档

> 本文档面向后端开发人员，帮助你快速理解和参与项目开发

## 📋 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [目录结构](#目录结构)
- [开发规范](#开发规范)
- [添加新功能](#添加新功能)
- [API 接口规范](#api-接口规范)
- [数据库操作](#数据库操作)
- [常见问题](#常见问题)

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Koa | 2.15 | Web框架 |
| MySQL | 8.0 | 数据库 |
| mysql2 | 3.9 | MySQL驱动 |
| JWT | 9.0 | 身份认证 |
| bcrypt | 5.1 | 密码加密 |
| Joi | 17.12 | 参数校验 |

---

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0
- Git

### 2. 安装 MySQL

```bash
# macOS (使用 Homebrew)
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt-get install mysql-server
sudo systemctl start mysql

# Windows
# 下载 MySQL Installer 安装
```

### 3. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE yu_ni_xiang_ban CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选，也可以用 root）
CREATE USER 'yuni'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON yu_ni_xiang_ban.* TO 'yuni'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 4. 安装依赖

```bash
cd backend
npm install
```

### 5. 配置环境变量

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env 文件，修改数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=yu_ni_xiang_ban
```

### 6. 启动开发服务器

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

服务器启动后访问：http://localhost:3001/api/health

---

## 📐 项目架构

```
请求流程：

HTTP Request
    ↓
CORS中间件 (跨域处理)
    ↓
Logger中间件 (请求日志)
    ↓
BodyParser (解析请求体)
    ↓
Router (路由分发)
    ↓
Validator中间件 (参数校验)
    ↓
Auth中间件 (JWT认证)
    ↓
LoginLimiter中间件 (登录限流)
    ↓
Controller (控制器)
    ↓
Service (业务逻辑)
    ↓
Model (数据模型)
    ↓
MySQL 数据库
```

---

## 📂 目录结构

```
src/
├── config/                 # 配置层
│   └── database.js         # MySQL连接池配置
│
├── controllers/            # 控制器层 - 处理请求响应
│   ├── authController.js   # 认证相关（登录/注册/退出）
│   ├── userController.js   # 用户相关（信息/头像/密码）
│   └── chatController.js   # 对话相关（消息/历史）
│
├── middleware/             # 中间件层 - 横切关注点
│   ├── auth.js             # JWT认证中间件
│   ├── cors.js             # 跨域处理
│   ├── errorHandler.js     # 全局错误处理
│   ├── logger.js           # 请求日志
│   ├── loginLimiter.js     # 登录限流防刷
│   └── validator.js        # 参数校验中间件
│
├── models/                 # 数据层 - 数据库操作
│   ├── userModel.js        # 用户表操作
│   └── conversationModel.js # 对话记录操作
│
├── routes/                 # 路由层 - API定义
│   └── index.js            # 所有路由配置
│
├── services/               # 服务层 - 核心业务逻辑
│   ├── userService.js      # 用户业务（注册/登录/修改）
│   └── chatService.js      # 对话业务（AI回复/情绪分析）
│
├── utils/                  # 工具层 - 通用函数
│   ├── crypto.js           # 密码加密工具
│   ├── jwt.js              # JWT工具
│   ├── response.js         # 统一响应格式
│   └── validator.js        # 验证工具
│
└── app.js                  # 应用入口
```

---

## 📝 开发规范

### 1. 代码风格

- 使用 ES6+ 语法
- 异步使用 `async/await`
- 错误处理使用 `try/catch`

### 2. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件 | 小驼峰 | `userController.js` |
| 类名 | 大驼峰 | `UserService` |
| 方法 | 小驼峰 | `getUserById()` |
| 常量 | 全大写 | `JWT_SECRET` |
| 私有方法 | 下划线开头 | `_privateMethod()` |

### 3. 错误处理

所有错误通过 `errorHandler` 中间件统一处理：

```javascript
// 控制器中抛出错误
throw { status: 400, message: '参数错误' };

// 或使用标准错误
const error = new Error('用户不存在');
error.status = 404;
throw error;
```

### 4. 响应格式

统一使用 `ResponseUtil`：

```javascript
const ResponseUtil = require('../utils/response');

// 成功响应
ResponseUtil.success(ctx, data, '操作成功');

// 错误响应
ResponseUtil.error(ctx, '操作失败', 500, 200);
ResponseUtil.badRequest(ctx, '参数错误');
ResponseUtil.unauthorized(ctx, '未登录');
```

响应格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ➕ 添加新功能

以"添加用户积分功能"为例：

### 1. 修改数据表 (models/userModel.js)

```javascript
// 初始化时添加字段（在 initDatabase 中）
await query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 COMMENT '积分'
`);

// 添加操作方法
static async updatePoints(id, points) {
  return await this.update(id, { points });
}
```

### 2. 添加业务逻辑 (services/userService.js)

```javascript
// 添加积分
static async addPoints(userId, points) {
  const user = await this.getUserInfo(userId);
  const newPoints = (user.points || 0) + points;
  await UserModel.updatePoints(userId, newPoints);
  return { points: newPoints };
}
```

### 3. 添加控制器 (controllers/userController.js)

```javascript
static async addPoints(ctx) {
  const { userId } = ctx.state.user;
  const { points } = ctx.request.body;
  
  const result = await UserService.addPoints(userId, points);
  ResponseUtil.success(ctx, result, '积分添加成功');
}
```

### 4. 添加路由 (routes/index.js)

```javascript
router.post(
  '/user/points',
  authMiddleware,
  validateMiddleware(schemas.addPoints),
  UserController.addPoints
);
```

### 5. 添加校验规则 (utils/validator.js)

```javascript
addPoints: Joi.object({
  points: Joi.number().integer().min(1).required()
})
```

---

## 🔌 API 接口规范

### 基础信息

- 基础URL: `http://localhost:3001/api`
- 所有请求/响应均为 JSON 格式
- 时间格式: ISO 8601 (`2024-01-01T00:00:00.000Z`)

### 认证方式

在请求头中添加：
```
Authorization: Bearer <token>
```

### 接口列表

#### 认证相关

| 方法 | 路径 | 描述 | 需认证 |
|------|------|------|--------|
| POST | `/auth/register` | 用户注册 | 否 |
| POST | `/auth/login` | 用户登录 | 否 |
| POST | `/auth/logout` | 退出登录 | 是 |
| POST | `/auth/refresh` | 刷新Token | 是 |

#### 用户相关

| 方法 | 路径 | 描述 | 需认证 |
|------|------|------|--------|
| GET | `/user/profile` | 获取用户信息 | 是 |
| PUT | `/user/nickname` | 修改昵称 | 是 |
| PUT | `/user/avatar` | 更新头像 | 是 |
| PUT | `/user/password` | 修改密码 | 是 |

#### 对话相关

| 方法 | 路径 | 描述 | 需认证 |
|------|------|------|--------|
| POST | `/chat/message` | 发送消息 | 是 |
| GET | `/chat/history` | 获取历史 | 是 |
| GET | `/chat/poll` | 轮询消息 | 是 |
| DELETE | `/chat/history` | 清空历史 | 是 |

### 请求示例

```bash
# 注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138000",
    "password": "password123",
    "confirmPassword": "password123",
    "nickname": "小明"
  }'

# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138000",
    "password": "password123"
  }'

# 发送消息（需替换token）
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "你好呀"}'
```

---

## 💾 数据库操作

### MySQL 连接配置

编辑 `.env` 文件：
```
DB_HOST=localhost      # 数据库地址
DB_PORT=3306          # 端口
DB_USER=root          # 用户名
DB_PASSWORD=密码       # 密码
DB_NAME=yu_ni_xiang_ban  # 数据库名
```

### 常用操作

```bash
# 登录 MySQL
mysql -u root -p

# 选择数据库
USE yu_ni_xiang_ban;

# 查看所有表
SHOW TABLES;

# 查看表结构
DESCRIBE users;

# 查询数据
SELECT * FROM users;
SELECT * FROM conversations WHERE user_id = 1;

# 退出
EXIT;
```

### 表结构

**users 表**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account VARCHAR(255) UNIQUE NOT NULL COMMENT '账号',
  password VARCHAR(255) NOT NULL COMMENT '加密密码',
  nickname VARCHAR(16) NOT NULL COMMENT '昵称',
  avatar TEXT DEFAULT '' COMMENT '头像URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_account (account)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**conversations 表**
```sql
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  message TEXT NOT NULL COMMENT '用户消息',
  response TEXT COMMENT 'AI回复',
  emotion VARCHAR(20) DEFAULT 'gentle' COMMENT '情绪标签',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 在代码中执行 SQL

```javascript
const { query, transaction } = require('../config/database');

// 简单查询
const users = await query('SELECT * FROM users WHERE id = ?', [1]);

// 插入数据
const result = await query(
  'INSERT INTO users (account, password) VALUES (?, ?)',
  ['test@example.com', 'hashed_password']
);
console.log('插入ID:', result.insertId);

// 事务
await transaction(async (connection) => {
  await connection.execute('INSERT INTO table1 ...');
  await connection.execute('UPDATE table2 ...');
});
```

---

## ❓ 常见问题

### 1. 安装依赖失败

```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. 数据库连接失败

```bash
# 检查 MySQL 是否运行
# macOS
brew services list

# Linux
sudo systemctl status mysql

# 检查配置是否正确
# 确保 .env 中的 DB_PASSWORD 正确
```

### 3. 数据库不存在

```bash
# 登录 MySQL 创建数据库
mysql -u root -p
CREATE DATABASE yu_ni_xiang_ban CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. 端口被占用

```bash
# 查看占用端口的进程
lsof -i :3001

# 终止进程
kill -9 <PID>

# 或修改 .env 中的 PORT
```

### 5. JWT 验证失败

- 检查 `Authorization` 头格式是否正确
- 检查 Token 是否过期
- 检查 `JWT_SECRET` 配置是否一致

### 6. 跨域问题

修改 `.env` 中的 `ALLOWED_ORIGINS`，添加前端域名：
```
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 🐛 调试技巧

### 1. 查看日志

所有请求会自动记录到控制台，格式：
```
[请求日志] {"method":"POST","url":"/api/auth/login","status":200,...}
```

### 2. 查看 SQL 执行

在 `database.js` 中添加：
```javascript
const pool = mysql.createPool({
  ...dbConfig,
  debug: true  // 开启调试
});
```

### 3. 添加断点

```javascript
// 在代码中添加 debugger
debugger;

// 或使用 console.log
console.log('调试信息:', data);
```

### 4. 使用 Postman/Apifox

导入接口进行测试，比 curl 更方便。

---

## 🐳 Docker 部署（含MySQL）

```bash
# 一键启动应用+MySQL
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

---

## 📞 联系开发者

有问题可以在项目 Issues 中提出，或联系项目负责人。

---

**Happy Coding! 🎉**
