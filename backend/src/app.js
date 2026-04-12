const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const { initDatabase } = require('./config/database');
const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const loggerMiddleware = require('./middleware/logger');
const corsMiddleware = require('./middleware/cors');
const JWTUtil = require('./utils/jwt');
const ConversationModel = require('./models/conversationModel');

const app = new Koa();
const PORT = process.env.PORT || 3001;

// 全局错误处理
app.use(errorHandler);

// 日志中间件
app.use(loggerMiddleware);

// 跨域中间件
app.use(corsMiddleware);

// 请求体解析
app.use(bodyParser({
    enableTypes: ['json', 'form'],
    jsonLimit: '10mb',
    formLimit: '10mb'
}));

// 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 定期清理过期的Token黑名单
setInterval(() => {
    JWTUtil.cleanExpiredTokens().catch(console.error);
}, 24 * 60 * 60 * 1000); // 每天清理一次

// 启动服务器
async function startServer() {
    try {
        // 初始化数据库
        await initDatabase();
        console.log('数据库初始化完成');

        // 启动时清理过期对话
        try {
            const { deletedCount } = await ConversationModel.deleteExpired();
            if (deletedCount > 0) {
                console.log(`已清理 ${deletedCount} 条过期对话记录`);
            }
        } catch (err) {
            console.error('清理过期对话失败:', err.message);
        }

        // 每24小时定时清理
        setInterval(async () => {
            try {
                const { deletedCount } = await ConversationModel.deleteExpired();
                if (deletedCount > 0) {
                    console.log(`[定时清理] 已清理 ${deletedCount} 条过期对话记录`);
                }
            } catch (err) {
                console.error('[定时清理] 清理过期对话失败:', err.message);
            }
        }, 24 * 60 * 60 * 1000);

        // 启动服务
        app.listen(PORT, () => {
            console.log(`
  ╔════════════════════════════════════════════════════╗
  ║                                                    ║
  ║   🌸 语你相伴 - AI情感陪护虚拟数字人 🌸                ║
  ║                                                    ║
  ║   后端服务已启动                                     ║
  ║   服务地址: http://localhost:${PORT}                ║
  ║   API文档: http://localhost:${PORT}/api/health      ║
  ║                                                    ║
  ╚════════════════════════════════════════════════════╝
        `);
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;