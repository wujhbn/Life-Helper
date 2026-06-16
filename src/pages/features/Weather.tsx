import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';
import { getItem, setItem } from '../../lib/storage';

export default function WeatherPage() {
  const [weather, setWeather] = useState<{temp: number, code: number, time: string, locationName: string, lastUpdated?: string} | null>(null);
  const [loading, setLoading] = useState(true);

  // Weather codes mapping based on WMO standards
  const weatherIcons: Record<number, string> = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌧️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
  };
  
  const weatherDesc: Record<number, string> = {
    0: '晴天', 1: '多雲', 2: '多雲', 3: '陰天',
    45: '起霧', 48: '起霧',
    51: '毛毛雨', 53: '小雨', 55: '大雨',
    61: '小雨', 63: '中雨', 65: '大雨',
    71: '小雪', 73: '中雪', 75: '大雪',
    95: '雷陣雨', 96: '雷陣雨', 99: '雷陣雨',
  };

  const fetchWeatherWithLocation = () => {
    setLoading(true);
    const fetchWeather = async (lat: number, lon: number, defaultLocationName?: string) => {
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        let locName = defaultLocationName || '未知位置';
        if (!defaultLocationName) {
             try {
             const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);
             const geoData = await geoRes.json();
             
             let parts = [];
             if (geoData.principalSubdivision) parts.push(geoData.principalSubdivision);
             if (geoData.locality && geoData.locality !== geoData.principalSubdivision) parts.push(geoData.locality);
             else if (geoData.city && geoData.city !== geoData.principalSubdivision) parts.push(geoData.city);
             
             locName = parts.length > 0 ? parts.join('') : '您的位置';
           } catch {
             locName = '您的位置';
           }
        }

        const newWeather = {
          temp: weatherData.current_weather.temperature,
          code: weatherData.current_weather.weathercode,
          time: weatherData.current_weather.time,
          locationName: locName,
          lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
        };
        
        setWeather(newWeather);
        setItem('lifehelper-weather-cache', newWeather);
        setLoading(false);
      } catch (err) {
        console.error(err);
        const cached = getItem<any>('lifehelper-weather-cache', null);
        if (cached) {
          setWeather(cached);
        }
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation failed or denied, using default:', err);
          // fallback to Taipei if rejected or timeout
          fetchWeather(25.04, 121.53, '台北市');
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      fetchWeather(25.04, 121.53, '台北市');
    }
  };

  useEffect(() => {
    fetchWeatherWithLocation();
  }, []);

  const handleReadAll = () => {
    if (weather) {
      const desc = weatherDesc[weather.code] || '未知';
      speak(`現在${weather.locationName}的天氣 ${desc}，溫度大約 ${Math.round(weather.temp)} 度`);
    } else {
      speak('無法取得今天的天氣資訊');
    }
  };

  const handleReadLocation = () => {
    if (weather) {
      speak(`目前位置在 ${weather.locationName}`);
    }
  };

  const handleReadWeather = () => {
    if (weather) {
      const desc = weatherDesc[weather.code] || '未知';
      speak(`天氣 ${desc}，溫度大約 ${Math.round(weather.temp)} 度`);
    }
  };

  return (
    <PageContainer title="現在天氣" icon="⛅" color="border-cyan-400">
      <div className="flex flex-col h-full items-center px-4 w-full justify-center">
        {loading ? (
          <div className="text-2xl font-bold text-slate-500 animate-pulse">正在查看天氣...</div>
        ) : weather ? (
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] border-4 border-cyan-100 p-8 shadow-sm flex flex-col items-center gap-6 cursor-pointer active:scale-[0.98] transition-transform" onClick={handleReadAll}>
             <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-[-10px]">
               <span className="text-xl">📍</span>
               <span className="text-lg font-bold text-slate-600">{weather.locationName}</span>
             </div>
             <div className="text-8xl drop-shadow-md pb-2">
               {weatherIcons[weather.code] || '❓'}
             </div>
             <div className="text-6xl font-black text-slate-800 tracking-tighter">
               {Math.round(weather.temp)}<span className="text-4xl text-slate-500 ml-1">°C</span>
             </div>
             <div className="text-2xl font-black text-cyan-800 bg-cyan-50 px-8 py-3 rounded-full border border-cyan-200">
               {weatherDesc[weather.code] || '未知'}
             </div>
             <div className="flex gap-3 w-full mt-4">
               <button onClick={(e) => { e.stopPropagation(); handleReadLocation(); }} className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-3 rounded-2xl font-black text-lg shadow-md active:translate-y-1 active:shadow-sm transition-all border-b-4 border-amber-600 active:border-b-0 flex flex-col items-center justify-center gap-1">
                 <span className="text-2xl">🗺️</span> 現在位置
               </button>
               <button onClick={(e) => { e.stopPropagation(); handleReadWeather(); }} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-2xl font-black text-lg shadow-md active:translate-y-1 active:shadow-sm transition-all border-b-4 border-cyan-700 active:border-b-0 flex flex-col items-center justify-center gap-1">
                 <span className="text-2xl">⛅</span> 天氣
               </button>
             </div>
             <div className="text-sm font-bold text-slate-400 mt-2 text-center leading-relaxed">
               {!navigator.onLine && weather.lastUpdated && (
                 <span className="text-amber-500 block mb-1">⚠️ 離線模式 (最後更新: {weather.lastUpdated})</span>
               )}
               點擊畫面任意處朗讀資訊
             </div>
          </div>
        ) : (
          <div className="text-xl font-bold text-slate-500 text-center bg-slate-100 p-6 rounded-3xl">
            無法取得天氣<br/>
            {!navigator.onLine ? '目前處於離線狀態，且無最近的快取天氣資訊。' : '請檢查網路連線或定位權限。'}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
