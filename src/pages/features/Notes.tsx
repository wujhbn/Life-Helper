import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { getItem, setItem } from '../../lib/storage';

export default function NotesPage() {
  const [notes, setNotes] = useState<{id: number, text: string, date: number}[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const saved = getItem<{id: number, text: string, date: number}[]>('life-helper-notes', []);
    setNotes(saved);
  }, []);

  const saveNotes = (n: any[]) => {
    setNotes(n);
    setItem('life-helper-notes', n);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const added = [{ id: Date.now(), text: newNote, date: Date.now() }, ...notes];
    saveNotes(added);
    speak('已新增備忘錄');
    setNewNote('');
  };

  const deleteNote = (id: number) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  return (
    <PageContainer title="備忘錄" icon="🗒️" color="border-yellow-500">
      <div className="flex flex-col h-full gap-4 w-full">
        <div className="flex gap-2 shrink-0 px-2 pt-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 border-2 border-yellow-200 rounded-xl px-4 py-3 text-lg font-bold bg-yellow-50 focus:border-yellow-400 focus:outline-none"
            placeholder="輸入要記下的事情..."
          />
          <button onClick={addNote} className="bg-yellow-500 text-white px-6 font-black rounded-xl text-xl active:scale-95 transition-transform shadow-sm">
            新增
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-6 flex flex-col gap-3">
          {notes.map(note => (
            <div key={note.id} className="bg-white p-4 border-2 border-slate-200 shadow-sm rounded-2xl flex justify-between items-center gap-2 group active:scale-[0.98] transition-all">
              <span className="text-xl font-bold text-slate-800 break-words flex-1 cursor-pointer" onClick={() => speak(note.text)}>{note.text}</span>
              <button onClick={() => deleteNote(note.id)} className="text-2xl text-slate-300 hover:text-red-500 w-12 h-12 flex items-center justify-center rounded-lg active:bg-slate-100 shrink-0">
                🗑️
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="m-auto text-slate-400 font-bold text-xl text-center py-10 mt-20">目前沒有備忘錄</div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
