/**
 * 统一响应工具
 */

class ResponseUtil {
    // 成功响应
    static success(ctx, data = null, message = '操作成功') {
        ctx.status = 200;
        ctx.body = {
            code: 200,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    // 错误响应
    static error(ctx, message = '操作失败', code = 500, status = 200) {
        ctx.status = status;
        ctx.body = {
            code,
            message,
            data: null,
            timestamp: new Date().toISOString()
        };
    }

    // 参数错误
    static badRequest(ctx, message = '参数错误') {
        this.error(ctx, message, 400, 200);
    }

    // 未授权
    static unauthorized(ctx, message = '未授权，请先登录') {
        this.error(ctx, message, 401, 200);
    }

    // 禁止访问
    static forbidden(ctx, message = '禁止访问') {
        this.error(ctx, message, 403, 200);
    }

    // 资源不存在
    static notFound(ctx, message = '资源不存在') {
        this.error(ctx, message, 404, 200);
    }

    // 服务器错误
    static serverError(ctx, message = '服务器内部错误') {
        this.error(ctx, message, 500, 200);
    }
}

module.exports = ResponseUtil;