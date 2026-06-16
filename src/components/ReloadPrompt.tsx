// @ts-expect-error PWA virtual module
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white border-4 border-orange-200 rounded-3xl p-4 shadow-xl flex flex-col gap-3 max-w-sm">
        <div className="text-slate-800 font-bold text-lg flex items-center gap-2">
          {needRefresh ? (
            <>
              <span className="text-2xl">✨</span> 發現新版本！
            </>
          ) : (
            <>
              <span className="text-2xl">✅</span> App已就緒，可離線使用
            </>
          )}
        </div>
        <div className="flex gap-2">
          {needRefresh && (
            <button
              className="flex-1 bg-orange-500 text-white font-black py-2 px-4 rounded-xl active:scale-95 transition-transform shadow-sm border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
              onClick={() => updateServiceWorker(true)}
            >
              更新
            </button>
          )}
          <button
            className="flex-1 bg-slate-100 text-slate-700 font-black py-2 px-4 rounded-xl active:scale-95 transition-transform shadow-sm border-b-4 border-slate-300 active:border-b-0 active:translate-y-1"
            onClick={close}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
