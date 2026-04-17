const { getPool } = require('../config/database');
const ChatService = require('./chatService');
const EmotionDiaryService = require('./emotionDiaryService');

class ProactiveService {
    // 检查所有需要主动关怀的用户
    static async checkAndSendProactiveMessages() {
        try {
            console.log('[ProactiveService] 开始检查主动消息...');

            // 获取2小时内无活动的活跃用户（过去7天内有过对话的）
            const inactiveUsers = await this.getInactiveUsers(2);

            for (const user of inactiveUsers) {
                try {
                    await this.sendProactiveMessage(user);
                } catch (err) {
                    console.log(`[ProactiveService] 给用户 ${user.id} 发送主动消息失败:`, err.message);
                }
            }

            console.log(`[ProactiveService] 检查完成，处理了 ${inactiveUsers.length} 个用户`);
        } catch (error) {
            console.error('[ProactiveService] 检查失败:', error.message);
        }
    }

    // 获取不活跃但近期活跃的用户
    static async getInactiveUsers(inactiveHours = 2) {
        const pool = getPool();
        // 查找：过去7天内有对话，但最近 inactiveHours 小时没有新消息的用户
        // 且今天还没收到过主动消息的用户
        const [rows] = await pool.execute(`
      SELECT DISTINCT c.user_id as id, u.nickname, u.companion_name
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE c.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND c.user_id NOT IN (
          SELECT DISTINCT user_id FROM conversations 
          WHERE created_at > DATE_SUB(NOW(), INTERVAL ? HOUR)
        )
        AND c.user_id NOT IN (
          SELECT DISTINCT user_id FROM conversations 
          WHERE source = 'proactive' AND DATE(created_at) = CURDATE()
        )
      LIMIT 10
    `, [inactiveHours]);

        return rows;
    }

    // 为用户生成并发送主动消息
    static async sendProactiveMessage(user) {
        // 获取用户最近的情绪状态
        let emotionContext = '';
        try {
            const recentDiary = await EmotionDiaryService.getStats(user.id, 'weekly');
            if (recentDiary && recentDiary.distribution && recentDiary.distribution.length > 0) {
                const topEmotion = recentDiary.distribution[0];
                emotionContext = `用户最近一周的主要情绪是${topEmotion.emotion}（占${topEmotion.percentage}%）。`;
                if (recentDiary.overallTrend === 'declining') {
                    emotionContext += '情绪有下降趋势，请特别关心。';
                }
            }
        } catch (e) {
            // 忽略日记获取失败
        }

        // 获取当前时段
        const hour = new Date().getHours();
        let timeGreeting = '';
        if (hour >= 6 && hour < 9) timeGreeting = '早上好！新的一天开始了。';
        else if (hour >= 11 && hour < 13) timeGreeting = '中午了，记得吃饭哦。';
        else if (hour >= 17 && hour < 19) timeGreeting = '傍晚了，今天辛苦了。';
        else if (hour >= 21 && hour < 24) timeGreeting = '夜深了，注意休息哦。';
        else timeGreeting = '好久不见，想你了。';

        // 构建主动关怀信息（使用新的结构化格式）
        const companionName = user.companion_name || '小伴';
        const proactiveCare = `你是${companionName}，现在需要主动给用户发一条关怀消息。
${timeGreeting}
${emotionContext}
用户昵称：${user.nickname || '朋友'}
要求：
1. 消息要自然温暖，像朋友主动问候一样
2. 不要太长，1-3句话
3. 可以根据时间和用户情绪调整语气`;

        // 调用 Coze 生成消息（使用新的结构化格式）
        // source='proactive' 表示主动消息，proactiveCare 传递关怀信息
        const result = await ChatService.callCozeWorkflow(
            '', // user_message 为空，因为是主动消息
            'normal',
            user.id,
            null,
            'proactive',
            '', // userStatus
            proactiveCare // proactive_care 传递关怀信息
        );

        console.log(`[ProactiveService] 已向用户 ${user.id}(${user.nickname}) 发送主动消息:`, result.response.substring(0, 50) + '...');
    }
}

module.exports = ProactiveService;