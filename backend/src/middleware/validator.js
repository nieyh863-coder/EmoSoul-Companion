const ResponseUtil = require('../utils/response');

/**
 * 请求参数验证中间件
 * @param {Object} schema - Joi验证Schema
 * @param {string} source - 参数来源 ('body', 'query', 'params')
 */
const validateMiddleware = (schema, source = 'body') => {
    return async (ctx, next) => {
        const data = ctx.request[source];

        const { error } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details.map(d => d.message).join(', ');
            ResponseUtil.badRequest(ctx, message);
            return;
        }

        await next();
    };
};

module.exports = validateMiddleware;