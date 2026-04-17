const EmotionDiaryModel = require('../models/emotionDiaryModel');

/**
 * 情绪日记服务
 */
class EmotionDiaryService {
    static VALID_EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'anxious', 'calm', 'thinking', 'love'];

    /**
     * 手动记录情绪
     */
    static async createManualEntry(userId, data) {
        const { emotion, intensity, note } = data;

        if (!this.VALID_EMOTIONS.includes(emotion)) {
            throw new Error('无效的情绪类型');
        }
        if (intensity < 1 || intensity > 5) {
            throw new Error('情绪强度必须在1-5之间');
        }

        const today = new Date().toISOString().split('T')[0];
        const id = await EmotionDiaryModel.create(userId, {
            date: today,
            emotion,
            intensity: intensity || 3,
            note: note || '',
            source: 'manual'
        });

        return { id, date: today, emotion, intensity, note, source: 'manual' };
    }

    /**
     * 自动记录（从对话中）
     */
    static async createAutoEntry(userId, emotion, intensity = 3) {
        if (!this.VALID_EMOTIONS.includes(emotion)) {
            emotion = 'calm';
        }

        const today = new Date().toISOString().split('T')[0];

        // 每天最多自动记录20条，防止刷量
        const count = await EmotionDiaryModel.getTodayAutoCount(userId);
        if (count >= 20) return null;

        const id = await EmotionDiaryModel.create(userId, {
            date: today,
            emotion,
            intensity,
            note: '',
            source: 'auto'
        });

        return { id, date: today, emotion, intensity, source: 'auto' };
    }

    /**
     * 获取日记列表
     */
    static async getDiaryEntries(userId, startDate, endDate) {
        if (!startDate || !endDate) {
            // 默认最近30天
            endDate = new Date().toISOString().split('T')[0];
            const start = new Date();
            start.setDate(start.getDate() - 30);
            startDate = start.toISOString().split('T')[0];
        }
        return await EmotionDiaryModel.findByDateRange(userId, startDate, endDate);
    }

    /**
     * 获取统计数据
     */
    static async getStats(userId, period = 'weekly') {
        const endDate = new Date().toISOString().split('T')[0];
        const start = new Date();

        if (period === 'monthly') {
            start.setDate(start.getDate() - 30);
        } else {
            start.setDate(start.getDate() - 7);
        }

        const startDate = start.toISOString().split('T')[0];
        const stats = await EmotionDiaryModel.getStats(userId, startDate, endDate);

        // 计算情绪占比
        const total = stats.emotionDistribution.reduce((sum, item) => sum + item.count, 0);
        const distribution = stats.emotionDistribution.map(item => ({
            emotion: item.emotion,
            count: item.count,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
            avgIntensity: Math.round(item.avg_intensity * 10) / 10
        }));

        // 判断趋势
        const trend = this.calculateTrend(stats.dailyTrend);

        return {
            period,
            startDate,
            endDate,
            totalEntries: total,
            distribution,
            dailyTrend: stats.dailyTrend,
            overallTrend: trend
        };
    }

    /**
     * 获取日历数据
     */
    static async getCalendarData(userId, month) {
        // month 格式: '2026-04'
        const [year, mon] = month.split('-');
        const rawData = await EmotionDiaryModel.getCalendarData(userId, year, mon);

        // 按日期分组，取每天最多的情绪作为主要情绪
        const calendar = {};
        for (const row of rawData) {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            if (!calendar[dateStr]) {
                calendar[dateStr] = {
                    date: dateStr,
                    primaryEmotion: row.emotion,
                    avgIntensity: Math.round(row.avg_intensity * 10) / 10,
                    entryCount: row.count
                };
            }
        }

        return Object.values(calendar);
    }

    /**
     * 计算情绪趋势
     */
    static calculateTrend(dailyTrend) {
        if (!dailyTrend || dailyTrend.length < 2) return 'stable';

        const positiveEmotions = ['happy', 'calm', 'love'];

        // 前半段 vs 后半段的正面情绪占比
        const mid = Math.floor(dailyTrend.length / 2);
        const firstHalf = dailyTrend.slice(0, mid);
        const secondHalf = dailyTrend.slice(mid);

        const positiveRatio = (data) => {
            const positive = data.filter(d => positiveEmotions.includes(d.emotion)).length;
            return data.length > 0 ? positive / data.length : 0.5;
        };

        const firstRatio = positiveRatio(firstHalf);
        const secondRatio = positiveRatio(secondHalf);

        if (secondRatio - firstRatio > 0.15) return 'improving';
        if (firstRatio - secondRatio > 0.15) return 'declining';
        return 'stable';
    }

    /**
     * 删除日记
     */
    static async deleteEntry(id, userId) {
        const deleted = await EmotionDiaryModel.delete(id, userId);
        if (!deleted) throw new Error('日记不存在或无权删除');
        return true;
    }
}

module.exports = EmotionDiaryService;