const ChatService = require('../services/chatService');
const ResponseUtil = require('../utils/response');

/**
 * 对话控制器
 * 处理数字人对话相关的请求
 */
class ChatController {
    /**
     * 发送消息
     * POST /api/chat/message
     */
    static async sendMessage(ctx) {
        const { userId } = ctx.state.user;
        const { message, mode = 'normal' } = ctx.request.body;

        // VIP模式携带最近10条对话上下文，普通模式不带上下文
        const context = mode === 'vip'
            ? await ChatService.getConversationContext(userId, 10)
            : [];

        // 调用扣子工作流（模拟）
        const result = await ChatService.callCozeWorkflow(userId, message, context, mode);

        ResponseUtil.success(ctx, result);
    }

    /**
     * 获取对话历史
     * GET /api/chat/history
     */
    static async getHistory(ctx) {
        const { userId } = ctx.state.user;
        const { limit = 50, offset = 0 } = ctx.query;

        const history = await ChatService.getConversationHistory(
            userId,
            parseInt(limit),
            parseInt(offset)
        );

        ResponseUtil.success(ctx, history);
    }

    /**
     * 轮询获取新消息
     * GET /api/chat/poll
     */
    static async pollMessages(ctx) {
        const { userId } = ctx.state.user;
        const { lastMessageId } = ctx.query;
        console.log('📨 pollMessages - userId from ctx:', userId, 'type:', typeof userId);

        const result = await ChatService.pollForResponse(userId, lastMessageId);

        ResponseUtil.success(ctx, result);
    }

    /**
     * 清空对话历史
     * DELETE /api/chat/history
     */
    static async clearHistory(ctx) {
        const { userId } = ctx.state.user;
        const ConversationModel = require('../models/conversationModel');

        await ConversationModel.deleteByUserId(userId);
        ResponseUtil.success(ctx, null, '对话历史已清空');
    }
}

module.exports = ChatController;
