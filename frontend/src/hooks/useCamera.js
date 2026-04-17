import { useState, useRef, useEffect, useCallback } from 'react';

export function useCamera(intervalMs = 5000) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [latestFrame, setLatestFrame] = useState(null);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    const captureFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState < 2) return; // video not ready

        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 320, 240);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        setLatestFrame(base64);
    }, []);

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsEnabled(true);
        } catch (err) {
            console.error('摄像头启动失败:', err);
            setError(err.message || '无法访问摄像头');
            setIsEnabled(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsEnabled(false);
        setLatestFrame(null);
    }, []);

    const toggleCamera = useCallback(() => {
        if (isEnabled) {
            stopCamera();
        } else {
            startCamera();
        }
    }, [isEnabled, startCamera, stopCamera]);

    // 定时截帧
    useEffect(() => {
        if (!isEnabled) return;

        // 立即截一帧
        const initialTimeout = setTimeout(captureFrame, 1000);

        // 每 intervalMs 截取一帧
        timerRef.current = setInterval(captureFrame, intervalMs);

        return () => {
            clearTimeout(initialTimeout);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isEnabled, intervalMs, captureFrame]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        isEnabled,
        latestFrame,
        error,
        startCamera,
        stopCamera,
        toggleCamera,
        videoRef,
        canvasRef
    };
}