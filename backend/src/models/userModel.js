const { query } = require('../config/database');

/**
 * 用户数据模型
 */
class UserModel {
    /**
     * 根据ID查找用户
     */
    static async findById(id) {
        const results = await query(
            'SELECT id, account, nickname, avatar, created_at, updated_at FROM users WHERE id = ?',
            [Number(id)]
        );
        return results[0] || null;
    }

    /**
     * 根据账号查找用户（包含密码）
     */
    static async findByAccountWithPassword(account) {
        const results = await query(
            'SELECT * FROM users WHERE account = ?',
            [account]
        );
        return results[0] || null;
    }

    /**
     * 根据账号查找用户（不包含密码）
     */
    static async findByAccount(account) {
        const results = await query(
            'SELECT id, account, nickname, avatar, created_at, updated_at FROM users WHERE account = ?',
            [account]
        );
        return results[0] || null;
    }

    /**
     * 检查账号是否存在
     */
    static async isAccountExists(account) {
        const user = await this.findByAccount(account);
        return !!user;
    }

    /**
     * 创建用户
     */
    static async create({ account, password, nickname, avatar = '' }) {
        const result = await query(
            'INSERT INTO users (account, password, nickname, avatar) VALUES (?, ?, ?, ?)',
            [account, password, nickname, avatar || null]
        );
        return { id: result.insertId };
    }

    /**
     * 更新用户信息
     */
    static async update(id, updates) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(Number(id));

        const result = await query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return { changes: result.affectedRows };
    }

    /**
     * 更新密码
     */
    static async updatePassword(id, password) {
        const result = await query(
            'UPDATE users SET password = ? WHERE id = ?',
            [password, Number(id)]
        );
        return { changes: result.affectedRows };
    }

    /**
     * 更新头像
     */
    static async updateAvatar(id, avatar) {
        return await this.update(id, { avatar });
    }

    /**
     * 更新昵称
     */
    static async updateNickname(id, nickname) {
        return await this.update(id, { nickname });
    }
}

module.exports = UserModel;