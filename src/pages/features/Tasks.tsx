import { useState, useEffect } from 'react';
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
          steps: pt.steps.map((text, i) => ({ id: `step-${i}`, text, completed: false })),
          createdAt: Date.now()
        });
      }
      setTasks(await db.getAll('taskCards'));
    } else {
      setTasks(all);
    }
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
        <div className="flex flex-col h-full gap-4 overflow-y-auto">
          
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
    <PageContainer title="工作步驟" icon="📝" color="border-indigo-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 overflow-y-auto w-full">
        {tasks.map(task => (
           <button 
             key={task.id}
             onClick={() => startTask(task)}
             className="bg-white border-2 border-indigo-100 p-4 rounded-2xl shadow-sm hover:bg-indigo-50 transition-all flex flex-col gap-2 text-left group active:scale-[0.98]"
           >
             <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-700">{task.title}</h3>
             <p className="text-base font-bold text-slate-500">共 {task.steps.length} 步</p>
             <div className="text-indigo-500 text-sm font-bold mt-1">開始 ➔</div>
           </button>
        ))}
        <button className="bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-2xl flex items-center justify-center text-lg font-bold text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-[0.98] min-h-[120px]">
           ＋ 新增步驟
        </button>
      </div>
    </PageContainer>
  );
}
