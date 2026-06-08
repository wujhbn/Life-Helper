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
      // Load presets
      for (const pt of PRESET_TASKS) {
        await db.add('taskCards', {
          title: pt.title,
          steps: pt.steps.map((text, i) => ({ id: `step-${i}`, text, completed: false })),
          createdAt: Date.now()
        });
      }
      const loaded = await db.getAll('taskCards');
      setTasks(loaded);
    } else {
      setTasks(all);
    }
  };

  const startTask = (task: TaskCard) => {
    // Reset ALL steps to incomplete
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
        speak(`${activeTask.title}，全部完成！你很棒！`);
      }, 500);
    }
  };

  const nextStep = () => {
    if (activeTask && currentStepIdx < activeTask.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const prevStep = () => {
    if (activeTask && currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  if (activeTask) {
    const allCompleted = activeTask.steps.every(s => s.completed);
    
    return (
      <PageContainer title={activeTask.title} icon="📝" color="border-indigo-500">
        <div className="flex flex-col h-full gap-8">
          
          <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-3xl border-4 border-indigo-200">
             <button onClick={() => setActiveTask(null)} className="text-2xl font-bold text-indigo-700 bg-white px-6 py-3 rounded-xl shadow-sm hover:bg-indigo-100 active:scale-95">放棄退出</button>
             <div className="text-2xl font-bold text-indigo-800">
                進度：{activeTask.steps.filter(s => s.completed).length} / {activeTask.steps.length}
             </div>
          </div>

          {!allCompleted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
               <div className="text-center transition-all duration-300">
                 <div className="text-3xl text-slate-400 mb-4 font-bold">第 {currentStepIdx + 1} 步</div>
                 <div className="text-6xl sm:text-8xl font-black text-indigo-700 leading-tight">
                   {activeTask.steps[currentStepIdx].text}
                 </div>
               </div>

               <button 
                 onClick={completeStep}
                 disabled={activeTask.steps[currentStepIdx].completed}
                 className="bg-indigo-500 hover:bg-indigo-600 text-white text-5xl font-black py-10 px-24 rounded-[3rem] active:scale-95 transition-all shadow-xl border-b-[12px] border-indigo-700 active:border-b-0 active:translate-y-3 flex items-center gap-6 mt-8"
               >
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-500 text-4xl">✓</div>
                 我做好了！
               </button>

               <div className="flex gap-8 mt-12 w-full max-w-xl justify-between px-8">
                 <button onClick={prevStep} disabled={currentStepIdx === 0} className="text-3xl font-bold text-slate-400 disabled:opacity-30 hover:text-indigo-500 disabled:hover:text-slate-400 p-4">◀ 上一步</button>
                 <button onClick={nextStep} disabled={currentStepIdx === activeTask.steps.length - 1} className="text-3xl font-bold text-slate-400 disabled:opacity-30 hover:text-indigo-500 disabled:hover:text-slate-400 p-4">跳過 ▶</button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-green-50 rounded-[3rem] border-4 border-green-200 p-8">
              <div className="text-[120px] mb-4">🌟</div>
              <h2 className="text-6xl font-black text-green-700 mb-8">太棒了！全部完成！</h2>
              <button 
                 onClick={() => setActiveTask(null)}
                 className="bg-green-500 hover:bg-green-600 text-white text-4xl font-black py-8 px-16 rounded-[2rem] active:scale-95 transition-all shadow-lg border-b-8 border-green-700 active:border-b-0 active:translate-y-2 flex items-center gap-4"
               >
                 回任務列表
               </button>
            </div>
          )}

        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="工作步驟" icon="📝" color="border-indigo-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {tasks.map(task => (
           <button 
             key={task.id}
             onClick={() => startTask(task)}
             className="bg-white border-4 border-indigo-100 p-8 rounded-[3rem] shadow-md hover:bg-indigo-50 hover:border-indigo-300 transition-all flex flex-col gap-4 text-left group active:scale-[0.98]"
           >
             <h3 className="text-4xl font-black text-slate-800 group-hover:text-indigo-700">{task.title}</h3>
             <p className="text-2xl font-bold text-slate-500">共 {task.steps.length} 個步驟</p>
             <div className="flex items-center gap-2 mt-4 text-indigo-500 text-2xl font-bold">
               開始執行 ➔
             </div>
           </button>
        ))}
        {/* Placeholder for Add new task */}
        <button className="bg-slate-50 border-4 border-dashed border-slate-300 p-8 rounded-[3rem] flex items-center justify-center text-3xl font-bold text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-[0.98]">
           ＋ 新增自己的步驟
        </button>
      </div>
    </PageContainer>
  );
}
