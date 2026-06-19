import { Filter, MapPin, Moon, Users } from 'lucide-react';
import type { FilterType, DayTab } from '../types';

interface FilterBarProps {
  activeDay: DayTab;
  onDayChange: (day: DayTab) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  todayCount: number;
  tomorrowCount: number;
}

export default function FilterBar({
  activeDay,
  onDayChange,
  activeFilter,
  onFilterChange,
  todayCount,
  tomorrowCount,
}: FilterBarProps) {
  const filters: { type: FilterType; label: string; icon: typeof Filter }[] = [
    { type: 'all', label: '全部', icon: Filter },
    { type: 'nearby', label: '离我近', icon: MapPin },
    { type: 'night', label: '夜间单', icon: Moon },
    { type: 'large', label: '大车优先', icon: Users },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">剧</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">剧本杀接单台</h1>
              <p className="text-xs text-gray-500">包场车源 · 司机端</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">张师傅</p>
              <p className="text-xs text-gray-500">7座MPV · 沪A·88888</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">张</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onDayChange('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDay === 'today'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            今日
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeDay === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {todayCount}
            </span>
          </button>
          <button
            onClick={() => onDayChange('tomorrow')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDay === 'tomorrow'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            明日
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeDay === 'tomorrow' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {tomorrowCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.type}
                onClick={() => onFilterChange(filter.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all whitespace-nowrap ${
                  activeFilter === filter.type
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
