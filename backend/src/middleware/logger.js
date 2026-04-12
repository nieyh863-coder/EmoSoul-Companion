/**
 * 请求日志中间件
 */
const loggerMiddleware = async (ctx, next) => {
    const start = Date.now();

    await next();

    const ms = Date.now() - start;
    const logData = {
        method: ctx.method,
        url: ctx.url,
        status: ctx.status,
        duration: `${ms}ms`,
        ip: ctx.ip,
        userAgent: ctx.headers['user-agent'],
        timestamp: new Date().toISOString()
    };

    // 根据状态码选择日志级别
    if (ctx.status >= 500) {
        console.error('[请求错误]', JSON.stringify(logData));
    } else if (ctx.status >= 400) {
        console.warn('[请求警告]', JSON.stringify(logData));
    } else {
        console.log('[请求日志]', JSON.stringify(logData));
    }
};

module.exports = loggerMiddleware;