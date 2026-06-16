import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { getItem, setItem } from '../../lib/storage';

interface AlarmItem {
  id: number;
  time: string;
  enabled: boolean;
  label: string;
}

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('起床');

  useEffect(() => {
    const saved = getItem<AlarmItem[]>('life-helper-alarms', []);
    setAlarms(saved);
  }, []);

  const saveAlarms = (a: AlarmItem[]) => {
    setAlarms(a);
    setItem('life-helper-alarms', a);
  };

  const addAlarm = () => {
    const a: AlarmItem = { id: Date.now(), time: newTime, label: newLabel, enabled: true };
    const saved = [...alarms, a].sort((a,b) => a.time.localeCompare(b.time));
    saveAlarms(saved);
    speak('已設定鬧鐘');
    setIsEditing(false);
  };

  const toggleAlarm = (id: number) => {
    const updated = alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    saveAlarms(updated);
  };

  const deleteAlarm = (id: number) => {
    saveAlarms(alarms.filter(a => a.id !== id));
  };

  return (
    <PageContainer title="鬧鐘" icon="⏰" color="border-sky-400">
      <div className="flex flex-col h-full w-full px-2 gap-4">
        {!isEditing ? (
          <>
            <div className="shrink-0 flex justify-end mt-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-sky-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 border-b-2 border-sky-700 active:border-b-0 active:translate-y-0.5 shadow-sm"
              >
                ➕ 新增鬧鐘
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-6">
              {alarms.map(alarm => (
                <div key={alarm.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex flex-col cursor-pointer" onClick={() => speak(`${alarm.time} 鬧鐘 ${alarm.label}`)}>
                    <span className={`text-4xl font-black ${alarm.enabled ? 'text-slate-800' : 'text-slate-400'}`}>{alarm.time}</span>
                    <span className={`text-lg font-bold mt-1 ${alarm.enabled ? 'text-slate-600' : 'text-slate-400'}`}>{alarm.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleAlarm(alarm.id)} className={`w-16 h-10 rounded-full flex items-center p-1.5 transition-colors ${alarm.enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`bg-white w-7 h-7 rounded-full shadow border border-slate-100 transform transition-transform duration-300 ${alarm.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <button onClick={() => deleteAlarm(alarm.id)} className="text-xl p-2 text-slate-300 hover:text-red-500 active:scale-95">🗑️</button>
                  </div>
                </div>
              ))}
              {alarms.length === 0 && <div className="text-center text-slate-400 font-bold m-auto mt-20">目前沒有設定鬧鐘</div>}
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-slate-200 flex flex-col gap-5 mt-4">
            <h3 className="text-2xl font-black text-slate-800 border-b-2 border-slate-100 pb-3">設定鬧鐘</h3>
            <label className="flex flex-col gap-2">
              <span className="font-bold text-slate-600">時間</span>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="border-2 border-slate-200 bg-slate-50 rounded-xl p-3 text-2xl font-black focus:border-sky-400 outline-none" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-bold text-slate-600">鬧鐘名稱</span>
              <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="border-2 border-slate-200 bg-slate-50 rounded-xl p-3 text-lg font-bold focus:border-sky-400 outline-none" placeholder="例如：起床、吃藥" />
            </label>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-black active:scale-95 border-b-2 border-slate-300 active:border-b-0 active:translate-y-0.5">取消</button>
              <button onClick={addAlarm} className="flex-1 bg-sky-500 text-white py-3 rounded-xl font-black active:scale-95 border-b-2 border-sky-700 active:border-b-0 active:translate-y-0.5">儲存</button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
