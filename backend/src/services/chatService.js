const axios = require('axios');
const ConversationModel = require('../models/conversationModel');

/**
 * 对话服务层
 * 处理数字人对话相关的业务逻辑
 */
class ChatService {
    /**
     * 情绪映射函数
     * 将所有情绪值映射到 3 种有效值：thinking、sad、surprised
     * @param {string} emotion - 原始情绪值
     * @returns {string} - 映射后的情绪值
     */
    static mapToValidEmotion(emotion) {
        const emotionMap = {
            'happy': 'thinking',
            'gentle': 'thinking',
            'sad': 'sad',
            'surprised': 'surprised',
            'thinking': 'thinking'
        };
        return emotionMap[emotion] || 'thinking';
    }
    /**
     * 调用 Coze 工作流 API
     * @param {string} userId - 用户ID
     * @param {string} message - 用户消息
     * @param {Array} context - 对话上下文
     * @returns {Promise<{response: string, emotion: string, timestamp: string}>}
     */
    static async callCozeWorkflow(userId, message, context = [], mode = 'normal') {
        try {
            // 调用 Coze API
            const apiUrl = process.env.COZE_API_URL || 'https://bszwsh44nb.coze.site/run';
            const apiToken = process.env.COZE_API_TOKEN;

            const headers = {
                'Content-Type': 'application/json'
            };

            // 如果有配置 token，则添加到请求头
            if (apiToken) {
                headers['Authorization'] = `Bearer ${apiToken}`;
            }

            // 构建发送给 Coze 的用户输入
            let userInput;
            if (mode === 'vip' && context.length > 0) {
                // VIP模式：拼接历史对话上下文
                const historyText = context.map(item =>
                    `用户：${item.message}\nAI：${item.response}`
                ).join('\n');
                userInput = `[历史对话]\n${historyText}\n[当前消息]\n${message}`;
            } else {
                // 普通模式：仅当前消息
                userInput = message;
            }

            const response = await axios.post(
                apiUrl,
                { user_input: userInput },
                {
                    headers,
                    timeout: 30000 // 30秒超时
                }
            );

            // 解析 API 响应（兼容纯文本和 JSON 格式）
            let aiResponse;
            let emotion;

            if (typeof response.data === 'string') {
                aiResponse = response.data;
                // 纯文本响应，使用本地情绪分析
                emotion = this.mapToValidEmotion(this.analyzeEmotion(message));
            } else if (response.data && typeof response.data === 'object') {
                // 尝试从常见的响应字段中提取回复
                aiResponse = response.data.response ||
                    response.data.message ||
                    response.data.content ||
                    response.data.text ||
                    response.data.reply ||
                    JSON.stringify(response.data);

                // 优先使用 Coze 返回的 emotion 字段
                if (response.data.emotion) {
                    emotion = this.mapToValidEmotion(response.data.emotion);
                } else {
                    // Coze 没返回 emotion，降级使用本地分析
                    emotion = this.mapToValidEmotion(this.analyzeEmotion(message));
                }
            } else {
                aiResponse = String(response.data);
                emotion = this.mapToValidEmotion(this.analyzeEmotion(message));
            }

            // 保存对话记录
            await ConversationModel.create({
                userId,
                message,
                response: aiResponse,
                emotion
            });

            return {
                response: aiResponse,
                emotion,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Coze API 调用失败:', error.message);

            // API 调用失败时，使用本地备用回复
            const emotion = this.mapToValidEmotion(this.analyzeEmotion(message));
            const fallbackResponse = this.getRandomResponse(emotion);

            // 保存对话记录（使用备用回复）
            await ConversationModel.create({
                userId,
                message,
                response: fallbackResponse,
                emotion
            });

            return {
                response: fallbackResponse,
                emotion,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 获取随机备用回复
     * 当 Coze API 调用失败时使用
     */
    static getRandomResponse(emotion) {
        const responses = {
            thinking: [
                '让我想想这个问题...',
                '这是个很有意思的话题，我需要思考一下。',
                '嗯...你的问题值得深思。',
                '看到你开心我也很高兴呢！😊',
                '今天心情不错呀，有什么好事想和我分享吗？',
                '你的快乐感染到我了！',
                '我在呢，有什么想和我说的吗？',
                '无论什么时候，我都会陪伴在你身边。',
                '有什么烦恼都可以告诉我，我会认真倾听的。'
            ],
            sad: [
                '不要难过，我在这里陪着你。',
                '抱抱你，一切都会好起来的。',
                '如果你想哭就哭出来吧，我会一直陪着你。'
            ],
            surprised: [
                '哇，真的吗？',
                '这太让人惊讶了！',
                '真的没想到会这样！'
            ]
        };

        const emotionResponses = responses[emotion] || responses.thinking;
        return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    }

    /**
     * 简单的情绪分析
     * 实际项目中由扣子工作流返回
     * 返回值限定为 3 种：surprised/sad/thinking
     */
    static analyzeEmotion(message) {
        const positiveWords = ['开心', '快乐', '高兴', '棒', '好', '喜欢', '爱', '幸福', '哈哈', '嘻嘻'];
        const negativeWords = ['难过', '伤心', '痛苦', '哭', '糟糕', '烦', '累', '失望', '呜呜'];
        const questionWords = ['为什么', '怎么', '什么', '吗', '？', '?'];
        const surpriseWords = ['真的', '竟然', '居然', '哇', '天啊', '惊讶'];

        let score = { thinking: 1, sad: 0, surprised: 0 };

        positiveWords.forEach(word => {
            if (message.includes(word)) score.thinking += 2;
        });

        negativeWords.forEach(word => {
            if (message.includes(word)) score.sad += 2;
        });

        questionWords.forEach(word => {
            if (message.includes(word)) score.thinking += 1;
        });

        surpriseWords.forEach(word => {
            if (message.includes(word)) score.surprised += 2;
        });

        // 返回得分最高的情绪
        let maxEmotion = 'thinking';
        let maxScore = score.thinking;

        for (const [emotion, s] of Object.entries(score)) {
            if (s > maxScore) {
                maxScore = s;
                maxEmotion = emotion;
            }
        }

        return maxEmotion;
    }

    /**
     * 获取对话历史
     */
    static async getConversationHistory(userId, limit = 50, offset = 0) {
        return await ConversationModel.getHistoryByUserId(userId, limit, offset);
    }

    /**
     * 获取对话上下文
     */
    static async getConversationContext(userId, limit = 10) {
        return await ConversationModel.getRecentContext(userId, limit);
    }

    /**
     * 轮询获取最新回复
     * 前端每5秒调用一次
     */
    static async pollForResponse(userId, lastMessageId = null) {
        // 获取最新的对话记录
        const history = await ConversationModel.getHistoryByUserId(userId, 1, 0);

        if (history.length === 0) {
            return { hasNew: false };
        }

        const latest = history[0];

        // 如果有lastMessageId且与最新记录相同，则没有新消息
        if (lastMessageId && latest.id === lastMessageId) {
            return { hasNew: false };
        }

        return {
            hasNew: true,
            message: {
                id: latest.id,
                response: latest.response,
                emotion: latest.emotion,
                timestamp: latest.created_at
            }
        };
    }
}

module.exports = ChatService;