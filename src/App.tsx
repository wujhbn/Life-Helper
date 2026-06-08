/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TimerPage from './pages/features/Timer';
import CountdownPage from './pages/features/Countdown';
import CalendarPage from './pages/features/Calendar';
import CalculatorPage from './pages/features/Calculator';
import DiscountPage from './pages/features/Discount';
import ChangePage from './pages/features/Change';
import TasksPage from './pages/features/Tasks';
import SchedulePage from './pages/features/Schedule';
import EmergencyPage from './pages/features/Emergency';
import NotesPage from './pages/features/Notes';
import AlarmPage from './pages/features/Alarm';
import WeatherPage from './pages/features/Weather';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="timer" element={<TimerPage />} />
          <Route path="countdown" element={<CountdownPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="discount" element={<DiscountPage />} />
          <Route path="change" element={<ChangePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="alarm" element={<AlarmPage />} />
          <Route path="weather" element={<WeatherPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

