import { Cloud, Droplets, Wind } from 'lucide-react';

export function WeatherWidget() {
  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-xl -m-4">
      <div className="text-center mb-4">
        <div className="text-6xl mb-2">☀️</div>
        <div className="text-4xl font-bold">23°C</div>
        <div className="text-sm opacity-90 mt-1">맑음</div>
      </div>
      <div className="flex justify-around text-sm">
        <div className="flex items-center gap-1">
          <Droplets className="w-4 h-4" />
          <span>65%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-4 h-4" />
          <span>12km/h</span>
        </div>
      </div>
      <div className="text-xs text-center mt-3 opacity-75">서울특별시</div>
    </div>
  );
}
























