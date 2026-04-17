class EmotionService {
    // 8种有效情绪
    static VALID_EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'anxious', 'calm', 'thinking', 'love'];

    // 情绪映射（兼容各种 AI 返回值）
    static mapToValidEmotion(emotion) {
        const emotionMap = {
            'happy': 'happy',
            'joy': 'happy',
            'excited': 'happy',
            'glad': 'happy',
            'gentle': 'calm',
            'peaceful': 'calm',
            'relaxed': 'calm',
            'calm': 'calm',
            'sad': 'sad',
            'depressed': 'sad',
            'lonely': 'sad',
            'upset': 'sad',
            'angry': 'angry',
            'annoyed': 'angry',
            'frustrated': 'angry',
            'mad': 'angry',
            'surprised': 'surprised',
            'shocked': 'surprised',
            'amazed': 'surprised',
            'anxious': 'anxious',
            'worried': 'anxious',
            'nervous': 'anxious',
            'stressed': 'anxious',
            'thinking': 'thinking',
            'curious': 'thinking',
            'confused': 'thinking',
            'love': 'love',
            'grateful': 'love',
            'caring': 'love',
            'affection': 'love'
        };
        if (!emotion) return 'calm';
        return emotionMap[emotion.toLowerCase()] || 'calm';
    }

    // 增强的本地情绪分析（中文关键词）
    static analyzeEmotion(text) {
        if (!text) return { emotion: 'calm', intensity: 3 };

        const emotionKeywords = {
            happy: { words: ['开心', '快乐', '高兴', '棒', '好', '喜欢', '哈哈', '嘻嘻', '太好了', '不错', '赞', '厉害', '优秀', '幸福', '满足', '愉快'], weight: 2 },
            sad: { words: ['难过', '伤心', '痛苦', '哭', '糟糕', '烦', '累', '失望', '无聊', '孤独', '寂寞', '心疼', '可惜', '遗憾', '悲伤', '郁闷', '沮丧'], weight: 2 },
            angry: { words: ['生气', '愤怒', '讨厌', '恨', '烦死', '气死', '受不了', '可恶', '混蛋', '该死', '恼火', '暴怒'], weight: 2 },
            surprised: { words: ['真的', '竟然', '居然', '哇', '天啊', '惊讶', '没想到', '不敢相信', '震惊', '意外', '不会吧', '我去'], weight: 2 },
            anxious: { words: ['焦虑', '担心', '害怕', '恐惧', '紧张', '不安', '慌', '怎么办', '压力', '崩溃', '烦躁', '忐忑'], weight: 2 },
            thinking: { words: ['为什么', '怎么', '什么', '吗', '想想', '思考', '分析', '研究', '了解', '知道', '觉得', '认为', '是否', '如何', '可能'], weight: 1 },
            love: { words: ['爱', '喜欢你', '想你', '感谢', '感恩', '温暖', '拥抱', '亲爱', '宝贝', '甜蜜', '心动', '暖心', '贴心', '体贴'], weight: 2 },
            calm: { words: ['好的', '嗯', '知道了', '平静', '安静', '还行', '一般', '正常', '可以'], weight: 1 }
        };

        const scores = {};
        for (const [emotion, config] of Object.entries(emotionKeywords)) {
            scores[emotion] = 0;
            for (const word of config.words) {
                if (text.includes(word)) {
                    scores[emotion] += config.weight;
                }
            }
        }

        let maxEmotion = 'calm';
        let maxScore = 0;
        for (const [emotion, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                maxEmotion = emotion;
            }
        }

        // 计算强度 (1-5)
        const intensity = Math.min(5, Math.max(1, Math.ceil(maxScore / 2) + 1));

        return { emotion: maxEmotion, intensity };
    }

    // 从 AI 回复中解析 [emotion:xxx] 标签
    static parseEmotionTag(text) {
        if (!text) return null;
        const match = text.match(/\[emotion:(\w+)\]/i);
        if (match) {
            return {
                emotion: this.mapToValidEmotion(match[1]),
                cleanText: text.replace(/\[emotion:\w+\]/gi, '').trim()
            };
        }
        return null;
    }

    // 情绪调节建议
    static getEmotionAdvice(emotion, intensity = 3) {
        const adviceMap = {
            happy: [
                '保持好心情，今天是美好的一天！',
                '你的快乐也感染了我呢~',
                '开心的时候记得分享给身边的人哦！'
            ],
            sad: [
                '难过的时候，给自己一个拥抱吧。',
                '试试深呼吸，吸气4秒，屏息4秒，呼气6秒。',
                '每个人都有低落的时候，这很正常。想聊聊吗？',
                '听一首舒缓的音乐，或者出去走走，可能会好一些。'
            ],
            angry: [
                '生气的时候，先让自己冷静10秒钟。',
                '试试把想说的话写下来，而不是立刻说出去。',
                '深呼吸几次，感受怒气慢慢消散。'
            ],
            surprised: [
                '生活总是充满意外，保持好奇心吧！',
                '意料之外的事情，有时反而是惊喜呢~'
            ],
            anxious: [
                '焦虑的时候，试试"5-4-3-2-1"感官练习：看5样东西、摸4样东西、听3种声音、闻2种气味、尝1种味道。',
                '把担心的事写下来，逐一分析哪些是可以控制的。',
                '试试冥想或正念呼吸，每天5分钟就有帮助。',
                '记住，大多数让我们焦虑的事情最终都不会发生。'
            ],
            calm: [
                '平静是一种力量，保持这份心态吧。',
                '内心平和的时候，最适合思考重要的事情。'
            ],
            thinking: [
                '思考是一种美好的习惯，慢慢来不着急。',
                '好奇心是最好的老师，继续探索吧！'
            ],
            love: [
                '感受到爱意是多么温暖的事啊~',
                '爱与被爱都是人生最美好的体验。',
                '把这份温暖传递下去吧！'
            ]
        };

        const advices = adviceMap[emotion] || adviceMap['calm'];
        // 强度高时优先返回更具指导性的建议（列表后面的）
        const index = intensity >= 4
            ? Math.min(advices.length - 1, Math.floor(Math.random() * advices.length / 2) + Math.ceil(advices.length / 2))
            : Math.floor(Math.random() * advices.length);
        return advices[index];
    }
}

module.exports = EmotionService;