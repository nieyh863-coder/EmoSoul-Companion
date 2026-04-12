const ResponseUtil = require('../utils/response');

/**
 * 全局错误处理中间件
 */
const errorHandler = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error('服务器错误:', err);

        // 处理Joi验证错误
        if (err.name === 'ValidationError' || err.isJoi) {
            const message = err.details ? err.details[0].message : '参数验证失败';
            ResponseUtil.badRequest(ctx, message);
            return;
        }

        // 处理自定义错误
        if (err.status) {
            ResponseUtil.error(ctx, err.message, err.code || err.status, err.status);
            return;
        }

        // 默认服务器错误
        ResponseUtil.serverError(ctx, '服务器内部错误，请稍后重试');
    }
};

module.exports = errorHandler;