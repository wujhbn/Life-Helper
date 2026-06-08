import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { AppEvent } from '../../types';

const EVENT_TYPES = [
  { type: 'school', icon: '🏫', label: '上學' },
  { type: 'hospital', icon: '🏥', label: '看醫生' },
  { type: 'birthday', icon: '🎂', label: '生日' },
  { type: 'party', icon: '🎉', label: '派對' },
  { type: 'home', icon: '🏠', label: '在家' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const db = await initDB();
    const all = await db.getAll('events');
    setEvents(all);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleAddEvent = async (typeInfo: typeof EVENT_TYPES[0]) => {
    if (!selectedDate) return;
    const db = await initDB();
    await db.add('events', {
      date: selectedDate,
      title: typeInfo.label,
      type: typeInfo.type as AppEvent['type']
    });
    speak(`新增行程：${typeInfo.label}`);
    loadEvents();
  };

  const handleRemoveEvent = async (id: number) => {
    const db = await initDB();
    await db.delete('events', id);
    speak("移除行程");
    loadEvents();
  };

  const selectedDateEvents = events.filter(e => e.date === selectedDate);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    
    if (dayEvents.length > 0) {
      speak(`${month + 1}月${day}日，有 ${dayEvents.map(e => e.title).join('、')}`);
    } else {
      speak(`${month + 1}月${day}日`);
    }
  };

  return (
    <PageContainer title="日曆" icon="📅" color="border-blue-400">
      <div className="flex flex-col h-full gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-3xl border-4 border-blue-200 shrink-0">
          <button onClick={prevMonth} className="text-4xl p-4 bg-white rounded-2xl shadow hover:bg-blue-100 active:scale-95">◀️</button>
          <h3 className="text-4xl sm:text-5xl font-black text-blue-800">
            {year}年 {month + 1}月
          </h3>
          <button onClick={nextMonth} className="text-4xl p-4 bg-white rounded-2xl shadow hover:bg-blue-100 active:scale-95">▶️</button>
        </div>

        {/* Grid Container */}
        <div className="flex-1 flex flex-col sm:flex-row gap-6 min-h-0">
          
          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col bg-white border-4 border-slate-200 rounded-3xl overflow-hidden shadow-sm overflow-y-auto">
            <div className="grid grid-cols-7 bg-slate-200 p-2 shrink-0">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="text-center font-bold text-2xl sm:text-3xl py-2 text-slate-600">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-100 gap-[2px]">
              {blanks.map(b => <div key={`blank-${b}`} className="bg-white"></div>)}
              {days.map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                
                return (
                  <button 
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`bg-white p-2 flex flex-col items-center hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-100 ${isSelected ? 'ring-4 ring-inset ring-blue-500 bg-blue-50' : ''} ${isToday ? 'bg-yellow-50' : ''}`}
                  >
                    <span className={`text-2xl sm:text-4xl font-bold ${isToday ? 'text-blue-600 bg-blue-100 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-1' : 'text-slate-700 mt-1 mb-2'}`}>
                      {day}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1">
                      {dayEvents.map((e, i) => (
                        <span key={i} className="text-xl sm:text-3xl leading-none">
                          {EVENT_TYPES.find(t => t.type === e.type)?.icon}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Panel */}
          {selectedDate && (
            <div className="w-full sm:w-96 flex flex-col bg-blue-50 rounded-3xl border-4 border-blue-200 p-4 shrink-0 overflow-y-auto">
              <h4 className="text-3xl font-black text-blue-800 mb-6 border-b-4 border-blue-200 pb-2">
                {selectedDate.replace(/-/g, ' / ')}
              </h4>
              
              <div className="flex-1 overflow-y-auto mb-4">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-2xl text-blue-400 font-bold text-center py-8">今天沒有行程哦！</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedDateEvents.map(e => (
                      <div key={e.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{EVENT_TYPES.find(t => t.type === e.type)?.icon}</span>
                          <span className="text-2xl font-bold">{e.title}</span>
                        </div>
                        <button 
                          onClick={() => e.id && handleRemoveEvent(e.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-xl text-xl font-bold active:scale-95"
                        >
                          刪除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-4 border-blue-200">
                <p className="text-xl font-bold text-blue-700 mb-3">＋ 新增行程貼紙：</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {EVENT_TYPES.map(t => (
                    <button
                      key={t.type}
                      onClick={() => handleAddEvent(t)}
                      className="bg-white hover:bg-blue-100 p-4 rounded-2xl shadow-md text-3xl active:scale-95 border-2 border-slate-200 flex flex-col items-center gap-2 w-24"
                    >
                      <span className="text-4xl">{t.icon}</span>
                      <span className="text-sm font-bold text-slate-600">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
