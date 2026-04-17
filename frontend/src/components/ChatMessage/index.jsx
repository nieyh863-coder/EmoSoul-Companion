import React from 'react';
import { EMOTION_EMOJI, EMOTION_LABEL } from '../../constants/companionStatus';
import './ChatMessage.css';

/**
 * 聊天消息组件
 */
const ChatMessage = ({ message, isUser = false, emotion = 'gentle', isTyping = false, emotionAdvice = null, source = null }) => {
    // 情绪对应的颜色
    const emotionColors = {
        happy: '#FCD34D',
        gentle: '#A78BFA',
        thinking: '#60A5FA',
        sad: '#9CA3AF',
        surprised: '#F472B6',
        angry: '#FF5252',
        anxious: '#FFC107',
        calm: '#81C784',
        love: '#F48FB1'
    };

    return (
        <div className={`chat-message ${isUser ? 'user' : 'ai'}`}>
            {!isUser && (
                <div
                    className="message-avatar"
                    style={{
                        backgroundColor: emotionColors[emotion] || emotionColors.gentle
                    }}
                >
                    AI
                </div>
            )}

            <div className="message-content">
                {/* 主动关怀标识 */}
                {source === 'proactive' && !isUser && (
                    <div className="proactive-badge">
                        <span className="proactive-icon">💝</span>
                        <span className="proactive-text">主动关怀</span>
                    </div>
                )}
                {/* 情绪标签 */}
                {emotion && !isUser && EMOTION_EMOJI[emotion] && (
                    <span className={`emotion-badge emotion-${emotion}`}>
                        {EMOTION_EMOJI[emotion]} {EMOTION_LABEL[emotion]}
                    </span>
                )}
                <div className="message-bubble">
                    {isTyping && !isUser ? (
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ) : (
                        <p>{message}</p>
                    )}
                </div>
                {/* 情绪建议 */}
                {emotionAdvice && !isUser && (
                    <div className="message-advice">
                        <span>💡 {emotionAdvice}</span>
                    </div>
                )}
                <span className="message-time">
                    {new Date().toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>

            {isUser && (
                <div className="message-avatar user-avatar">
                    我
                </div>
            )}
        </div>
    );
};

export default ChatMessage;