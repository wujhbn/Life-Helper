import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { EmergencyContact } from '../../types';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const db = await initDB();
    const all = await db.getAll('contacts');
    
    if (all.length === 0) {
      const presets: EmergencyContact[] = [
        { name: '爸爸', relation: '家人', phone: '0912345678', photo: '👨' },
        { name: '媽媽', relation: '家人', phone: '0987654321', photo: '👩' },
        { name: '老師', relation: '學校', phone: '0288889999', photo: '🧑‍🏫' },
        { name: '警察局', relation: '緊急', phone: '110', photo: '👮' },
        { name: '消防隊', relation: '緊急', phone: '119', photo: '🚑' }
      ];
      for (const p of presets) { await db.add('contacts', p); }
      setContacts(await db.getAll('contacts'));
    } else {
      let migrated = false;
      for (const p of all) {
        if (p.name === '110 警局') {
          p.name = '警察局';
          await db.put('contacts', p);
          migrated = true;
        }
        if (p.name === '119 救護車') {
          p.name = '消防隊';
          await db.put('contacts', p);
          migrated = true;
        }
      }
      if (migrated) {
        setContacts(await db.getAll('contacts'));
      } else {
        setContacts(all);
      }
    }
  };

  const handleCall = (contact: EmergencyContact) => {
    speak(`打電話給${contact.name}`);
    window.location.href = `tel:${contact.phone}`;
  };

  const handleSms = (contact: EmergencyContact) => {
    speak(`傳簡訊給${contact.name}`);
    window.location.href = `sms:${contact.phone}`;
  };

  const handleSaveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContact) return;
    const db = await initDB();
    if (editingContact.id) {
      await db.put('contacts', editingContact);
    } else {
      await db.add('contacts', editingContact);
    }
    setEditingContact(null);
    loadContacts();
  };

  const handleDeleteContact = async (id: number) => {
    const db = await initDB();
    await db.delete('contacts', id);
    setDeleteConfirmId(null);
    loadContacts();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingContact) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditingContact({ ...editingContact, photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <PageContainer title="緊急聯絡" icon="☎️" color="border-red-600">
      <div className="flex flex-col h-full gap-3 overflow-y-auto w-full relative">
        <div className="bg-red-50 p-2 sm:p-3 rounded-2xl border-2 border-red-200 flex items-center justify-between shrink-0">
          <h3 className="text-base sm:text-lg font-black text-red-800 ml-2">需要幫忙嗎？可以打給他們：</h3>
          <button 
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base font-bold shadow-sm transition-all border-b-2 active:border-b-0 active:translate-y-0.5 ${isEditingMode ? 'bg-slate-700 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
          >
            {isEditingMode ? '完成設定' : '⚙️ 設定聯絡人'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 pb-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-3 rounded-2xl shadow-sm border-2 border-slate-200 flex items-center gap-3 relative overflow-hidden group">
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full border-2 border-white shadow flex items-center justify-center text-3xl overflow-hidden shrink-0 relative">
                {contact.photo?.startsWith('data:') ? (
                  <img src={contact.photo} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{contact.photo || '👤'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-black text-slate-800 truncate mb-1">{contact.name}</div>
                {isEditingMode ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingContact(contact)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>✏️</span> 編輯
                    </button>
                    <button 
                      onClick={() => contact.id && setDeleteConfirmId(contact.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-red-700 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>🗑️</span> 刪除
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCall(contact)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-green-700 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>📞</span> 打電話
                    </button>
                    <button 
                      onClick={() => handleSms(contact)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-blue-700 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>✉️</span> 簡訊
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}

          {isEditingMode && (
            <button
              onClick={() => setEditingContact({ name: '', phone: '', relation: '自訂', photo: '👤' })}
              className="bg-white p-3 rounded-2xl shadow-sm border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors active:scale-[0.98] min-h-[100px]"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl text-slate-500">➕</div>
              <span className="font-bold text-slate-600">新增聯絡人</span>
            </button>
          )}

        </div>
      </div>

      {editingContact && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 h-[100dvh]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="py-4 px-6 bg-slate-100 border-b-2 border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-slate-800">
                {editingContact.id ? '編輯聯絡人' : '新增聯絡人'}
              </h3>
              <button 
                onClick={() => setEditingContact(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full font-bold active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveContact} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2 relative">
                <label className="font-bold text-slate-700">照片或頭像 (Emoji)</label>
                <div className="flex gap-3 items-center">
                   <div className="w-16 h-16 bg-slate-100 rounded-full border-2 border-slate-200 shadow-sm flex items-center justify-center text-3xl overflow-hidden shrink-0 relative">
                    {editingContact.photo?.startsWith('data:') ? (
                      <img src={editingContact.photo} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{editingContact.photo}</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input 
                      type="text" 
                      value={editingContact.photo?.startsWith('data:') ? '' : editingContact.photo}
                      onChange={(e) => setEditingContact({ ...editingContact, photo: e.target.value })}
                      placeholder="輸入 Emoji (例如: 👨)"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold focus:border-red-400 focus:outline-none transition-colors"
                      maxLength={2}
                    />
                    <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3 rounded-xl text-sm font-bold text-center cursor-pointer active:scale-95 transition-transform truncate">
                      上傳照片
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">姓名</label>
                <input 
                  type="text" 
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  placeholder="例如：警察局、或家人姓名"
                  required
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-lg focus:border-red-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">電話號碼</label>
                <input 
                  type="tel" 
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  placeholder="例如：110, 0912345678"
                  required
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-lg font-mono focus:border-red-400 focus:outline-none transition-colors"
                />
              </div>
              
              <div className="mt-4 shrink-0 pb-2">
                <button 
                  type="submit" 
                  className="w-full bg-slate-800 text-white rounded-xl py-4 font-black tracking-wide text-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all"
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
            <h3 className="text-xl font-black text-slate-800 text-center">確定要刪除這位聯絡人嗎？</h3>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-black active:scale-95 border-b-2 border-slate-300 active:border-b-0 active:translate-y-0.5"
              >
                取消
              </button>
              <button 
                onClick={() => handleDeleteContact(deleteConfirmId)}
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
