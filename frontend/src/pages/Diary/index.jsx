import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useDiaryStore from '../../store/diaryStore';
import useThemeStore from '../../store/themeStore';
import './Diary.css';

// 情绪配置
const EMOTIONS = [
  { key: 'happy', label: '开心', emoji: '😊', color: '#FFD700' },
  { key: 'sad', label: '难过', emoji: '😢', color: '#64B5F6' },
  { key: 'angry', label: '生气', emoji: '😠', color: '#FF5252' },
  { key: 'surprised', label: '惊讶', emoji: '😲', color: '#FF9800' },
  { key: 'anxious', label: '焦虑', emoji: '😰', color: '#FFC107' },
  { key: 'calm', label: '平静', emoji: '😌', color: '#81C784' },
  { key: 'thinking', label: '思考', emoji: '🤔', color: '#CE93D8' },
  { key: 'love', label: '喜爱', emoji: '🥰', color: '#F48FB1' },
];

const getEmotionConfig = (key) => EMOTIONS.find(e => e.key === key) || EMOTIONS[5];

/**
 * 情绪日记页面
 */
const Diary = () => {
  const navigate = useNavigate();
  const { calendarData, stats, isLoading, currentMonth, loadCalendar, loadStats, createEntry, setMonth } = useDiaryStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  const [statsPeriod, setStatsPeriod] = useState('weekly');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [recordForm, setRecordForm] = useState({ emotion: 'calm', intensity: 3, note: '' });

  useEffect(() => {
    loadCalendar();
    loadStats(statsPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (period) => {
    setStatsPeriod(period);
    loadStats(period);
  };

  const handleMonthChange = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + direction;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setMonth(newMonthStr);
    loadCalendar(newMonthStr);
  };

  const handleRecord = async () => {
    try {
      await createEntry(recordForm);
      toast.success('情绪记录成功！');
      setShowRecordModal(false);
      setRecordForm({ emotion: 'calm', intensity: 3, note: '' });
    } catch (err) {
      toast.error('记录失败');
    }
  };

  // 生成日历格子
  const renderCalendar = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarMap = {};
    calendarData.forEach(item => {
      const day = new Date(item.date).getDate();
      calendarMap[day] = item;
    });

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="diary-calendar-cell empty" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const data = calendarMap[day];
      const emotionConfig = data ? getEmotionConfig(data.primaryEmotion) : null;
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() + 1 === month &&
        new Date().getFullYear() === year;

      cells.push(
        <div
          key={day}
          className={`diary-calendar-cell ${isToday ? 'today' : ''} ${data ? 'has-data' : ''}`}
          onClick={() => data && setSelectedDate(data)}
          style={data ? { '--emotion-color': emotionConfig.color } : {}}
        >
          <span className="diary-cell-day">{day}</span>
          {data && <span className="diary-cell-emoji">{emotionConfig.emoji}</span>}
        </div>
      );
    }
    return cells;
  };

  // 情绪分布
  const renderDistribution = () => {
    if (!stats || !stats.distribution || stats.distribution.length === 0) {
      return <div className="diary-empty-stats">暂无数据，开始聊天或记录情绪吧~</div>;
    }

    return (
      <div className="diary-emotion-distribution">
        {stats.distribution.map(item => {
          const config = getEmotionConfig(item.emotion);
          return (
            <div key={item.emotion} className="diary-dist-item">
              <div className="diary-dist-bar-wrapper">
                <div
                  className="diary-dist-bar"
                  style={{ width: `${item.percentage}%`, background: config.color }}
                />
              </div>
              <span className="diary-dist-emoji">{config.emoji}</span>
              <span className="diary-dist-label">{config.label}</span>
              <span className="diary-dist-percent">{item.percentage}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 趋势指示
  const renderTrend = () => {
    if (!stats) return null;
    const trendMap = {
      improving: { text: '情绪趋势向好 📈', className: 'diary-trend-up' },
      declining: { text: '情绪有所波动 📉', className: 'diary-trend-down' },
      stable: { text: '情绪保持稳定 ➡️', className: 'diary-trend-stable' }
    };
    const trend = trendMap[stats.overallTrend] || trendMap.stable;
    return (
      <div className={`diary-trend-indicator ${trend.className}`}>
        {trend.text}
      </div>
    );
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className={`diary-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* 顶部导航 */}
      <header className="diary-header">
        <div className="header-brand">
          <h1>语你相伴</h1>
        </div>
        <nav className="header-nav">
          <button className="nav-btn" onClick={() => navigate('/home')}>对话</button>
          <button className="nav-btn active">日记</button>
          <button className="nav-btn" onClick={() => navigate('/profile')}>我的</button>
          <button className="mode-toggle-btn" onClick={toggleDarkMode} aria-label={darkMode ? '切换到白天模式' : '切换到夜间模式'}>
            <span className={`mode-icon iconfont ${darkMode ? 'icon-taiyang' : 'icon-ansemoshi'}`}></span>
          </button>
        </nav>
      </header>

      <div className="diary-content">
        {/* 统计周期切换 */}
        <div className="diary-period-tabs">
          <button
            className={`diary-period-tab ${statsPeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('weekly')}
          >近一周</button>
          <button
            className={`diary-period-tab ${statsPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('monthly')}
          >近一月</button>
        </div>

        {/* 趋势 + 情绪分布 */}
        <div className="diary-stats-section">
          {renderTrend()}
          <div className="diary-stats-card">
            <h3>情绪分布</h3>
            {renderDistribution()}
          </div>
        </div>

        {/* 日历 */}
        <div className="diary-calendar-section">
          <div className="diary-calendar-nav">
            <button onClick={() => handleMonthChange(-1)}>‹</button>
            <span>{year}年{monthNames[month]}</span>
            <button onClick={() => handleMonthChange(1)}>›</button>
          </div>
          <div className="diary-calendar-weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="diary-weekday">{d}</div>
            ))}
          </div>
          <div className="diary-calendar-grid">
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* 日期详情弹窗 */}
      {selectedDate && (
        <div className="diary-overlay" onClick={() => setSelectedDate(null)}>
          <div className="diary-detail-card" onClick={e => e.stopPropagation()}>
            <h4>{selectedDate.date}</h4>
            <div className="diary-detail-emotion">
              <span className="diary-detail-emoji">{getEmotionConfig(selectedDate.primaryEmotion).emoji}</span>
              <span>{getEmotionConfig(selectedDate.primaryEmotion).label}</span>
              <span className="diary-detail-intensity">强度: {selectedDate.avgIntensity}/5</span>
            </div>
            <p className="diary-detail-count">共 {selectedDate.entryCount} 条记录</p>
            <button className="btn btn-secondary" onClick={() => setSelectedDate(null)}>关闭</button>
          </div>
        </div>
      )}

      {/* FAB 按钮 */}
      <button className="diary-fab-btn" onClick={() => setShowRecordModal(true)}>
        <span>+</span>
      </button>

      {/* 手动记录弹窗 */}
      {showRecordModal && (
        <div className="diary-overlay" onClick={() => setShowRecordModal(false)}>
          <div className="diary-record-modal" onClick={e => e.stopPropagation()}>
            <h3>记录此刻心情</h3>

            <div className="diary-emotion-selector">
              {EMOTIONS.map(e => (
                <button
                  key={e.key}
                  className={`diary-emotion-option ${recordForm.emotion === e.key ? 'active' : ''}`}
                  onClick={() => setRecordForm(prev => ({ ...prev, emotion: e.key }))}
                  style={recordForm.emotion === e.key ? { borderColor: e.color, background: `${e.color}15` } : {}}
                >
                  <span className="diary-emo-emoji">{e.emoji}</span>
                  <span className="diary-emo-label">{e.label}</span>
                </button>
              ))}
            </div>

            <div className="diary-intensity-slider">
              <label>强度: {recordForm.intensity}</label>
              <input
                type="range"
                min="1" max="5"
                value={recordForm.intensity}
                onChange={e => setRecordForm(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
              />
              <div className="diary-intensity-labels">
                <span>轻微</span><span>强烈</span>
              </div>
            </div>

            <textarea
              className="diary-note-input"
              placeholder="写点什么吧...（可选）"
              value={recordForm.note}
              onChange={e => setRecordForm(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
            />

            <div className="diary-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRecordModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleRecord}>记录</button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div className="diary-loading">加载中...</div>}
    </div>
  );
};

export default Diary;
