const Joi = require('joi');

/**
 * 验证工具类
 */
class ValidatorUtil {
    /**
     * 验证手机号
     * @param {string} value 
     * @returns {boolean}
     */
    static isPhone(value) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(value);
    }

    /**
     * 验证邮箱
     * @param {string} value 
     * @returns {boolean}
     */
    static isEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    /**
     * 验证账号（手机号或邮箱）
     * @param {string} value 
     * @returns {{valid: boolean, type: string|null}}
     */
    static validateAccount(value) {
        if (this.isPhone(value)) {
            return { valid: true, type: 'phone' };
        }
        if (this.isEmail(value)) {
            return { valid: true, type: 'email' };
        }
        return { valid: false, type: null };
    }

    /**
     * 验证密码强度
     * - 长度≥8位
     * - 包含字母+数字/特殊字符
     * @param {string} password 
     * @returns {{valid: boolean, message: string}}
     */
    static validatePassword(password) {
        if (!password || password.length < 8) {
            return { valid: false, message: '密码长度至少8位' };
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasLetter) {
            return { valid: false, message: '密码必须包含字母' };
        }

        if (!hasNumber && !hasSpecial) {
            return { valid: false, message: '密码必须包含数字或特殊字符' };
        }

        return { valid: true, message: '密码强度符合要求' };
    }

    /**
     * 验证昵称
     * @param {string} nickname 
     * @returns {{valid: boolean, message: string}}
     */
    static validateNickname(nickname) {
        if (!nickname || nickname.length < 2) {
            return { valid: false, message: '昵称至少2个字符' };
        }
        if (nickname.length > 16) {
            return { valid: false, message: '昵称最多16个字符' };
        }
        return { valid: true, message: '昵称格式正确' };
    }
}

// Joi验证Schema
const schemas = {
    // 注册验证
    register: Joi.object({
        account: Joi.string().required().messages({
            'string.empty': '账号不能为空',
            'any.required': '账号是必填项'
        }),
        password: Joi.string().min(8).required().messages({
            'string.empty': '密码不能为空',
            'string.min': '密码长度至少8位',
            'any.required': '密码是必填项'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': '两次密码输入不一致',
            'any.required': '确认密码是必填项'
        }),
        nickname: Joi.string().min(2).max(16).required().messages({
            'string.empty': '昵称不能为空',
            'string.min': '昵称至少2个字符',
            'string.max': '昵称最多16个字符',
            'any.required': '昵称是必填项'
        })
    }),

    // 登录验证
    login: Joi.object({
        account: Joi.string().required().messages({
            'string.empty': '账号不能为空',
            'any.required': '账号是必填项'
        }),
        password: Joi.string().required().messages({
            'string.empty': '密码不能为空',
            'any.required': '密码是必填项'
        }),
        rememberMe: Joi.boolean().default(false)
    }),

    // 更新昵称
    updateNickname: Joi.object({
        nickname: Joi.string().min(2).max(16).required().messages({
            'string.empty': '昵称不能为空',
            'string.min': '昵称至少2个字符',
            'string.max': '昵称最多16个字符',
            'any.required': '昵称是必填项'
        })
    }),

    // 修改密码
    updatePassword: Joi.object({
        oldPassword: Joi.string().required().messages({
            'string.empty': '原密码不能为空',
            'any.required': '原密码是必填项'
        }),
        newPassword: Joi.string().min(8).required().messages({
            'string.empty': '新密码不能为空',
            'string.min': '新密码长度至少8位',
            'any.required': '新密码是必填项'
        })
    }),

    // 对话消息
    chatMessage: Joi.object({
        message: Joi.string().max(2000).required().messages({
            'string.empty': '消息内容不能为空',
            'string.max': '消息内容过长',
            'any.required': '消息内容是必填项'
        }),
        mode: Joi.string().valid('normal', 'vip').optional().default('normal')
    })
};

module.exports = { ValidatorUtil, schemas };