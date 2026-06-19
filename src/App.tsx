import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { Package, Clock, CheckCircle, DollarSign } from 'lucide-react';
import FilterBar from './components/FilterBar';
import OrderCard from './components/OrderCard';
import OrderDetail from './components/OrderDetail';
import { mockOrders, mockDriver } from './data/mockData';
import {
  loadOrders,
  saveOrders,
} from './utils/storage';
import type { Order, FilterType, DayTab, VehicleType, ServiceRemark } from './types';
import './App.css';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeDay, setActiveDay] = useState<DayTab>('today');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadOrders();
    if (saved && saved.length > 0) {
      setOrders(saved);
    } else {
      setOrders(mockOrders);
      saveOrders(mockOrders);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && orders.length > 0) {
      saveOrders(orders);
    }
  }, [orders, isLoaded]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(order => {
      const orderDate = dayjs(order.expectedEndTime);
      const today = dayjs();
      
      if (activeDay === 'today') {
        if (!orderDate.isSame(today, 'day')) return false;
      } else {
        if (!orderDate.isSame(today.add(1, 'day'), 'day')) return false;
      }
      
      return true;
    });

    switch (activeFilter) {
      case 'nearby':
        result = result.filter(o => o.store.distance && o.store.distance <= 5);
        result.sort((a, b) => (a.store.distance || 999) - (b.store.distance || 999));
        break;
      case 'night':
        result = result.filter(o => {
          const hour = dayjs(o.expectedEndTime).hour();
          return hour >= 21 || hour < 6;
        });
        break;
      case 'large':
        result = result.filter(o => o.playerCount >= 8);
        break;
    }

    return result;
  }, [orders, activeDay, activeFilter]);

  const todayCount = orders.filter(o => 
    dayjs(o.expectedEndTime).isSame(dayjs(), 'day')
  ).length;

  const tomorrowCount = orders.filter(o => 
    dayjs(o.expectedEndTime).isSame(dayjs().add(1, 'day'), 'day')
  ).length;

  const handleQuote = (
    orderId: string,
    data: {
      vehicleType: VehicleType;
      capacity: number;
      price: number;
      arrivalTime: string;
    }
  ) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: 'quoted' as const,
            myQuote: {
              driverId: mockDriver.id,
              driverName: mockDriver.name,
              vehicleType: data.vehicleType,
              capacity: data.capacity,
              price: data.price,
              arrivalTime: data.arrivalTime,
              quotedAt: dayjs().format('YYYY-MM-DD HH:mm'),
            },
          }
        : order
    );
    
    setOrders(updatedOrders);
    
    setSelectedOrder(prev =>
      prev && prev.id === orderId
        ? {
            ...prev,
            status: 'quoted' as const,
            myQuote: {
              driverId: mockDriver.id,
              driverName: mockDriver.name,
              vehicleType: data.vehicleType,
              capacity: data.capacity,
              price: data.price,
              arrivalTime: data.arrivalTime,
              quotedAt: dayjs().format('YYYY-MM-DD HH:mm'),
            },
          }
        : prev
    );
  };

  const handleComplete = (
    orderId: string,
    data: {
      actualStartTime: string;
      actualEndTime: string;
      remarks: ServiceRemark[];
      note: string;
    }
  ) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: 'completed' as const,
            actualStartTime: data.actualStartTime,
            actualEndTime: data.actualEndTime,
            serviceRemarks: data.remarks,
            serviceNote: data.note,
          }
        : order
    );
    
    setOrders(updatedOrders);
    
    setSelectedOrder(prev =>
      prev && prev.id === orderId
        ? {
            ...prev,
            status: 'completed' as const,
            actualStartTime: data.actualStartTime,
            actualEndTime: data.actualEndTime,
            serviceRemarks: data.remarks,
            serviceNote: data.note,
          }
        : prev
    );
  };

  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => 
      dayjs(o.expectedEndTime).isSame(dayjs(), 'day')
    );
    const pending = todayOrders.filter(o => o.status === 'pending').length;
    const completed = todayOrders.filter(o => o.status === 'completed').length;
    const totalBudget = todayOrders.reduce((sum, o) => sum + o.budget, 0);
    
    return { pending, completed, totalBudget, total: todayOrders.length };
  }, [orders]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar
        activeDay={activeDay}
        onDayChange={setActiveDay}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        todayCount={todayCount}
        tomorrowCount={tomorrowCount}
      />

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">今日总单量</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">待报价</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">¥{stats.totalBudget}</p>
                <p className="text-xs text-gray-500">今日预算总额</p>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">暂无符合条件的订单</p>
            <p className="text-sm text-gray-400">试试切换筛选条件看看</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onQuote={handleQuote}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

export default App;
