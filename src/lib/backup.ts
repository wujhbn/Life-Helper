import { getItem, setItem } from './storage';

export function exportBackup() {
  const data = {
    settings: getItem('lifehelper-settings', {}),
    notes: getItem('life-helper-notes', []),
    alarms: getItem('life-helper-alarms', []),
    version: 1,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-helper-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (data.settings) setItem('lifehelper-settings', data.settings);
        if (data.notes) setItem('life-helper-notes', data.notes);
        if (data.alarms) setItem('life-helper-alarms', data.alarms);
        // Note: this only restores localStorage data.
        // We'd also potentially restore IndexedDB data if needed, but it's more complex.
        resolve(true);
      } catch (err) {
        console.error('Import error', err);
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}
