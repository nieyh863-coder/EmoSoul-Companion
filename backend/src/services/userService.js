const UserModel = require('../models/userModel');
const CryptoUtil = require('../utils/crypto');
const JWTUtil = require('../utils/jwt');
const { ValidatorUtil } = require('../utils/validator');

/**
 * 用户服务层
 * 处理用户相关的业务逻辑
 */
class UserService {
    /**
     * 用户注册
     */
    static async register({ account, password, confirmPassword, nickname }) {
        // 验证账号格式
        const accountValidation = ValidatorUtil.validateAccount(account);
        if (!accountValidation.valid) {
            throw { status: 400, message: '账号必须是手机号或邮箱格式' };
        }

        // 验证密码强度
        const passwordValidation = ValidatorUtil.validatePassword(password);
        if (!passwordValidation.valid) {
            throw { status: 400, message: passwordValidation.message };
        }

        // 验证密码一致性
        if (password !== confirmPassword) {
            throw { status: 400, message: '两次密码输入不一致' };
        }

        // 验证昵称
        const nicknameValidation = ValidatorUtil.validateNickname(nickname);
        if (!nicknameValidation.valid) {
            throw { status: 400, message: nicknameValidation.message };
        }

        // 检查账号是否已存在
        const exists = await UserModel.isAccountExists(account);
        if (exists) {
            throw { status: 409, message: '该账号已被注册' };
        }

        // 密码加密
        const hashedPassword = await CryptoUtil.hashPassword(password);

        // 创建用户
        const result = await UserModel.create({
            account,
            password: hashedPassword,
            nickname,
            avatar: ''
        });

        return {
            id: result.id,
            account,
            nickname
        };
    }

    /**
     * 用户登录
     */
    static async login({ account, password, rememberMe = false }) {
        // 查找用户
        const user = await UserModel.findByAccountWithPassword(account);
        if (!user) {
            throw { status: 401, message: '账号或密码错误' };
        }

        // 验证密码
        const isPasswordValid = await CryptoUtil.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw { status: 401, message: '账号或密码错误' };
        }

        // 生成JWT Token
        const token = JWTUtil.generateToken({
            userId: user.id,
            account: user.account,
            nickname: user.nickname
        },
            rememberMe
        );

        return {
            token,
            user: {
                id: user.id,
                account: user.account,
                nickname: user.nickname,
                avatar: user.avatar
            }
        };
    }

    /**
     * 用户退出登录
     */
    static async logout(token) {
        // 将token加入黑名单
        await JWTUtil.blacklistToken(token);
        return true;
    }

    /**
     * 获取用户信息
     */
    static async getUserInfo(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw { status: 404, message: '用户不存在' };
        }
        return user;
    }

    /**
     * 更新用户信息
     */
    static async updateUser(userId, updates) {
        const result = await UserModel.update(userId, updates);
        if (result.changes === 0) {
            throw { status: 404, message: '用户不存在或没有变化' };
        }
        return await UserModel.findById(userId);
    }

    /**
     * 更新昵称
     */
    static async updateNickname(userId, nickname) {
        const validation = ValidatorUtil.validateNickname(nickname);
        if (!validation.valid) {
            throw { status: 400, message: validation.message };
        }
        return await this.updateUser(userId, { nickname });
    }

    /**
     * 更新头像
     */
    static async updateAvatar(userId, avatar) {
        return await this.updateUser(userId, { avatar });
    }

    /**
     * 修改密码
     */
    static async updatePassword(userId, oldPassword, newPassword) {
        // 验证新密码强度
        const passwordValidation = ValidatorUtil.validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw { status: 400, message: passwordValidation.message };
        }

        // 获取用户（包含密码）
        const user = await UserModel.findById(userId);
        if (!user) {
            throw { status: 404, message: '用户不存在' };
        }

        const userWithPassword = await UserModel.findByAccountWithPassword(user.account);

        // 验证原密码
        const isOldPasswordValid = await CryptoUtil.comparePassword(oldPassword, userWithPassword.password);
        if (!isOldPasswordValid) {
            throw { status: 401, message: '原密码错误' };
        }

        // 加密新密码
        const hashedNewPassword = await CryptoUtil.hashPassword(newPassword);

        // 更新密码
        await UserModel.updatePassword(userId, hashedNewPassword);

        return true;
    }

    /**
     * 获取数字人设置
     */
    static async getCompanionSettings(userId) {
        const settings = await UserModel.getCompanionSettings(userId);
        if (!settings) {
            throw { status: 404, message: '用户不存在' };
        }
        return {
            companion_name: settings.companion_name || '小伴',
            companion_personality: settings.companion_personality || 'warm',
            chat_style: settings.chat_style || 'friendly'
        };
    }

    /**
     * 更新数字人设置
     */
    static async updateCompanionSettings(userId, settings) {
        // 验证性格值
        const validPersonalities = ['lively', 'calm', 'humorous', 'warm', 'wise'];
        if (settings.companion_personality && !validPersonalities.includes(settings.companion_personality)) {
            throw { status: 400, message: '无效的性格设定' };
        }

        // 验证对话风格
        const validStyles = ['professional', 'friendly', 'literary', 'casual'];
        if (settings.chat_style && !validStyles.includes(settings.chat_style)) {
            throw { status: 400, message: '无效的对话风格' };
        }

        // 验证名称长度
        if (settings.companion_name && settings.companion_name.length > 32) {
            throw { status: 400, message: '数字人名称不能超过32个字符' };
        }

        await UserModel.updateCompanionSettings(userId, settings);
        return await UserModel.getCompanionSettings(userId);
    }
}

module.exports = UserService;