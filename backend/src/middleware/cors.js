/**
 * 跨域中间件配置
 */
const corsMiddleware = async (ctx, next) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim());

    const origin = ctx.headers.origin;

    // 允许特定域名或本地开发
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
        ctx.set('Access-Control-Allow-Origin', origin || '*');
    }

    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Max-Age', '86400');

    // 处理预检请求
    if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
        return;
    }

    await next();
};

module.exports = corsMiddleware;