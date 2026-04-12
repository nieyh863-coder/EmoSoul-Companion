import React from 'react';
import './ChatMessage.css';

/**
 * 聊天消息组件
 */
const ChatMessage = ({ message, isUser = false, emotion = 'gentle', isTyping = false }) => {
    // 情绪对应的颜色
    const emotionColors = {
        happy: '#FCD34D',
        gentle: '#A78BFA',
        thinking: '#60A5FA',
        sad: '#9CA3AF',
        surprised: '#F472B6'
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