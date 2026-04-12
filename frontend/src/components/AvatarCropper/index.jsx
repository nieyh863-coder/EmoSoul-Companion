import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import './AvatarCropper.css';

/**
 * 头像裁剪组件
 */
const AvatarCropper = ({ image, onCrop, onCancel }) => {
    const cropperRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleCrop = useCallback(async () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        setLoading(true);
        try {
            // 获取裁剪后的圆形图片
            const canvas = cropper.getCroppedCanvas({
                width: 300,
                height: 300,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            // 创建圆形裁剪
            const circularCanvas = document.createElement('canvas');
            const ctx = circularCanvas.getContext('2d');
            circularCanvas.width = 300;
            circularCanvas.height = 300;

            // 绘制圆形
            ctx.beginPath();
            ctx.arc(150, 150, 150, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(canvas, 0, 0, 300, 300);

            // 转换为Base64
            const croppedImage = circularCanvas.toDataURL('image/jpeg', 0.9);
            onCrop(croppedImage);
        } catch (error) {
            console.error('裁剪失败:', error);
        } finally {
            setLoading(false);
        }
    }, [onCrop]);

    return (
        <div className="avatar-cropper-overlay">
            <div className="avatar-cropper-modal">
                <h3>裁剪头像</h3>

                <div className="cropper-container">
                    <Cropper
                        ref={cropperRef}
                        src={image}
                        style={{ height: 400, width: '100%' }}
                        aspectRatio={1}
                        guides={true}
                        viewMode={1}
                        dragMode="move"
                        autoCropArea={1}
                        background={false}
                        responsive={true}
                        checkOrientation={false}
                        minCropBoxWidth={100}
                        minCropBoxHeight={100}
                    />
                </div>

                <div className="cropper-tips">
                    <p>💡 提示：拖动图片调整位置，滚动缩放大小</p>
                </div>

                <div className="cropper-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCrop}
                        disabled={loading}
                    >
                        {loading ? '处理中...' : '确认裁剪'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarCropper;