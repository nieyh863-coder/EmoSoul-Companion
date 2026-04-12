# 语你相伴 - 前端开发文档

> 本文档面向前端开发人员，帮助你快速理解和参与项目开发

## 📋 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [目录结构](#目录结构)
- [开发规范](#开发规范)
- [组件开发](#组件开发)
- [状态管理](#状态管理)
- [API调用](#api调用)
- [常见问题](#常见问题)

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2 | UI框架 |
| React Router | 6.21 | 路由管理 |
| Zustand | 4.4 | 状态管理 |
| Axios | 1.6 | HTTP请求 |
| react-cropper | 2.3 | 头像裁剪 |
| react-hot-toast | 2.4 | 消息提示 |

---

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器（Chrome/Firefox/Safari/Edge）

### 2. 安装依赖

```bash
cd frontend
npm install
```

### 3. 配置环境变量

```bash
# 复制示例配置（如果有）
cp .env.example .env

# 修改 API 地址（默认已配置）
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. 启动开发服务器

```bash
npm start
```

访问：http://localhost:3000

---

## 📐 项目架构

```
应用架构：

src/
├── 页面层 (Pages)
│   └── 路由级组件，负责页面整体布局
│
├── 组件层 (Components)
│   └── 可复用 UI 组件
│
├── 状态层 (Store)
│   └── Zustand 状态管理
│
├── 服务层 (Services)
│   └── API 接口封装
│
└── 工具层 (Utils)
    └── 通用工具函数

数据流：

用户操作 → 组件 → Store/Service → API → 后端
                    ↓
              更新 Store
                    ↓
              组件重新渲染
```

---

## 📂 目录结构

```
src/
├── assets/                 # 静态资源
│   ├── images/             # 图片
│   └── svgs/               # SVG图标
│
├── components/             # 组件层 - 可复用UI组件
│   ├── AvatarCropper/      # 头像裁剪组件
│   │   ├── index.jsx
│   │   └── AvatarCropper.css
│   ├── ChatMessage/        # 聊天消息组件
│   │   ├── index.jsx
│   │   └── ChatMessage.css
│   └── DigitalAvatar/      # 数字人组件
│       └── index.jsx
│
├── hooks/                  # 自定义 Hooks (预留)
│
├── pages/                  # 页面层 - 路由对应页面
│   ├── Home/               # 主页（对话页）
│   │   ├── index.jsx
│   │   └── Home.css
│   ├── Login/              # 登录页
│   │   ├── index.jsx
│   │   └── Login.css
│   ├── Profile/            # 个人中心
│   │   ├── index.jsx
│   │   └── Profile.css
│   └── Register/           # 注册页
│       ├── index.jsx
│       └── Register.css
│
├── services/               # 服务层 - API封装
│   ├── authService.js      # 认证相关API
│   ├── chatService.js      # 对话相关API
│   └── userService.js      # 用户相关API
│
├── store/                  # 状态管理层
│   ├── authStore.js        # 认证状态
│   └── chatStore.js        # 对话状态
│
├── styles/                 # 样式层
│   ├── global.css          # 全局样式
│   └── Avatar.css          # 头像组件样式
│
├── utils/                  # 工具层
│   ├── request.js          # Axios封装
│   ├── storage.js          # 本地存储工具
│   └── validator.js        # 表单验证
│
├── App.jsx                 # 应用入口（路由配置）
└── index.js                # 项目入口
```

---

## 📝 开发规范

### 1. 代码风格

- 使用函数组件 + Hooks
- 组件使用大驼峰命名
- 使用 JSX 语法

### 2. 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | 大驼峰 | `DigitalAvatar.jsx` |
| 页面 | 大驼峰 | `Login/index.jsx` |
| 样式 | 小写+连字符 | `chat-message.css` |
| 工具 | 小驼峰 | `validator.js` |

### 3. 组件结构

```jsx
// 1. 导入
import React, { useState, useEffect } from 'react';
import './Component.css';

// 2. 组件定义
const ComponentName = ({ prop1, prop2 }) => {
  // 3. Hooks
  const [state, setState] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    // 副作用
  }, []);
  
  // 5. 事件处理
  const handleClick = () => {
    // 处理逻辑
  };
  
  // 6. 渲染
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

// 7. 导出
export default ComponentName;
```

### 4. CSS 规范

使用 CSS Modules 风格的命名：

```css
/* 使用 BEM 命名法 */
.block { }
.block__element { }
.block--modifier { }

/* 示例 */
.login-page { }
.login-page__form { }
.login-page__form--error { }
```

CSS 变量定义在 `global.css`：
```css
:root {
  --primary-color: #8B5CF6;
  --text-primary: #1F2937;
}
```

---

## 🧩 组件开发

### 添加新组件

以"添加用户卡片组件"为例：

#### 1. 创建组件目录和文件

```bash
mkdir src/components/UserCard
touch src/components/UserCard/index.jsx
touch src/components/UserCard/UserCard.css
```

#### 2. 编写组件代码

```jsx
// src/components/UserCard/index.jsx
import React from 'react';
import './UserCard.css';

const UserCard = ({ user, onClick }) => {
  return (
    <div className="user-card" onClick={onClick}>
      <img src={user.avatar} alt={user.nickname} />
      <div className="user-card__info">
        <h3>{user.nickname}</h3>
        <p>{user.account}</p>
      </div>
    </div>
  );
};

export default UserCard;
```

#### 3. 编写样式

```css
/* src/components/UserCard/UserCard.css */
.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
}

.user-card:hover {
  box-shadow: var(--shadow-md);
}
```

#### 4. 使用组件

```jsx
import UserCard from '../../components/UserCard';

// 在页面中使用
<UserCard user={user} onClick={handleClick} />
```

---

## 🏪 状态管理

使用 Zustand 进行状态管理。

### 添加新状态

以"添加主题状态"为例：

```jsx
// src/store/themeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // 状态
      theme: 'light',
      
      // Actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: 'theme-storage'
    }
  )
);
```

### 在组件中使用

```jsx
import { useThemeStore } from '../store/themeStore';

const Component = () => {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <button onClick={toggleTheme}>
      当前主题: {theme}
    </button>
  );
};
```

---

## 🔌 API调用

### 添加新接口

```javascript
// src/services/otherService.js
import request from '../utils/request';

export const otherApi = {
  getData: () => request.get('/other/data'),
  postData: (data) => request.post('/other/data', data),
};

export default otherApi;
```

### 在组件中调用

```jsx
import { otherApi } from '../services/otherService';

const Component = () => {
  const fetchData = async () => {
    try {
      const result = await otherApi.getData();
      console.log(result.data);
    } catch (error) {
      // 错误已在拦截器处理
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
};
```

### 错误处理

请求错误已在 `request.js` 拦截器中统一处理：
- 401：清除登录状态，跳转登录页
- 其他：显示 toast 错误提示

---

## 📱 响应式开发

### 断点设置

```css
/* 移动优先 */
/* 基础样式（移动端） */
.component { }

/* 平板 */
@media (min-width: 768px) {
  .component { }
}

/* 桌面 */
@media (min-width: 1024px) {
  .component { }
}
```

### 常用响应式类

```css
/* 全局响应式类 */
@media (max-width: 768px) {
  /* 移动端隐藏 */
  .hidden-mobile {
    display: none !important;
  }
}

@media (min-width: 769px) {
  /* PC端隐藏 */
  .hidden-desktop {
    display: none !important;
  }
}
```

---

## 🎨 UI/UX 规范

### 颜色使用

```css
/* 主色调 */
background: var(--primary-color);  /* 紫色 */

/* 背景 */
background: var(--bg-primary);     /* 主背景 */
background: var(--bg-card);        /* 卡片背景 */

/* 文字 */
color: var(--text-primary);        /* 主要文字 */
color: var(--text-secondary);      /* 次要文字 */
```

### 按钮样式

```jsx
// 主按钮
<button className="btn btn-primary">主要按钮</button>

// 次要按钮
<button className="btn btn-secondary">次要按钮</button>

// 危险按钮
<button className="btn btn-secondary logout-btn">危险操作</button>
```

### 表单输入

```jsx
<input className="input" placeholder="提示文字" />

// 错误状态
<input className="input input-error" />
<span className="error-text">错误信息</span>
```

---

## ❓ 常见问题

### 1. 代理配置（解决跨域）

已在 `package.json` 中配置：
```json
{
  "proxy": "http://localhost:3001"
}
```

如需修改，编辑 `package.json` 或使用 `setupProxy.js`。

### 2. 图片无法显示

- 确保图片放在 `public` 或 `src/assets` 目录
- `public` 下的图片使用绝对路径：`/images/logo.png`
- `src/assets` 下的图片需要 `import`：
  ```jsx
  import logo from '../assets/images/logo.png';
  <img src={logo} />
  ```

### 3. 样式不生效

- 检查 CSS 文件是否正确引入
- 检查类名是否拼写正确
- 使用浏览器 DevTools 检查元素样式

### 4. 状态不更新

Zustand 状态更新必须使用 `set`：
```javascript
// ❌ 错误
state.value = newValue;

// ✅ 正确
set({ value: newValue });
```

### 5. 路由跳转失败

```jsx
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/path');        // 跳转
    navigate(-1);             // 返回
    navigate('/path', { replace: true }); // 替换当前历史
  };
};
```

---

## 🐛 调试技巧

### 1. React DevTools

安装浏览器扩展，查看组件树和状态。

### 2. 网络请求调试

打开浏览器 DevTools → Network 标签，查看 API 请求。

### 3. 日志输出

```javascript
console.log('普通日志', data);
console.warn('警告', data);
console.error('错误', data);
console.table(数组数据);
```

### 4. 断点调试

在代码中写 `debugger;`，打开 DevTools 会自动断点。

---

## 📦 构建部署

```bash
# 构建生产版本
npm run build

# 构建产物在 build/ 目录
# 可将 build/ 目录内容部署到任何静态服务器
```

---

## 📚 学习资源

- [React 官方文档](https://react.dev/)
- [React Router 文档](https://reactrouter.com/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)
- [Axios 文档](https://axios-http.com/)

---

## 📞 联系开发者

有问题可以在项目 Issues 中提出，或联系项目负责人。

---

**Happy Coding! 🎉**
