/**
 * 左侧「我的状态」选项（类似微信状态，与 AI 回复情绪独立）
 */
export const COMPANION_STATUSES = [
    { id: 'happy', emoji: '😊', label: '开心' },
    { id: 'work', emoji: '💼', label: '工作' },
    { id: 'coffee', emoji: '☕', label: '咖啡' },
    { id: 'cracked', emoji: '🤯', label: '裂开' },
    { id: 'thinking', emoji: '🤔', label: '思考' },
    { id: 'study', emoji: '📚', label: '学习中' },
    { id: 'gaming', emoji: '🎮', label: '打游戏' },
    { id: 'chill', emoji: '😴', label: '摸鱼' },
    { id: 'music', emoji: '🎵', label: '听歌' },
    { id: 'sport', emoji: '🏃', label: '运动' },
    { id: 'vacation', emoji: '🌴', label: '度假' },
    { id: 'love', emoji: '💕', label: '心动' }
];

export function getCompanionStatusById(id) {
    return (
        COMPANION_STATUSES.find((s) => s.id === id) ||
        COMPANION_STATUSES.find((s) => s.id === 'thinking')
    );
}