import React, { useEffect, useState, useRef } from 'react';
import avatarLook from '../../assets/images/avatar-look.png';
import avatarSurprised from '../../assets/images/avatar-surprised.png';
import avatarSad from '../../assets/images/avatar-sad.png';
import avatarThinking from '../../assets/images/avatar-thinking.png';
import '../../styles/Avatar.css';

// 8种情绪到头像图片和粒子颜色的映射
const emotionAvatarMap = {
    happy: { image: avatarLook, particleColor: '#FFD700' },
    sad: { image: avatarSad, particleColor: '#64B5F6' },
    angry: { image: avatarSad, particleColor: '#FF5252' },
    surprised: { image: avatarSurprised, particleColor: '#FF9800' },
    anxious: { image: avatarThinking, particleColor: '#FFC107' },
    calm: { image: avatarLook, particleColor: '#81C784' },
    thinking: { image: avatarThinking, particleColor: '#CE93D8' },
    love: { image: avatarLook, particleColor: '#F48FB1' },
};

// 所有图片去重（用于预渲染 img 标签）
const uniqueImages = [
    { key: 'look', src: avatarLook },
    { key: 'sad', src: avatarSad },
    { key: 'surprised', src: avatarSurprised },
    { key: 'thinking', src: avatarThinking },
];

const emotions = Object.keys(emotionAvatarMap);

const DigitalAvatar = ({ emotion = 'thinking', isTyping = false }) => {
    const [currentEmotion, setCurrentEmotion] = useState(emotion);
    const [prevEmotion, setPrevEmotion] = useState(emotion);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const particlesRef = useRef(null);
    const rippleRef = useRef(null);

    useEffect(() => {
        if (!isHovering && emotion !== currentEmotion) {
            setPrevEmotion(currentEmotion);
            setIsTransitioning(true);
            // 短暂延迟后切换，制造淡出-淡入效果
            const timer = setTimeout(() => {
                setCurrentEmotion(emotion);
                setIsTransitioning(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [emotion, currentEmotion, isHovering]);

    // 获取当前情绪对应的图片
    const getCurrentImage = (emo) => {
        return (emotionAvatarMap[emo] || emotionAvatarMap.thinking).image;
    };

    // 获取当前情绪对应的粒子颜色
    const getParticleColor = (emo) => {
        return (emotionAvatarMap[emo] || emotionAvatarMap.thinking).particleColor;
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
        // 随机选择一个不同的表情
        const otherEmotions = emotions.filter(emo => emo !== currentEmotion);
        const randomEmotion = otherEmotions[Math.floor(Math.random() * otherEmotions.length)];
        
        setPrevEmotion(currentEmotion);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentEmotion(randomEmotion);
            setIsTransitioning(false);
        }, 300);
        
        // 生成粒子效果
        createParticles();
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setPrevEmotion(currentEmotion);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentEmotion(emotion);
            setIsTransitioning(false);
        }, 300);
    };

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 300);
        
        // 生成波纹效果
        createRipple();
    };

    const createParticles = () => {
        if (!particlesRef.current) return;
        
        // 清空现有粒子
        particlesRef.current.innerHTML = '';
        
        // 创建10个粒子
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'avatar-particle';
            
            // 随机位置
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            
            // 使用当前情绪对应的粒子颜色
            const baseColor = getParticleColor(currentEmotion);
            particle.style.background = baseColor;
            
            // 随机大小
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机动画延迟
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            
            particlesRef.current.appendChild(particle);
        }
    };

    const createRipple = () => {
        if (!rippleRef.current) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'avatar-ripple-effect';
        rippleRef.current.appendChild(ripple);
        
        // 动画结束后移除波纹
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 2000);
    };

    const currentImage = getCurrentImage(currentEmotion);
    const prevImage = getCurrentImage(prevEmotion);

    return (
        <div 
            className={`avatar-container ${isTyping ? 'typing' : ''} ${currentEmotion} ${isClicked ? 'clicked' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ '--particle-color': getParticleColor(currentEmotion) }}
        >
            <div className="avatar-glow-ring" />
            <div className="avatar-image-wrapper">
                {uniqueImages.map(({ key, src }) => (
                    <img
                        key={key}
                        src={src}
                        alt={`数字人${key}表情`}
                        className={`avatar-img ${currentImage === src ? 'active' : ''} ${isTransitioning && prevImage === src ? 'fading-out' : ''}`}
                        draggable={false}
                    />
                ))}
            </div>
            <div className="avatar-particles" ref={particlesRef} />
            <div className="avatar-ripple" ref={rippleRef} />
        </div>
    );
};

export default DigitalAvatar;