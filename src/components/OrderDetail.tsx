import { useState } from 'react';
import {
  X,
  Clock,
  Users,
  MapPin,
  Wallet,
  AlertTriangle,
  Phone,
  Map,
  Car,
  Calendar,
  MessageSquare,
  CheckCircle,
  Star,
  Navigation,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Order, VehicleType, ServiceRemark } from '../types';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onQuote: (orderId: string, data: {
    vehicleType: VehicleType;
    capacity: number;
    price: number;
    arrivalTime: string;
  }) => void;
  onComplete: (orderId: string, data: {
    actualStartTime: string;
    actualEndTime: string;
    remarks: ServiceRemark[];
    note: string;
  }) => void;
}

const vehicleOptions: { type: VehicleType; capacity: number }[] = [
  { type: '经济型轿车', capacity: 4 },
  { type: '舒适型轿车', capacity: 4 },
  { type: 'SUV', capacity: 5 },
  { type: '商务车', capacity: 6 },
  { type: '7座MPV', capacity: 7 },
  { type: '9座商务', capacity: 9 },
  { type: '14座中巴', capacity: 14 },
  { type: '17座中巴', capacity: 17 },
];

const remarkOptions: ServiceRemark[] = [
  '玩家准时',
  '等候较久',
  '临时改期',
  '超员问题',
  '小费好评',
  '路线复杂',
];

export default function OrderDetail({ order, onClose, onQuote, onComplete }: OrderDetailProps) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>('7座MPV');
  const [capacity, setCapacity] = useState(7);
  const [price, setPrice] = useState(order.budget);
  const [arrivalTime, setArrivalTime] = useState(
    dayjs(order.expectedEndTime).subtract(15, 'minute').format('HH:mm')
  );
  const [actualStartTime, setActualStartTime] = useState(
    order.actualStartTime ? dayjs(order.actualStartTime).format('HH:mm') : dayjs().format('HH:mm')
  );
  const [actualEndTime, setActualEndTime] = useState(
    order.actualEndTime ? dayjs(order.actualEndTime).format('HH:mm') : dayjs().add(1, 'hour').format('HH:mm')
  );
  const [selectedRemarks, setSelectedRemarks] = useState<ServiceRemark[]>(order.serviceRemarks || []);
  const [serviceNote, setServiceNote] = useState(order.serviceNote || '');

  const handleVehicleChange = (type: VehicleType) => {
    setVehicleType(type);
    const vehicle = vehicleOptions.find(v => v.type === type);
    if (vehicle) {
      setCapacity(vehicle.capacity);
    }
  };

  const handleQuote = () => {
    const arrivalDateTime = dayjs(order.expectedEndTime)
      .hour(parseInt(arrivalTime.split(':')[0]))
      .minute(parseInt(arrivalTime.split(':')[1]))
      .format('YYYY-MM-DD HH:mm');
    
    onQuote(order.id, {
      vehicleType,
      capacity,
      price,
      arrivalTime: arrivalDateTime,
    });
    setShowQuoteForm(false);
  };

  const handleComplete = () => {
    const date = dayjs(order.expectedEndTime).format('YYYY-MM-DD');
    const startDateTime = `${date} ${actualStartTime}`;
    const endDateTime = `${date} ${actualEndTime}`;
    
    onComplete(order.id, {
      actualStartTime: startDateTime,
      actualEndTime: endDateTime,
      remarks: selectedRemarks,
      note: serviceNote,
    });
    setShowCompleteForm(false);
  };

  const toggleRemark = (remark: ServiceRemark) => {
    setSelectedRemarks(prev =>
      prev.includes(remark)
        ? prev.filter(r => r !== remark)
        : [...prev, remark]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{order.store.name}</h2>
            <p className="text-sm text-gray-500">{order.scriptName} · {order.scriptGenre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">门店预算</span>
                <span className="text-2xl font-bold text-amber-600">¥{order.budget}</span>
              </div>
              {order.mayDelay && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertTriangle size={16} />
                  可能延迟 - {order.delayReason || '原因待确认'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock size={14} />
                  预计散场
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {dayjs(order.expectedEndTime).format('HH:mm')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users size={14} />
                  玩家人数
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {order.playerCount} 人
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <Navigation size={16} />
                路线信息
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-xs text-gray-500">上车点</p>
                    <p className="text-sm text-gray-900">{order.route.from}</p>
                  </div>
                </div>
                <div className="ml-1 w-px h-4 bg-gray-300" />
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  <div>
                    <p className="text-xs text-gray-500">目的地</p>
                    <p className="text-sm text-gray-900">{order.route.to}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Map size={14} />
                  {order.route.distance}km
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock size={14} />
                  约{order.route.duration}分钟
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
                <Phone size={16} />
                门店联系人
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">联系人</span>
                  <span className="text-sm font-medium text-gray-900">{order.store.contactName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">联系电话</span>
                  <span className="text-sm font-medium text-blue-600">{order.store.contactPhone}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <Car size={16} />
                停车位置说明
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.store.parkingInfo}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <Users size={16} />
                玩家集合备注
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.store.gatheringNote}
              </p>
            </div>

            {order.myQuote && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
                  <CheckCircle size={16} />
                  我的报价
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">车型</p>
                    <p className="text-sm font-medium text-gray-900">{order.myQuote.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">可乘</p>
                    <p className="text-sm font-medium text-gray-900">{order.myQuote.capacity}人</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">报价</p>
                    <p className="text-sm font-medium text-green-600">¥{order.myQuote.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">到达时间</p>
                    <p className="text-sm font-medium text-gray-900">
                      {dayjs(order.myQuote.arrivalTime).format('HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === 'completed' && order.serviceRemarks && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                  <Star size={16} />
                  服务备注
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.serviceRemarks.map(remark => (
                    <span
                      key={remark}
                      className="px-2 py-1 bg-white text-gray-700 text-xs rounded-lg border border-gray-200"
                    >
                      {remark}
                    </span>
                  ))}
                </div>
                {order.serviceNote && (
                  <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                    {order.serviceNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {order.status === 'pending' && !showQuoteForm && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => setShowQuoteForm(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200"
            >
              立即报价
            </button>
          </div>
        )}

        {order.status === 'pending' && showQuoteForm && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              填写报价信息
            </h3>
            
            <div>
              <label className="text-sm text-gray-600 block mb-1.5">车型</label>
              <select
                value={vehicleType}
                onChange={(e) => handleVehicleChange(e.target.value as VehicleType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {vehicleOptions.map(v => (
                  <option key={v.type} value={v.type}>{v.type} ({v.capacity}座)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1.5">可乘人数</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1.5">报价 (元)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1.5">预计到达时间</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowQuoteForm(false)}
                className="flex-1 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleQuote}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交报价
              </button>
            </div>
          </div>
        )}

        {(order.status === 'in_progress') && !showCompleteForm && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => setShowCompleteForm(true)}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-200"
            >
              确认完成服务
            </button>
          </div>
        )}

        {order.status === 'in_progress' && showCompleteForm && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-green-600" />
              服务完成确认
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">实际出发</label>
                <input
                  type="time"
                  value={actualStartTime}
                  onChange={(e) => setActualStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">实际结束</label>
                <input
                  type="time"
                  value={actualEndTime}
                  onChange={(e) => setActualEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-2">服务标签</label>
              <div className="flex flex-wrap gap-2">
                {remarkOptions.map(remark => (
                  <button
                    key={remark}
                    onClick={() => toggleRemark(remark)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      selectedRemarks.includes(remark)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {remark}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1.5">备注说明</label>
              <textarea
                value={serviceNote}
                onChange={(e) => setServiceNote(e.target.value)}
                placeholder="记录这次服务的情况..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCompleteForm(false)}
                className="flex-1 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                确认完成
              </button>
            </div>
          </div>
        )}

        {order.status === 'quoted' && (
          <div className="p-4 border-t border-gray-200 bg-amber-50">
            <p className="text-center text-sm text-amber-700">
              已提交报价，等待门店确认...
            </p>
          </div>
        )}

        {order.status === 'accepted' && (
          <div className="p-4 border-t border-gray-200 bg-green-50">
            <p className="text-center text-sm text-green-700 font-medium">
              ✓ 门店已确认接单，请按时到达
            </p>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-center text-sm text-gray-600">
              服务已完成
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
