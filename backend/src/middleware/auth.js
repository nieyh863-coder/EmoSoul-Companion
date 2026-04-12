const JWTUtil = require('../utils/jwt');
const ResponseUtil = require('../utils/response');

/**
 * JWT认证中间件
 */
const authMiddleware = async (ctx, next) => {
    // 获取Authorization头
    const authHeader = ctx.headers.authorization;

    if (!authHeader) {
        ResponseUtil.unauthorized(ctx, '缺少认证信息');
        return;
    }

    // 提取token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        ResponseUtil.unauthorized(ctx, '认证格式错误');
        return;
    }

    const token = parts[1];

    // 验证token
    const decoded = JWTUtil.verifyToken(token);
    if (!decoded) {
        ResponseUtil.unauthorized(ctx, '登录已过期，请重新登录');
        return;
    }

    // 检查token是否包含必要的字段
    if (!decoded.userId) {
        ResponseUtil.unauthorized(ctx, '无效的登录凭证，请重新登录');
        return;
    }

    // 将用户信息附加到上下文 - 确保userId是数字
    ctx.state.user = {
        ...decoded,
        userId: Number(decoded.userId)
    };
    ctx.state.token = token;

    await next();
};

module.exports = authMiddleware;