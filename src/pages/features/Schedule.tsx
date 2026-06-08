import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { ScheduleItem } from '../../types';

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const db = await initDB();
    const all = await db.getAllFromIndex('schedule', 'by-date', todayStr);
    
    if (all.length === 0) {
      const presets: ScheduleItem[] = [
        { time: '08:00', title: '吃早餐', icon: '🥞', completed: false, order: 0, date: todayStr },
        { time: '09:00', title: '去上學', icon: '🏫', completed: false, order: 1, date: todayStr },
        { time: '12:00', title: '吃午餐', icon: '🍱', completed: false, order: 2, date: todayStr },
        { time: '18:00', title: '吃晚餐', icon: '🍲', completed: false, order: 3, date: todayStr },
        { time: '21:00', title: '睡覺', icon: '🛌', completed: false, order: 4, date: todayStr },
      ];
      for (const p of presets) { await db.add('schedule', p); }
      const loaded = await db.getAllFromIndex('schedule', 'by-date', todayStr);
      setItems(loaded.sort((a,b) => a.order - b.order));
    } else {
      setItems(all.sort((a,b) => a.order - b.order));
    }
  };

  const toggleItem = async (e: React.MouseEvent, item: ScheduleItem) => {
    e.stopPropagation();
    const db = await initDB();
    item.completed = !item.completed;
    await db.put('schedule', item);
    if (item.completed) { playSound('click'); speak(`${item.title} 完成`); }
    loadItems();
  };

  const moveUp = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === 0) return;
    const db = await initDB();
    const list = [...items];
    const temp = list[index].order;
    list[index].order = list[index-1].order;
    list[index-1].order = temp;
    await db.put('schedule', list[index]);
    await db.put('schedule', list[index-1]);
    loadItems();
  };

  const moveDown = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === items.length - 1) return;
    const db = await initDB();
    const list = [...items];
    const temp = list[index].order;
    list[index].order = list[index+1].order;
    list[index+1].order = temp;
    await db.put('schedule', list[index]);
    await db.put('schedule', list[index+1]);
    loadItems();
  };

  const readSchedule = () => {
    const uncompleted = items.filter(i => !i.completed);
    if (uncompleted.length === 0) { speak("所有行程都完成了"); } 
    else { speak("接下來要：" + uncompleted.slice(0, 3).map(i => `${i.time} ${i.title}`).join('，')); }
  };

  return (
    <PageContainer title="今日行程" icon="📋" color="border-amber-500">
      <div className="flex flex-col h-full gap-2 max-w-4xl mx-auto w-full overflow-hidden">
        
        <div className="flex justify-between items-center bg-amber-50 p-3 rounded-2xl border-2 border-amber-200 shrink-0">
          <div className="text-xl sm:text-2xl font-black text-amber-800">
            {todayStr.replace(/-/g, ' / ')}
          </div>
          <button 
            onClick={readSchedule}
            className="bg-white border-2 border-amber-300 text-amber-700 font-bold px-3 py-1.5 rounded-xl shadow-sm active:scale-95 text-lg flex items-center gap-1 hover:bg-amber-100"
          >
            <span>🔊</span> 唸出
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2 pb-4">
            {items.map((item, idx) => (
              <div 
                key={item.id}
                className={`flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border-2 transition-all ${item.completed ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-amber-200 cursor-pointer active:scale-[0.98] hover:border-amber-400'}`}
                onClick={(e) => { if(!item.completed) { toggleItem(e, item); } }}
              >
                <button 
                  onClick={(e) => toggleItem(e, item)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 mr-3 shrink-0 transition-colors ${item.completed ? 'bg-green-500 border-green-600 text-white shadow-inner' : 'bg-white border-slate-300'}`}
                >
                  {item.completed && <span className="text-2xl leading-none">✓</span>}
                </button>

                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className={`text-3xl shrink-0 ${item.completed ? 'grayscale' : ''}`}>{item.icon}</div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold text-slate-400">{item.time}</span>
                    <span className={`text-xl font-black truncate ${item.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{item.title}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 ml-2 shrink-0">
                  <button onClick={(e) => moveUp(e, idx)} disabled={idx === 0} className="w-8 h-8 bg-slate-100 rounded-lg text-lg flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:invisible active:scale-95 text-slate-500">▲</button>
                  <button onClick={(e) => moveDown(e, idx)} disabled={idx === items.length - 1} className="w-8 h-8 bg-slate-100 rounded-lg text-lg flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:invisible active:scale-95 text-slate-500">▼</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
