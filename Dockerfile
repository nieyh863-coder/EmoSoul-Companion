# 多阶段构建 - 前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 多阶段构建 - 后端
FROM node:18-alpine AS backend
WORKDIR /app

# 复制后端代码
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/build ./public

# 环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", "src/app.js"]
