import React, { useRef, useEffect, useCallback } from 'react';
import { useLive2D } from '../../hooks/useLive2D';
import './Live2DAvatar.css';

// 点击互动配置
const CLICK_CONFIG = {
    // 连续点击重置时间（毫秒）
    comboResetTime: 600,
    // 区域划分比例
    regions: {
        head: 0.35,    // 头部区域（0-35%）
        body: 0.7,     // 身体区域（35%-70%）
        lower: 1.0,    // 下半身区域（70%-100%）
    },
};

// 连续点击触发的动作序列
const COMBO_MOTIONS = [
    { group: 'Idle', index: 0 },           // 第1次：普通待机
    { group: 'TapBody', index: 0 },        // 第2次：点击身体反应
    { group: 'Idle', index: 2 },           // 第3次：活泼动作
    { group: 'Idle', index: 4 },           // 第4次：更活泼
    { group: 'Idle', index: 6 },           // 第5次+：最活泼
];

// 状态到 Live2D 反应的映射（当用户切换「我的状态」时触发）
// 参数值已增大，添加手臂、肩膀、眼睛笑容、腮红等肢体动作
const STATUS_LIVE2D_REACTIONS = {
    happy: {
        motion: { group: 'TapBody', index: 0 },
        params: {
            ParamEyeLOpen: 1.2, ParamEyeROpen: 1.2,
            ParamEyeLSmile: 1.0, ParamEyeRSmile: 1.0,
            ParamMouthOpenY: 1.0, ParamMouthForm: 1,
            ParamBrowLY: 0.8, ParamBrowRY: 0.8,
            ParamCheek: 0.8,
            ParamBodyAngleX: 10, ParamBodyAngleZ: 5,
            ParamAngleX: 5, ParamAngleY: -3,
            ParamShoulder: 0.3,
            ParamArmLA: 0.6, ParamArmRA: 0.6,
            ParamHandL: 0.5, ParamHandR: 0.5,
            ParamBreath: 0.8
        }
    },
    work: {
        motion: { group: 'Idle', index: 1 },
        params: {
            ParamEyeLOpen: 0.9, ParamEyeROpen: 0.9,
            ParamEyeLSmile: 0, ParamEyeRSmile: 0,
            ParamMouthOpenY: 0.1, ParamMouthForm: 0,
            ParamBrowLY: -0.4, ParamBrowRY: -0.4,
            ParamCheek: 0,
            ParamBodyAngleX: -5, ParamBodyAngleZ: -3,
            ParamShoulder: 0.1,
            ParamArmLA: 0.2, ParamArmRA: 0.2,
            ParamHandL: 0.1, ParamHandR: 0.1,
            ParamBreath: 0.4
        }
    },
    coffee: {
        motion: { group: 'TapBody', index: 1 },
        params: {
            ParamEyeLOpen: 0.5, ParamEyeROpen: 0.5,
            ParamEyeLSmile: 0.2, ParamEyeRSmile: 0.2,
            ParamMouthOpenY: 0.5, ParamMouthForm: 0.3,
            ParamCheek: 0.3,
            ParamBodyAngleX: 8, ParamBodyAngleY: 3,
            ParamShoulder: -0.1,
            ParamArmLA: 0.4, ParamHandL: 0.5,
            ParamArmRA: 0.1, ParamHandR: 0.2,
            ParamBreath: 0.5
        }
    },
    cracked: {
        motion: { group: 'Idle', index: 7 },
        params: {
            ParamEyeLOpen: 1.3, ParamEyeROpen: 1.3,
            ParamEyeLSmile: 0, ParamEyeRSmile: 0,
            ParamMouthOpenY: 1.0, ParamMouthForm: -0.5,
            ParamBrowLY: -1.0, ParamBrowRY: -1.0,
            ParamCheek: 0.1,
            ParamBodyAngleZ: -10, ParamAngleZ: -8,
            ParamShoulder: -0.4,
            ParamArmLA: -0.2, ParamArmRA: -0.2,
            ParamHandL: -0.1, ParamHandR: -0.1,
            ParamBreath: 0.3
        }
    },
    thinking: {
        motion: { group: 'Idle', index: 2 },
        params: {
            ParamEyeLOpen: 0.8, ParamEyeROpen: 0.5,
            ParamEyeLSmile: 0, ParamEyeRSmile: 0,
            ParamMouthOpenY: 0.1, ParamMouthForm: 0,
            ParamCheek: 0,
            ParamAngleX: -15, ParamAngleY: 5,
            ParamBodyAngleX: -8, ParamBrowLY: 0.3,
            ParamShoulder: 0.1,
            ParamArmLA: 0.7, ParamHandL: 0.8,
            ParamArmRA: 0, ParamHandR: 0,
            ParamBreath: 0.4
        }
    },
    study: {
        motion: { group: 'Idle', index: 0 },
        params: {
            ParamEyeLOpen: 1.0, ParamEyeROpen: 1.0,
            ParamEyeLSmile: 0, ParamEyeRSmile: 0,
            ParamMouthOpenY: 0.1, ParamMouthForm: 0,
            ParamCheek: 0,
            ParamAngleY: -8, ParamBodyAngleX: 3,
            ParamBrowLY: -0.2, ParamBrowRY: -0.2,
            ParamShoulder: 0,
            ParamArmLA: 0.3, ParamArmRA: 0.3,
            ParamHandL: 0.2, ParamHandR: 0.2,
            ParamBreath: 0.4
        }
    },
    gaming: {
        motion: { group: 'TapBody', index: 2 },
        params: {
            ParamEyeLOpen: 1.2, ParamEyeROpen: 1.2,
            ParamEyeLSmile: 0.2, ParamEyeRSmile: 0.2,
            ParamMouthOpenY: 0.6, ParamMouthForm: 0.2,
            ParamBrowLY: 0.5, ParamBrowRY: 0.5,
            ParamCheek: 0.2,
            ParamBodyAngleX: 12, ParamBodyAngleZ: 6,
            ParamAngleX: 8,
            ParamShoulder: 0.4,
            ParamArmLA: 0.7, ParamArmRA: 0.7,
            ParamHandL: 0.8, ParamHandR: 0.8,
            ParamBreath: 0.9
        }
    },
    chill: {
        motion: { group: 'Idle', index: 1 },
        params: {
            ParamEyeLOpen: 0.3, ParamEyeROpen: 0.3,
            ParamEyeLSmile: 0.5, ParamEyeRSmile: 0.5,
            ParamMouthOpenY: 0.3, ParamMouthForm: 0.5,
            ParamCheek: 0.3,
            ParamBodyAngleX: 5, ParamBodyAngleY: 3,
            ParamShoulder: -0.3,
            ParamArmLA: 0, ParamArmRA: 0,
            ParamHandL: 0, ParamHandR: 0,
            ParamBreath: 0.3
        }
    },
    music: {
        motion: { group: 'TapBody', index: 0 },
        params: {
            ParamEyeLOpen: 0.9, ParamEyeROpen: 0.9,
            ParamEyeLSmile: 0.6, ParamEyeRSmile: 0.6,
            ParamMouthOpenY: 0.5, ParamMouthForm: 0.8,
            ParamCheek: 0.4,
            ParamAngleZ: 10, ParamBodyAngleX: 8,
            ParamBodyAngleZ: 5, ParamBrowLY: 0.4, ParamBrowRY: 0.4,
            ParamShoulder: 0.2,
            ParamArmLA: 0.5, ParamArmRA: 0.5,
            ParamHandL: 0.4, ParamHandR: 0.4,
            ParamBreath: 0.6,
            ParamHairAhoge: 0.2
        }
    },
    sport: {
        motion: { group: 'Idle', index: 8 },
        params: {
            ParamEyeLOpen: 1.2, ParamEyeROpen: 1.2,
            ParamEyeLSmile: 0.3, ParamEyeRSmile: 0.3,
            ParamMouthOpenY: 0.7, ParamMouthForm: 0.5,
            ParamBrowLY: 0.6, ParamBrowRY: 0.6,
            ParamCheek: 0.3,
            ParamBodyAngleX: 15, ParamBodyAngleZ: 8,
            ParamAngleX: 5,
            ParamShoulder: 0.5,
            ParamArmLA: 0.8, ParamArmRA: 0.8,
            ParamHandL: 0.7, ParamHandR: 0.7,
            ParamBreath: 1.0
        }
    },
    vacation: {
        motion: { group: 'TapBody', index: 1 },
        params: {
            ParamEyeLOpen: 1.0, ParamEyeROpen: 1.0,
            ParamEyeLSmile: 0.5, ParamEyeRSmile: 0.5,
            ParamMouthOpenY: 0.6, ParamMouthForm: 0.6,
            ParamCheek: 0.5,
            ParamBodyAngleX: 10, ParamBodyAngleY: 5,
            ParamBrowLY: 0.3, ParamBrowRY: 0.3,
            ParamShoulder: 0.1,
            ParamArmLA: 0.4, ParamArmRA: 0.4,
            ParamHandL: 0.3, ParamHandR: 0.3,
            ParamBreath: 0.6
        }
    },
    love: {
        motion: { group: 'TapBody', index: 0 },
        params: {
            ParamEyeLOpen: 1.1, ParamEyeROpen: 1.1,
            ParamEyeLSmile: 0.9, ParamEyeRSmile: 0.9,
            ParamMouthOpenY: 0.5, ParamMouthForm: 1,
            ParamBrowLY: 0.8, ParamBrowRY: 0.8,
            ParamCheek: 1.0,
            ParamBodyAngleX: 8, ParamBodyAngleZ: 4,
            ParamAngleX: 3, ParamAngleY: -2,
            ParamShoulder: 0.3,
            ParamArmLA: 0.5, ParamArmRA: 0.5,
            ParamHandL: 0.6, ParamHandR: 0.6,
            ParamBreath: 0.7,
            ParamHairAhoge: 0.2
        }
    },
};

// 情绪到 Live2D 参数的映射（Hiyori 没有表情文件，通过参数直接驱动）
// 大幅增强参数，添加手臂、肩膀、眼睛笑容、腮红、头发摇晃等肢体动作
const EMOTION_PARAMS_MAP = {
    happy: {
        // 面部 - 开心表情
        ParamEyeLOpen: 1.2, ParamEyeROpen: 1.2,
        ParamEyeLSmile: 1.0, ParamEyeRSmile: 1.0,  // 眼睛弯月笑
        ParamMouthOpenY: 0.8, ParamMouthForm: 1,
        ParamBrowLY: 0.6, ParamBrowRY: 0.6,
        ParamCheek: 0.8,  // 腮红
        // 身体 - 活泼开心
        ParamBodyAngleX: 12, ParamBodyAngleZ: 6,
        ParamAngleX: 5, ParamAngleZ: 8,
        ParamShoulder: 0.3,  // 肩膀微耸
        // 手臂 - 自然展开
        ParamArmLA: 0.6, ParamArmRA: 0.6,
        ParamHandL: 0.5, ParamHandR: 0.5,
        // 动态
        ParamHairAhoge: 0.3,  // 头发摇晃
        ParamBreath: 0.8,  // 呼吸加大
    },
    sad: {
        // 面部 - 难过低落
        ParamEyeLOpen: 0.3, ParamEyeROpen: 0.3,
        ParamEyeLSmile: 0, ParamEyeRSmile: 0,
        ParamMouthForm: -0.8, ParamMouthOpenY: 0.15,
        ParamBrowLY: -1.0, ParamBrowRY: -1.0,
        ParamCheek: 0,
        // 身体 - 蜷缩下沉
        ParamBodyAngleX: -15, ParamBodyAngleZ: -8,
        ParamAngleX: -8, ParamAngleY: -5, ParamAngleZ: -12,
        ParamShoulder: -0.5,  // 肩膀下垂
        // 手臂 - 收拢无力
        ParamArmLA: -0.3, ParamArmRA: -0.3,
        ParamHandL: -0.2, ParamHandR: -0.2,
        // 动态 - 缓慢
        ParamBreath: 0.3,
    },
    angry: {
        // 面部 - 生气
        ParamEyeLOpen: 1.0, ParamEyeROpen: 1.0,
        ParamEyeLSmile: 0, ParamEyeRSmile: 0,
        ParamBrowLY: -1.0, ParamBrowRY: -1.0,
        ParamMouthForm: -0.6, ParamMouthOpenY: 0.6,
        ParamCheek: 0.3,
        // 身体 - 前倾施压
        ParamBodyAngleX: -15, ParamBodyAngleZ: -5,
        ParamAngleX: -8, ParamAngleZ: -5,
        ParamShoulder: 0.6,  // 耸肩紧张
        // 手臂 - 握拳紧绷
        ParamArmLA: 0.8, ParamArmRA: 0.8,
        ParamHandL: 1.0, ParamHandR: 1.0,
        ParamBreath: 1.0,  // 急促呼吸
    },
    surprised: {
        // 面部 - 惊讶
        ParamEyeLOpen: 1.3, ParamEyeROpen: 1.3,
        ParamEyeLSmile: 0, ParamEyeRSmile: 0,
        ParamMouthOpenY: 1.0, ParamMouthForm: 0.3,
        ParamBrowLY: 1.0, ParamBrowRY: 1.0,
        ParamCheek: 0.2,
        // 身体 - 后仰惊退
        ParamBodyAngleX: 10, ParamBodyAngleZ: 10,
        ParamAngleX: 5, ParamAngleZ: 12,
        ParamShoulder: 0.8,  // 肩膀大幅上抬
        // 手臂 - 张开防御
        ParamArmLA: 1.0, ParamArmRA: 1.0,
        ParamHandL: 0.8, ParamHandR: 0.8,
        ParamBreath: 0.9,
        ParamHairAhoge: 0.5,  // 头发大幅摇晃
    },
    anxious: {
        // 面部 - 焦虑不安
        ParamEyeLOpen: 0.5, ParamEyeROpen: 0.8,
        ParamEyeLSmile: 0, ParamEyeRSmile: 0,
        ParamBrowLY: -0.7, ParamBrowRY: -0.4,
        ParamMouthForm: -0.4, ParamMouthOpenY: 0.15,
        ParamCheek: 0,
        // 身体 - 不安摇晃
        ParamBodyAngleX: -8, ParamBodyAngleZ: -5,
        ParamAngleX: -5, ParamAngleZ: -6,
        ParamShoulder: 0.4,  // 紧张耸肩
        // 手臂 - 抱紧自己
        ParamArmLA: 0.4, ParamArmRA: 0.4,
        ParamHandL: 0.6, ParamHandR: 0.6,
        ParamBreath: 0.7,
    },
    calm: {
        // 面部 - 平和宁静
        ParamEyeLOpen: 0.85, ParamEyeROpen: 0.85,
        ParamEyeLSmile: 0.3, ParamEyeRSmile: 0.3,  // 微笑
        ParamMouthForm: 0.4, ParamMouthOpenY: 0.05,
        ParamBrowLY: 0.1, ParamBrowRY: 0.1,
        ParamCheek: 0.2,
        // 身体 - 放松自然
        ParamBodyAngleX: 3, ParamBodyAngleY: 2, ParamBodyAngleZ: 2,
        ParamAngleX: 2, ParamAngleZ: 3,
        ParamShoulder: -0.2,  // 肩膀放松下沉
        // 手臂 - 自然垂下
        ParamArmLA: 0, ParamArmRA: 0,
        ParamHandL: 0, ParamHandR: 0,
        ParamBreath: 0.5,  // 平稳呼吸
    },
    thinking: {
        // 面部 - 沉思
        ParamEyeLOpen: 0.5, ParamEyeROpen: 1.0,
        ParamEyeLSmile: 0, ParamEyeRSmile: 0,
        ParamBrowLY: 0.5, ParamBrowRY: -0.4,
        ParamMouthForm: 0, ParamMouthOpenY: 0.08,
        ParamCheek: 0,
        // 身体 - 侧头沉思
        ParamBodyAngleX: -8, ParamBodyAngleZ: 6,
        ParamAngleX: -5, ParamAngleZ: 15,
        ParamShoulder: 0.1,
        // 手臂 - 托腮思考
        ParamArmLA: 0.8, ParamHandL: 0.9,  // 左手抬起托腮
        ParamArmRA: 0, ParamHandR: 0,
        ParamBreath: 0.4,
    },
    love: {
        // 面部 - 喜爱心动
        ParamEyeLOpen: 0.8, ParamEyeROpen: 0.8,
        ParamEyeLSmile: 0.8, ParamEyeRSmile: 0.8,  // 含情脉脉
        ParamMouthOpenY: 0.5, ParamMouthForm: 1,
        ParamBrowLY: 0.5, ParamBrowRY: 0.5,
        ParamCheek: 1.0,  // 满腮红
        // 身体 - 害羞前倾
        ParamBodyAngleX: 10, ParamBodyAngleZ: 5,
        ParamAngleX: 5, ParamAngleZ: 8,
        ParamShoulder: 0.3,
        // 手臂 - 双手合十
        ParamArmLA: 0.5, ParamArmRA: 0.5,
        ParamHandL: 0.7, ParamHandR: 0.7,
        ParamBreath: 0.7,
        ParamHairAhoge: 0.2,
    }
};

// 情绪对应的动作 - 使用具体动作索引
const EMOTION_MOTION_MAP = {
    happy: { group: 'TapBody', index: 0 },      // 活泼动作
    sad: { group: 'Idle', index: 2 },            // 低沉待机
    angry: { group: 'TapBody', index: 0 },       // 激烈动作
    surprised: { group: 'TapBody', index: 0 },   // 惊讶反应
    anxious: { group: 'Idle', index: 4 },        // 不安待机
    calm: { group: 'Idle', index: 1 },           // 平静待机
    thinking: { group: 'Idle', index: 5 },       // 思考待机
    love: { group: 'TapBody', index: 0 }         // 心动反应
};

function Live2DAvatar({ emotion = 'calm', companionStatus, isTyping = false, onError }) {
    const canvasRef = useRef(null);
    const { isLoaded, loadError, setExpressionByParams, playMotion, setFocus } = useLive2D(canvasRef, {
        width: 280,
        height: 360,
    });

    // 加载失败时通知父组件
    useEffect(() => {
        if (loadError && onError) {
            onError(loadError);
        }
    }, [loadError, onError]);

    // 状态变化时触发 Live2D 反应（优先级高于情绪）
    useEffect(() => {
        if (!isLoaded || !companionStatus) return;

        const reaction = STATUS_LIVE2D_REACTIONS[companionStatus];
        if (!reaction) return;

        // 播放对应动作
        if (reaction.motion) {
            playMotion(reaction.motion.group, reaction.motion.index);
        }

        // 设置对应表情参数（使用 try-catch 包装，防止参数错误导致模型异常）
        if (reaction.params) {
            // 延迟执行参数设置，确保动作已开始播放
            setTimeout(() => {
                setExpressionByParams(reaction.params);
            }, 100);
        }
    }, [companionStatus, isLoaded, setExpressionByParams, playMotion]);

    // 情绪变化时通过参数设置表情 + 播放动作（当没有状态切换时）
    useEffect(() => {
        if (!isLoaded) return;

        // 如果有状态，优先使用状态的反应，跳过情绪反应
        if (companionStatus && STATUS_LIVE2D_REACTIONS[companionStatus]) {
            return;
        }

        // 通过模型参数设置表情
        const params = EMOTION_PARAMS_MAP[emotion] || EMOTION_PARAMS_MAP.calm;
        setExpressionByParams(params);

        // 情绪变化时播放对应动作
        const motionConfig = EMOTION_MOTION_MAP[emotion] || { group: 'Idle', index: 0 };
        playMotion(motionConfig.group, motionConfig.index);
    }, [emotion, isLoaded, companionStatus, setExpressionByParams, playMotion]);

    // typing 时播放动作
    useEffect(() => {
        if (!isLoaded || !isTyping) return;

        const timer = setInterval(() => {
            playMotion('Idle', Math.floor(Math.random() * 3));
        }, 3000);

        return () => clearInterval(timer);
    }, [isTyping, isLoaded, playMotion]);

    // 鼠标移动跟踪眼球
    const handleMouseMove = useCallback((e) => {
        if (!isLoaded) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setFocus(x, y);
    }, [isLoaded, setFocus]);

    // 连续点击计数
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef(null);
    const lastRegionRef = useRef(null);

    // 根据点击区域获取动作
    const getMotionByRegion = useCallback((region, comboCount) => {
        // 优先使用连续点击的动作序列
        if (comboCount > 1 && comboCount <= COMBO_MOTIONS.length) {
            return COMBO_MOTIONS[comboCount - 1];
        }
        if (comboCount > COMBO_MOTIONS.length) {
            return COMBO_MOTIONS[COMBO_MOTIONS.length - 1];
        }

        // 根据区域选择动作
        switch (region) {
            case 'head':
                // 头部区域：睁眼动作
                return { group: 'Idle', index: Math.floor(Math.random() * 3) };
            case 'body':
                // 身体区域：TapBody 反应
                return { group: 'TapBody', index: 0 };
            case 'lower':
                // 下半身区域：待机动作
                return { group: 'Idle', index: Math.floor(Math.random() * 3) + 3 };
            default:
                return { group: 'Idle', index: 0 };
        }
    }, []);

    // 处理点击事件（区域点击 + 连续点击）
    const handleClick = useCallback((e) => {
        if (!isLoaded) return;

        // 计算点击位置（相对于 canvas 的 0-1 坐标）
        const rect = e.currentTarget.getBoundingClientRect();
        const y = (e.clientY - rect.top) / rect.height;

        // 确定点击区域
        let region;
        if (y < CLICK_CONFIG.regions.head) {
            region = 'head';
        } else if (y < CLICK_CONFIG.regions.body) {
            region = 'body';
        } else {
            region = 'lower';
        }
        lastRegionRef.current = region;

        // 增加点击计数
        clickCountRef.current++;

        // 清除之前的定时器
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
        }

        // 设置新的定时器，超时重置计数
        clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0;
            lastRegionRef.current = null;
        }, CLICK_CONFIG.comboResetTime);

        const count = clickCountRef.current;
        const motion = getMotionByRegion(region, count);

        // 播放动作
        playMotion(motion.group, motion.index);

        // 点击时添加夸张的身体反应参数
        const clickReactionParams = {
            'head': {
                ParamBodyAngleX: (Math.random() - 0.5) * 20,
                ParamBodyAngleY: -5,
                ParamBodyAngleZ: (Math.random() - 0.5) * 10,
                ParamEyeLOpen: 1.1, ParamEyeROpen: 1.1
            },
            'body': {
                ParamBodyAngleX: (Math.random() - 0.5) * 15,
                ParamBodyAngleZ: (Math.random() - 0.5) * 12,
                ParamMouthOpenY: 0.4
            },
            'lower': {
                ParamBodyAngleX: (Math.random() - 0.5) * 10,
                ParamBodyAngleY: 5,
                ParamBodyAngleZ: (Math.random() - 0.5) * 8
            },
        };

        setTimeout(() => {
            setExpressionByParams(clickReactionParams[region]);
        }, 50);

        console.log(`[Live2D] 点击区域: ${region}, 连续次数: ${count}, 动作: ${motion.group}[${motion.index}]`);
    }, [isLoaded, playMotion, getMotionByRegion, setExpressionByParams]);

    // 双击触发特殊动作
    const handleDoubleClick = useCallback((e) => {
        if (!isLoaded) return;

        // 双击时清除连续点击计数
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
        }
        clickCountRef.current = 0;
        lastRegionRef.current = null;

        // 播放特殊动作（使用较活泼的待机动作）
        playMotion('Idle', Math.floor(Math.random() * 3) + 5);

        console.log('[Live2D] 双击触发特殊动作');
    }, [isLoaded, playMotion]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
            }
        };
    }, []);

    if (loadError) {
        return null; // 父组件会降级到 DigitalAvatar
    }

    return (
        <div
            className="live2d-avatar-container"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            title="点击互动：单击不同区域有不同反应，连续点击有惊喜，双击特殊动作"
        >
            <canvas ref={canvasRef} className="live2d-canvas" />
            {!isLoaded && (
                <div className="live2d-loading">
                    <div className="live2d-loading-spinner"></div>
                    <span>加载中...</span>
                </div>
            )}
        </div>
    );
}

export default Live2DAvatar;