import { useEffect, useRef, useState, useCallback } from 'react';

// 模型 URL 列表，按优先级排序（国内可访问的镜像优先）
const MODEL_URLS = [
    'https://fastly.jsdelivr.net/gh/Live2D/CubismWebSamples@develop/Samples/Resources/Hiyori/Hiyori.model3.json',
    'https://cdn.jsdelivr.net/gh/Live2D/CubismWebSamples@develop/Samples/Resources/Hiyori/Hiyori.model3.json',
    '/models/Hiyori/Hiyori.model3.json',
];

// 全局单例
let globalApp = null;
let globalModel = null;
let initPromise = null;
let refCount = 0;

async function initLive2D(canvas, width, height) {
    // 如果已初始化，直接返回
    if (globalModel && globalApp) {
        return { app: globalApp, model: globalModel };
    }

    // 如果正在初始化，等待
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            // 动态导入 PIXI
            const PIXI = await import('pixi.js');
            window.PIXI = PIXI;

            // 等一下确保 window.PIXI 生效
            await new Promise(r => setTimeout(r, 50));

            // 动态导入 pixi-live2d-display/cubism4
            const { Live2DModel } = await import('pixi-live2d-display/cubism4');
            
            console.log('Live2D 模块加载成功');

            // 获取设备像素比，用于高分屏适配
            const dpr = window.devicePixelRatio || 1;

            // 创建 PIXI Application，添加 resolution 和 autoDensity 参数以适配高分屏
            const app = new PIXI.Application({
                view: canvas,
                width,
                height,
                transparent: true,
                autoStart: true,
                backgroundAlpha: 0,
                antialias: true,
                resolution: dpr,
                autoDensity: true,
            });

            console.log('PIXI Application 创建成功');

            // 尝试加载模型
            let model = null;

            for (const url of MODEL_URLS) {
                try {
                    console.log('尝试加载模型:', url);
                    model = await Live2DModel.from(url, {
                        autoInteract: false,
                        autoUpdate: true,
                    });
                    console.log('模型加载成功:', url);
                    break;
                } catch (e) {
                    console.warn('模型加载失败:', url, e);
                }
            }

            if (!model) {
                throw new Error('所有模型 URL 均加载失败');
            }

            // 调整模型位置和大小（增大 scale 让动作更明显可见）
            const scale = Math.min(width / model.width, height / model.height) * 0.85;
            model.scale.set(scale);
            model.anchor.set(0.5, 0.5);
            model.x = width / 2;
            model.y = height / 2 + 30;

            app.stage.addChild(model);

            globalApp = app;
            globalModel = model;

            console.log('Live2D 初始化完成');
            return { app, model };
        } catch (err) {
            console.error('Live2D 初始化失败:', err);
            initPromise = null;
            throw err;
        }
    })();

    return initPromise;
}

function destroyLive2D() {
    if (globalModel) {
        try { globalModel.destroy(); } catch(e) {}
        globalModel = null;
    }
    if (globalApp) {
        try { globalApp.destroy(false); } catch(e) {}
        globalApp = null;
    }
    initPromise = null;
}

export function useLive2D(canvasRef, options = {}) {
    const { width = 280, height = 360 } = options;
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        refCount++;

        let cancelled = false;

        const setup = async () => {
            if (!canvasRef.current) {
                console.warn('Canvas ref 不存在');
                return;
            }

            try {
                await initLive2D(canvasRef.current, width, height);
                if (!cancelled && mountedRef.current) {
                    setIsLoaded(true);
                }
            } catch (err) {
                if (!cancelled && mountedRef.current) {
                    setLoadError(err.message || '加载失败');
                }
            }
        };

        setup();

        return () => {
            cancelled = true;
            mountedRef.current = false;
            refCount--;

            // 延迟销毁，兼容 StrictMode
            setTimeout(() => {
                if (refCount <= 0) {
                    destroyLive2D();
                    refCount = 0;
                }
            }, 200);
        };
    }, [canvasRef, width, height]);

    const setExpressionByParams = useCallback((params, duration = 500) => {
        const model = globalModel;
        if (!model || !model.internalModel) return;

        try {
            const coreModel = model.internalModel.coreModel;
            if (!coreModel) return;

            // 取消之前的动画
            if (window._emotionAnimationId) {
                cancelAnimationFrame(window._emotionAnimationId);
            }

            const startTime = Date.now();
            const startValues = {};

            // 记录当前参数值
            Object.keys(params).forEach(key => {
                try {
                    const paramIndex = coreModel.getParameterIndex(key);
                    if (paramIndex >= 0) {
                        startValues[key] = coreModel.getParameterValueByIndex(paramIndex);
                    }
                } catch (e) {}
            });

            // 缓动函数 - easeInOutCubic
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };

            // 动画循环
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const rawProgress = Math.min(elapsed / duration, 1);
                const progress = easeInOutCubic(rawProgress);

                Object.entries(params).forEach(([key, targetValue]) => {
                    try {
                        const paramIndex = coreModel.getParameterIndex(key);
                        if (paramIndex >= 0) {
                            const minValue = coreModel.getParameterMinimumValue(paramIndex);
                            const maxValue = coreModel.getParameterMaximumValue(paramIndex);
                            const startValue = startValues[key] !== undefined ? startValues[key] : 0;
                            const currentValue = startValue + (targetValue - startValue) * progress;
                            const clampedValue = Math.max(minValue, Math.min(maxValue, currentValue));
                            coreModel.setParameterValueByIndex(paramIndex, clampedValue);
                        }
                    } catch (e) {}
                });

                if (rawProgress < 1) {
                    window._emotionAnimationId = requestAnimationFrame(animate);
                } else {
                    window._emotionAnimationId = null;
                }
            };

            animate();
        } catch (err) {
            console.log('表情参数设置失败:', err.message);
        }
    }, []);

    const playMotion = useCallback((group, index = 0) => {
        if (!globalModel) return;
        try {
            globalModel.motion(group, index);
        } catch (err) {
            console.log('动作播放失败:', err.message);
        }
    }, []);

    const setFocus = useCallback((x, y) => {
        if (!globalModel) return;
        try {
            globalModel.focus(x, y);
        } catch(e) {}
    }, []);

    return {
        isLoaded,
        loadError,
        setExpressionByParams,
        playMotion,
        setFocus,
        model: { current: globalModel },
    };
}