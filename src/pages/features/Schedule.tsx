import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { ScheduleItem } from '../../types';

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isEditing, setIsEditing] = useState<ScheduleItem | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    
    if (draggedItemIndex !== dropIndex) {
      const newList = [...items];
      const draggedItem = newList.splice(draggedItemIndex, 1)[0];
      newList.splice(dropIndex, 0, draggedItem);
      
      const db = await initDB();
      for (let i = 0; i < newList.length; i++) {
        if (newList[i].order !== i) {
           newList[i].order = i;
           await db.put('schedule', newList[i]);
        }
      }
      setItems(newList);
      loadItems(); // keep in sync
    }
    
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const deleteItemFast = async (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    if (!id) return;
    const db = await initDB();
    await db.delete('schedule', id);
    loadItems();
  };

  const saveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditing) return;
    const db = await initDB();
    
    // Check if new item
    if (!isEditing.id) {
      isEditing.order = items.length;
    }
    await db.put('schedule', isEditing);
    setIsEditing(null);
    loadItems();
  };

  const deleteItem = async () => {
    if (!isEditing?.id) return;
    const db = await initDB();
    await db.delete('schedule', isEditing.id);
    setIsEditing(null);
    loadItems();
  };

  return (
    <PageContainer title="今日行程" icon="📋" color="border-amber-500">
      <div className="flex flex-col h-full gap-2 max-w-4xl mx-auto w-full overflow-hidden">
        
        <div className="flex justify-between items-center bg-amber-50 p-3 rounded-2xl border-2 border-amber-200 shrink-0">
          <div className="text-xl sm:text-2xl font-black text-amber-800">
            {todayStr.replace(/-/g, ' / ')}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing({ time: '12:00', title: '', icon: '🌟', completed: false, order: items.length, date: todayStr })}
              className="bg-amber-500 border-b-4 border-amber-700 text-white font-black px-6 py-2 rounded-xl shadow-sm active:border-b-0 active:translate-y-1 text-xl flex flex-row items-center gap-2 whitespace-nowrap transition-all"
            >
              <span>+</span> 新增行程
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2 pb-4">
            {items.map((item, idx) => (
              <div 
                key={item.id}
                draggable={!item.completed}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border-2 transition-all ${
                  item.completed ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-amber-200 cursor-pointer hover:border-amber-400'
                } ${draggedItemIndex === idx ? 'opacity-50 scale-95' : ''} ${dragOverItemIndex === idx && draggedItemIndex !== idx ? 'border-dashed border-amber-500 bg-amber-50 relative' : ''}`}
                onClick={(e) => { if(!item.completed) { toggleItem(e, item); } }}
              >
                <div className="w-5 flex shrink-0 items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                  {!item.completed && (
                    <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600">
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="4" cy="4" r="1.5" />
                        <circle cx="8" cy="4" r="1.5" />
                        <circle cx="4" cy="10" r="1.5" />
                        <circle cx="8" cy="10" r="1.5" />
                        <circle cx="4" cy="16" r="1.5" />
                        <circle cx="8" cy="16" r="1.5" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-14 shrink-0 mx-1">
                  <button 
                    onClick={(e) => toggleItem(e, item)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${item.completed ? 'bg-green-500 border-green-600 text-white shadow-inner' : 'bg-white border-slate-300'}`}
                  >
                    {item.completed && <span className="text-2xl leading-none">✓</span>}
                  </button>
                </div>

                <div 
                  className="flex-1 flex items-center gap-3 min-w-0" 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(item); }}
                >
                  <div className={`text-3xl shrink-0 ${item.completed ? 'grayscale' : ''}`}>{item.icon}</div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold text-slate-400">{item.time}</span>
                    <span className={`text-xl font-black truncate ${item.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{item.title}</span>
                  </div>
                </div>

                <div className="flex items-center ml-1 shrink-0">
                  <button onClick={(e) => deleteItemFast(e, item.id)} className="w-10 h-10 bg-red-50 border-2 border-red-100 text-red-500 rounded-xl text-lg flex items-center justify-center hover:bg-red-100 hover:text-red-700 active:scale-95 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-100 px-6 py-4 flex justify-between items-center border-b-2 border-amber-200">
              <h2 className="text-2xl font-black text-amber-800">{isEditing.id ? '編輯行程' : '新增行程'}</h2>
              <button onClick={() => setIsEditing(null)} className="text-amber-500 font-bold text-xl px-2 py-1 bg-white rounded-lg shadow-sm active:scale-95">關閉</button>
            </div>
            
            <form onSubmit={saveItem} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-bold px-1">時間</label>
                <input type="time" value={isEditing.time} onChange={e => setIsEditing({...isEditing, time: e.target.value})} className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-2xl font-black focus:border-amber-400 focus:outline-none" required />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-bold px-1">事項</label>
                <input type="text" value={isEditing.title} onChange={e => setIsEditing({...isEditing, title: e.target.value})} placeholder="例如: 洗澡" className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-2xl font-black focus:border-amber-400 focus:outline-none" required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500 font-bold px-1">圖示</label>
                <input type="text" value={isEditing.icon} onChange={e => setIsEditing({...isEditing, icon: e.target.value})} className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-3xl text-center focus:border-amber-400 focus:outline-none" required maxLength={2} />
              </div>

              <div className="mt-4 flex gap-3">
                {isEditing.id && (
                  <button type="button" onClick={deleteItem} className="flex-1 border-2 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 py-4 rounded-2xl font-black text-xl shadow-sm active:scale-95 transition-all">刪除</button>
                )}
                <button type="submit" className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl text-xl shadow-md border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all">儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
