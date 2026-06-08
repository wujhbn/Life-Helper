import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { initDB } from '../../lib/db';
import { EmergencyContact } from '../../types';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

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
        { name: '110 警局', relation: '緊急', phone: '110', photo: '👮' },
        { name: '119 救護車', relation: '緊急', phone: '119', photo: '🚑' }
      ];
      for (const p of presets) { await db.add('contacts', p); }
      setContacts(await db.getAll('contacts'));
    } else {
      setContacts(all);
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

  return (
    <PageContainer title="緊急聯絡" icon="☎️" color="border-red-600">
      <div className="flex flex-col h-full gap-3 overflow-y-auto w-full">
        <div className="bg-red-50 p-3 rounded-2xl border-2 border-red-200 text-center shrink-0">
          <h3 className="text-xl font-black text-red-800">需要幫忙嗎？可以打給他們：</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 pb-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-3 rounded-2xl shadow-sm border-2 border-slate-100 flex items-center gap-3 active:scale-[0.98] transition-transform">
              
              <div className="w-16 h-16 bg-slate-100 rounded-full border-2 border-white shadow flex items-center justify-center text-3xl overflow-hidden shrink-0">
                {contact.photo?.startsWith('data:') ? (
                  <img src={contact.photo} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{contact.photo || '👤'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xl font-black text-slate-800 truncate mb-1">{contact.name}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCall(contact)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-green-700 active:border-b-0 active:translate-y-0.5"
                  >
                    <span>📞</span> 打電話
                  </button>
                  <button 
                    onClick={() => handleSms(contact)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm font-black shadow flex items-center justify-center gap-1 active:scale-95 border-b-2 border-blue-700 active:border-b-0 active:translate-y-0.5"
                  >
                    <span>✉️</span> 簡訊
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
