export interface AppEvent {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'school' | 'hospital' | 'birthday' | 'party' | 'home'; // 🏫 🏥 🎂 🎉 🏠
}

export interface TaskStep {
  id: string;
  text: string;
  completed: boolean;
  image?: string; // base64 or blob URL
}

export interface TaskCard {
  id?: number;
  title: string;
  steps: TaskStep[];
  createdAt: number;
}

export interface ScheduleItem {
  id?: number;
  time: string; // HH:mm
  title: string;
  icon: string; // emoji
  completed: boolean;
  order: number;
  date: string; // YYYY-MM-DD
}

export interface EmergencyContact {
  id?: number;
  name: string;
  phone: string;
  photo?: string; // base64
  relation: string;
}
