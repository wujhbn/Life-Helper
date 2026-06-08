import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { TaskCard } from '../../types';

const PRESET_TASKS = [
  { title: "洗手步驟", steps: ["打開水龍頭 💦", "抹肥皂 🧼", "搓搓手 👏", "沖乾淨 🚿", "擦乾手 🧻"] },
  { title: "整理書包", steps: ["拿出聯絡簿 📓", "放進鉛筆盒 ✏️", "放進水壺 💧", "拉上拉鍊 🎒", "放在門口 🚪"] }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [activeTask, setActiveTask] = useState<TaskCard | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const db = await initDB();
    const all = await db.getAll('taskCards');
    if (all.length === 0) {
      for (const pt of PRESET_TASKS) {
        await db.add('taskCards', {
          title: pt.title,
          steps: pt.steps.map((text, i) => ({ id: `step-${Date.now()}-${i}`, text, completed: false })),
          createdAt: Date.now()
        });
      }
      setTasks(await db.getAll('taskCards'));
    } else {
      setTasks(all);
    }
  };

  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    const db = await initDB();
    const taskToSave = {
      ...editingTask,
      steps: editingTask.steps.filter(s => s.text.trim() !== '')
    };
    if (taskToSave.steps.length === 0) return; // Validate: Must have at least one step

    if (taskToSave.id) {
      await db.put('taskCards', taskToSave);
    } else {
      await db.add('taskCards', taskToSave);
    }
    setEditingTask(null);
    loadTasks();
  };

  const handleDeleteTask = async (id: number) => {
    const db = await initDB();
    await db.delete('taskCards', id);
    setDeleteConfirmId(null);
    loadTasks();
  };

  const startTask = (task: TaskCard) => {
    const freshTask = { ...task, steps: task.steps.map(s => ({ ...s, completed: false })) };
    setActiveTask(freshTask);
    setCurrentStepIdx(0);
    speak(`${task.title} 開始`);
  };

  const completeStep = () => {
    if (!activeTask) return;
    playSound('click');
    const newSteps = [...activeTask.steps];
    newSteps[currentStepIdx].completed = true;
    const newTask = { ...activeTask, steps: newSteps };
    setActiveTask(newTask);

    if (currentStepIdx < activeTask.steps.length - 1) {
      setTimeout(() => {
        setCurrentStepIdx(currentStepIdx + 1);
        speak(`下一步：${newSteps[currentStepIdx + 1].text}`);
      }, 500);
    } else {
      setTimeout(() => {
        playSound('complete');
        speak(`${activeTask.title}，完成！`);
      }, 500);
    }
  };

  const nextStep = () => { if (activeTask && currentStepIdx < activeTask.steps.length - 1) { setCurrentStepIdx(currentStepIdx + 1); } };
  const prevStep = () => { if (activeTask && currentStepIdx > 0) { setCurrentStepIdx(currentStepIdx - 1); } };

  if (activeTask) {
    const allCompleted = activeTask.steps.every(s => s.completed);
    
    return (
      <PageContainer title={activeTask.title} icon="📝" color="border-indigo-500">
        <div className="flex flex-col h-full gap-4 overflow-y-auto w-full">
          
          <div className="flex justify-between items-center bg-indigo-50 p-2 sm:p-3 rounded-xl border-2 border-indigo-200 shrink-0">
             <button onClick={() => setActiveTask(null)} className="text-sm font-bold text-indigo-700 bg-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-sm hover:bg-indigo-100 active:scale-95">放棄退出</button>
             <div className="text-lg sm:text-xl font-bold text-indigo-800 pr-2">
                進度：{activeTask.steps.filter(s => s.completed).length}/{activeTask.steps.length}
             </div>
          </div>

          {!allCompleted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
               <div className="text-center transition-all duration-300 shrink-0">
                 <div className="text-lg sm:text-xl text-slate-400 mb-2 font-bold">第 {currentStepIdx + 1} 步</div>
                 <div className="text-4xl sm:text-6xl font-black text-indigo-700 leading-tight">
                   {activeTask.steps[currentStepIdx].text}
                 </div>
               </div>

               <button 
                 onClick={completeStep}
                 disabled={activeTask.steps[currentStepIdx].completed}
                 className="bg-indigo-500 hover:bg-indigo-600 text-white text-3xl font-black py-6 px-12 rounded-[2rem] active:scale-95 transition-all shadow-md border-b-8 border-indigo-700 active:border-b-0 active:translate-y-2 flex items-center gap-4 shrink-0"
               >
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-500 text-2xl">✓</div>
                 作好了！
               </button>

               <div className="flex gap-4 w-full max-w-sm justify-between px-4 shrink-0 mt-4">
                 <button onClick={prevStep} disabled={currentStepIdx === 0} className="text-xl font-bold text-slate-400 disabled:opacity-30 hover:text-indigo-500 disabled:hover:text-slate-400 p-2">◀ 上步</button>
                 <button onClick={nextStep} disabled={currentStepIdx === activeTask.steps.length - 1} className="text-xl font-bold text-slate-400 disabled:opacity-30 hover:text-indigo-500 disabled:hover:text-slate-400 p-2">跳過 ▶</button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-green-50 rounded-2xl border-4 border-green-200 p-4 min-h-0">
              <div className="text-[80px] shrink-0">🌟</div>
              <h2 className="text-4xl font-black text-green-700 mb-2 shrink-0">太棒了！</h2>
              <button 
                 onClick={() => setActiveTask(null)}
                 className="bg-green-500 hover:bg-green-600 text-white text-2xl font-black py-4 px-8 rounded-xl active:scale-95 transition-all shadow border-b-4 border-green-700 active:border-b-0 active:translate-y-1 shrink-0"
               >
                 回列表
               </button>
            </div>
          )}

        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer title="工作步驟" icon="📝" color="border-indigo-500">
      <div className="flex flex-col h-full gap-3 overflow-y-auto w-full relative">
        <div className="bg-indigo-50 p-2 sm:p-3 rounded-2xl border-2 border-indigo-200 flex items-center justify-between shrink-0 mb-1 mx-2">
           <h3 className="text-base sm:text-lg font-black text-indigo-800 ml-2">選擇工作</h3>
           <button 
             onClick={() => setIsEditingMode(!isEditingMode)}
             className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base font-bold shadow-sm transition-all border-b-2 active:border-b-0 active:translate-y-0.5 ${isEditingMode ? 'bg-slate-700 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
           >
             {isEditingMode ? '完成設定' : '⚙️ 設定工作'}
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 pb-4">
          {tasks.map(task => (
             isEditingMode ? (
               <div 
                 key={task.id}
                 className="bg-white border-2 border-indigo-100 p-4 rounded-2xl shadow-sm flex flex-col gap-2 text-left"
               >
                 <h3 className="text-2xl font-black text-slate-800">{task.title}</h3>
                 <p className="text-base font-bold text-slate-500">共 {task.steps.length} 步</p>
                 <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setEditingTask(task)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>✏️</span> 編輯
                    </button>
                    <button 
                      onClick={() => task.id && setDeleteConfirmId(task.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-red-700 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>🗑️</span> 刪除
                    </button>
                 </div>
               </div>
             ) : (
               <button 
                 key={task.id}
                 onClick={() => startTask(task)}
                 className="bg-white border-2 border-indigo-100 p-4 rounded-2xl shadow-sm hover:bg-indigo-50 transition-all flex flex-col gap-2 text-left group active:scale-[0.98]"
               >
                 <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-700">{task.title}</h3>
                 <p className="text-base font-bold text-slate-500">共 {task.steps.length} 步</p>
                 <div className="text-indigo-500 text-sm font-bold mt-1">開始 ➔</div>
               </button>
             )
          ))}
          {isEditingMode && (
            <button 
              onClick={() => setEditingTask({ title: '', steps: [{ id: Date.now().toString(), text: '', completed: false }], createdAt: Date.now() })}
              className="bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-2xl flex items-center justify-center text-lg font-bold text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-[0.98] min-h-[120px]"
            >
               ＋ 新增工作事項
            </button>
          )}
        </div>
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-[100dvh]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="py-4 px-6 bg-slate-100 border-b-2 border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-slate-800">
                {editingTask.id ? '編輯工作事項' : '新增工作事項'}
              </h3>
              <button 
                onClick={() => setEditingTask(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full font-bold active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1 shrink-0">
                <label className="font-bold text-slate-700">工作名稱</label>
                <input 
                  type="text" 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="例如：洗手步驟"
                  required
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-lg focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="font-bold text-slate-700 flex justify-between items-center">
                  <span>設定步驟</span>
                  <span className="text-[10px] sm:text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">語音會自動朗讀步驟文字</span>
                </label>
                
                <div className="flex flex-col gap-3">
                  {editingTask.steps.map((step, index) => (
                    <div key={step.id} className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      <input 
                        type="text" 
                        value={step.text}
                        onChange={(e) => {
                          const newSteps = [...editingTask.steps];
                          newSteps[index].text = e.target.value;
                          setEditingTask({ ...editingTask, steps: newSteps });
                        }}
                        placeholder={`第 ${index + 1} 步的內容...`}
                        required
                        className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold focus:border-indigo-400 focus:outline-none transition-colors max-w-full"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (editingTask.steps.length > 1) {
                            const newSteps = editingTask.steps.filter((_, i) => i !== index);
                            setEditingTask({ ...editingTask, steps: newSteps });
                          } else {
                            const newSteps = [...editingTask.steps];
                            newSteps[0].text = '';
                            setEditingTask({ ...editingTask, steps: newSteps });
                          }
                        }}
                        className="text-red-400 hover:text-red-600 p-2 text-xl active:scale-90"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingTask({
                        ...editingTask,
                        steps: [...editingTask.steps, { id: Date.now().toString(), text: '', completed: false }]
                      });
                    }}
                    className="mt-2 text-indigo-600 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl py-3 font-bold hover:bg-indigo-100 active:scale-[0.98] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>➕</span> 添加新步驟
                  </button>
                </div>
              </div>
              
              <div className="mt-4 shrink-0 pb-2">
                <button 
                  type="submit" 
                  disabled={editingTask.steps.every(s => s.text.trim() === '')}
                  className="w-full bg-slate-800 text-white rounded-xl py-4 font-black tracking-wide text-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0"
                >
                  儲存設定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageContainer>
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-xl font-black text-slate-800 text-center">確定要刪除這項工作事項嗎？</h3>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-black active:scale-95 border-b-2 border-slate-300 active:border-b-0 active:translate-y-0.5"
              >
                取消
              </button>
              <button 
                onClick={() => handleDeleteTask(deleteConfirmId)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black active:scale-95 border-b-2 border-red-700 active:border-b-0 active:translate-y-0.5"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
