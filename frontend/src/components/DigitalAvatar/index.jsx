import React, { useEffect, useState } from 'react';
import avatarSurprised from '../../assets/images/avatar-surprised.png';
import avatarSad from '../../assets/images/avatar-sad.png';
import avatarThinking from '../../assets/images/avatar-thinking.png';
import '../../styles/Avatar.css';

const avatarImages = {
    surprised: avatarSurprised,
    sad: avatarSad,
    thinking: avatarThinking
};

const emotions = ['surprised', 'sad', 'thinking'];

const DigitalAvatar = ({ emotion = 'thinking', isTyping = false }) => {
    const [currentEmotion, setCurrentEmotion] = useState(emotion);
    const [prevEmotion, setPrevEmotion] = useState(emotion);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (emotion !== currentEmotion) {
            setPrevEmotion(currentEmotion);
            setIsTransitioning(true);
            // 短暂延迟后切换，制造淡出-淡入效果
            const timer = setTimeout(() => {
                setCurrentEmotion(emotion);
                setIsTransitioning(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [emotion, currentEmotion]);

    return (
        <div className={`avatar-container ${isTyping ? 'typing' : ''}`}>
            <div className="avatar-glow-ring" />
            <div className="avatar-image-wrapper">
                {emotions.map(emo => (
                    <img
                        key={emo}
                        src={avatarImages[emo]}
                        alt={`数字人${emo}表情`}
                        className={`avatar-img ${currentEmotion === emo ? 'active' : ''} ${isTransitioning && prevEmotion === emo ? 'fading-out' : ''}`}
                        draggable={false}
                    />
                ))}
            </div>
        </div>
    );
};

export default DigitalAvatar;