import { Clock, Users, MapPin, Wallet, AlertTriangle, CheckCircle, Car, Map } from 'lucide-react';
import dayjs from 'dayjs';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const statusConfig = {
  pending: { label: '待报价', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  quoted: { label: '已报价', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: '已接单', color: 'bg-green-100 text-green-700 border-green-200' },
  in_progress: { label: '服务中', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const genreColors: Record<string, string> = {
  '推理本': 'bg-indigo-100 text-indigo-700',
  '情感本': 'bg-pink-100 text-pink-700',
  '欢乐本': 'bg-yellow-100 text-yellow-700',
  '恐怖本': 'bg-gray-800 text-white',
  '机制本': 'bg-orange-100 text-orange-700',
  '阵营本': 'bg-red-100 text-red-700',
  '硬核本': 'bg-purple-100 text-purple-700',
  '沉浸本': 'bg-teal-100 text-teal-700',
};

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const status = statusConfig[order.status];
  const time = dayjs(order.expectedEndTime);
  const isNight = time.hour() >= 21 || time.hour() < 6;
  const isLarge = order.playerCount >= 8;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {order.store.name}
            </h3>
            {order.store.distance && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={12} />
                {order.store.distance}km
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${genreColors[order.scriptGenre] || 'bg-gray-100 text-gray-700'}`}>
              {order.scriptGenre}
            </span>
            <span className="text-sm text-gray-600">{order.scriptName}</span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={14} className="text-gray-400" />
          <span>{time.format('HH:mm')} 散场</span>
          {isNight && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              夜间
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={14} className="text-gray-400" />
          <span>{order.playerCount} 人</span>
          {isLarge && (
            <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
              大车
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-600 col-span-2">
          <Map size={14} className="text-gray-400" />
          <span className="truncate">
            {order.route.from.split('区')[0]}区 → {order.route.to}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Wallet size={14} className="text-amber-500" />
          <span className="text-lg font-bold text-amber-600">
            ¥{order.budget}
          </span>
          <span className="text-xs text-gray-400">预算</span>
        </div>
        {order.mayDelay && (
          <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
            <AlertTriangle size={12} />
            可能延迟
          </div>
        )}
        {order.myQuote && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle size={12} />
            已报价 ¥{order.myQuote.price}
          </div>
        )}
      </div>

      {order.delayReason && order.mayDelay && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          延迟原因：{order.delayReason}
        </div>
      )}
    </div>
  );
}
