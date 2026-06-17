import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { AppEvent, ScheduleItem } from '../../types';

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
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const db = await initDB();
    const allEvents = await db.getAll('events');
    setEvents(allEvents);
    const allSchedules = await db.getAll('schedule');
    setSchedules(allSchedules);
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
    loadData();
  };

  const handleRemoveEvent = async (id: number) => {
    const db = await initDB();
    await db.delete('events', id);
    speak("移除行程");
    loadData();
  };

  const selectedDateEvents = events.filter(e => e.date === selectedDate);
  const selectedDateSchedules = schedules.filter(s => s.date === selectedDate);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    const daySchedules = schedules.filter(s => s.date === dateStr);
    
    speak(`${month + 1}月${day}日`);

    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <PageContainer title="日曆" icon="📅" color="border-blue-400">
      <div className="flex flex-col h-full gap-2 min-h-0">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-50 p-2 rounded-2xl border-2 border-blue-200 shrink-0">
          <button onClick={prevMonth} className="text-xl px-4 py-2 bg-white rounded-xl shadow hover:bg-blue-100 active:scale-95">◀️</button>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-800">
            {year}年 {month + 1}月
          </h3>
          <button onClick={nextMonth} className="text-xl px-4 py-2 bg-white rounded-xl shadow hover:bg-blue-100 active:scale-95">▶️</button>
        </div>

        {/* Container */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 min-h-0 overflow-y-auto pb-4">
          
          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm shrink-0 min-h-[400px]">
            <div className="grid grid-cols-7 bg-slate-200 p-1 shrink-0">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="text-center font-bold text-sm sm:text-base py-1 text-slate-600">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-100 gap-[1px]">
              {blanks.map(b => <div key={`blank-${b}`} className="bg-white"></div>)}
              {days.map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const daySchedules = schedules.filter(s => s.date === dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                
                return (
                  <button 
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`bg-white p-1 xl:p-2 flex flex-col items-center hover:bg-blue-50 transition-colors focus:outline-none ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50' : ''} ${isToday ? 'bg-yellow-50' : ''}`}
                  >
                    <span className={`text-base sm:text-lg font-bold ${isToday ? 'text-blue-600 bg-blue-100 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-0.5' : 'text-slate-700 mb-1'}`}>
                      {day}
                    </span>
                    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                      {(dayEvents.length > 0 || daySchedules.length > 0) && (
                        <span className="text-sm sm:text-base xl:text-lg leading-none">📋</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Panel */}
          <div ref={panelRef} className="w-full sm:w-72 flex flex-col bg-blue-50 rounded-2xl border-2 border-blue-200 p-3 shrink-0 h-auto sm:h-full overflow-hidden">
            {selectedDate ? (
              <>
                <h4 className="text-lg font-black text-blue-800 mb-2 border-b-2 border-blue-200 pb-1 text-center">
                  {selectedDate.replace(/-/g, ' / ')}
                </h4>
                
                <Link to={`/schedule?date=${selectedDate}`} className="mb-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-center active:scale-95 shadow-sm">
                  <span className="mr-1">📋</span> 查看詳細行程
                </Link>
                
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[250px] sm:max-h-full min-h-[50px]">
                  {selectedDateEvents.length === 0 && selectedDateSchedules.length === 0 ? (
                    <p className="text-sm text-blue-400 font-bold text-center py-4">今天沒有紀錄</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedDateEvents.map(e => (
                        <div 
                          key={e.id} 
                          onClick={() => speak(e.title)}
                          className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{EVENT_TYPES.find(t => t.type === e.type)?.icon}</span>
                            <span className="text-sm font-bold">{e.title}</span>
                          </div>
                          <button 
                            onClick={(ev) => {
                              ev.stopPropagation();
                              e.id && handleRemoveEvent(e.id);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-lg text-xs font-bold active:scale-95 shrink-0"
                          >
                            刪除
                          </button>
                        </div>
                      ))}
                      {selectedDateSchedules.map(s => (
                        <div 
                          key={`schedule-${s.id}`} 
                          onClick={() => speak(s.title)}
                          className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-100 opacity-80 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 shrink truncate">
                            <span className="text-xl">{s.icon}</span>
                            <span className="text-sm font-bold truncate">{s.title}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400 border border-slate-200 px-1 rounded shrink-0">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t-2 border-blue-200 shrink-0">
                  <p className="text-xs font-bold text-blue-700 mb-2 text-center">＋ 新增貼紙</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EVENT_TYPES.map(t => (
                      <button
                        key={t.type}
                        onClick={() => handleAddEvent(t)}
                        className="bg-white hover:bg-blue-100 p-2 rounded-xl shadow-sm text-lg active:scale-95 border border-slate-200 flex flex-col items-center gap-1 w-12"
                      >
                        <span className="text-xl">{t.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[120px]">
                <p className="text-blue-400 font-bold text-center">請點選日期以查看或新增行程<br/><span className="text-2xl mt-2 inline-block">📅</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
