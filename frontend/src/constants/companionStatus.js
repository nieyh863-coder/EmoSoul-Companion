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

/**
 * AI 情绪类型（8种，用于 DigitalAvatar 和 ChatMessage 情绪显示）
 */
export const AI_EMOTIONS = [
    { id: 'happy', emoji: '😊', label: '开心', particleColor: '#FFD700' },
    { id: 'sad', emoji: '😢', label: '难过', particleColor: '#64B5F6' },
    { id: 'angry', emoji: '😠', label: '生气', particleColor: '#FF5252' },
    { id: 'surprised', emoji: '😲', label: '惊讶', particleColor: '#FF9800' },
    { id: 'anxious', emoji: '😰', label: '焦虑', particleColor: '#FFC107' },
    { id: 'calm', emoji: '😌', label: '平静', particleColor: '#81C784' },
    { id: 'thinking', emoji: '🤔', label: '思考', particleColor: '#CE93D8' },
    { id: 'love', emoji: '🥰', label: '喜爱', particleColor: '#F48FB1' }
];

export const EMOTION_EMOJI = {
    happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
    anxious: '😰', calm: '😌', thinking: '🤔', love: '🥰'
};

export const EMOTION_LABEL = {
    happy: '开心', sad: '难过', angry: '生气', surprised: '惊讶',
    anxious: '焦虑', calm: '平静', thinking: '思考', love: '喜爱'
};