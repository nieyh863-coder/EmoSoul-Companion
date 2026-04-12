const UserService = require('../services/userService');
const ResponseUtil = require('../utils/response');

/**
 * 认证控制器
 * 处理登录、注册、退出等认证相关请求
 */
class AuthController {
    /**
     * 用户注册
     * POST /api/auth/register
     */
    static async register(ctx) {
        const { account, password, confirmPassword, nickname } = ctx.request.body;

        const result = await UserService.register({
            account,
            password,
            confirmPassword,
            nickname
        });

        ResponseUtil.success(ctx, result, '注册成功');
    }

    /**
     * 用户登录
     * POST /api/auth/login
     */
    static async login(ctx) {
        const { account, password, rememberMe } = ctx.request.body;

        const result = await UserService.login({
            account,
            password,
            rememberMe
        });

        ResponseUtil.success(ctx, result, '登录成功');
    }

    /**
     * 用户退出登录
     * POST /api/auth/logout
     */
    static async logout(ctx) {
        const token = ctx.state.token;
        await UserService.logout(token);
        ResponseUtil.success(ctx, null, '退出登录成功');
    }

    /**
     * 刷新Token
     * POST /api/auth/refresh
     */
    static async refreshToken(ctx) {
        const { userId, account, nickname } = ctx.state.user;

        // 生成新token
        const JWTUtil = require('../utils/jwt');
        const newToken = JWTUtil.generateToken({
            userId,
            account,
            nickname
        });

        ResponseUtil.success(ctx, { token: newToken }, 'Token刷新成功');
    }
}

module.exports = AuthController;