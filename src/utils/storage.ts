import dayjs from 'dayjs';
import type { Order, Quote, ServiceRemark, VehicleType } from '../types';

const STORAGE_KEY = 'juben_sha_driver_orders';
const DRIVER_KEY = 'juben_sha_driver_info';
const STORAGE_VERSION_KEY = 'juben_sha_driver_version';
const CURRENT_VERSION = 2;

const vehiclePool: { type: VehicleType; capacity: number }[] = [
  { type: '经济型轿车', capacity: 4 },
  { type: '舒适型轿车', capacity: 4 },
  { type: 'SUV', capacity: 5 },
  { type: '商务车', capacity: 6 },
  { type: '7座MPV', capacity: 7 },
  { type: '9座商务', capacity: 9 },
  { type: '14座中巴', capacity: 14 },
  { type: '17座中巴', capacity: 17 },
];

function isValidQuote(quote: any): quote is Quote {
  if (!quote) return false;
  if (typeof quote.price !== 'number' || quote.price <= 0 || isNaN(quote.price)) return false;
  if (typeof quote.capacity !== 'number' || quote.capacity <= 0 || isNaN(quote.capacity)) return false;
  if (!quote.vehicleType || typeof quote.vehicleType !== 'string') return false;
  if (!quote.arrivalTime || typeof quote.arrivalTime !== 'string') return false;
  return true;
}

function generateQuoteForOrder(order: Order): Quote {
  const vehicleIdx = Math.floor(Math.random() * vehiclePool.length);
  const vehicle = vehiclePool[vehicleIdx];
  const price = Math.max(order.budget, Math.floor(order.budget * (0.9 + Math.random() * 0.2)));
  const arrivalOffset = Math.floor(Math.random() * 30);
  
  return {
    driverId: 'd1',
    driverName: '张师傅',
    vehicleType: vehicle.type,
    capacity: vehicle.capacity,
    price: price,
    arrivalTime: dayjs(order.expectedEndTime)
      .subtract(10 + arrivalOffset, 'minute')
      .format('YYYY-MM-DD HH:mm'),
    quotedAt: dayjs().subtract(1 + Math.floor(Math.random() * 12), 'hour')
      .format('YYYY-MM-DD HH:mm'),
  };
}

function repairOrder(order: Order): Order {
  const repaired = { ...order };
  
  if ((order.status === 'quoted' || order.status === 'accepted' || 
       order.status === 'in_progress' || order.status === 'completed') && 
      !isValidQuote(order.myQuote)) {
    console.log(`修复订单 ${order.id}：补充缺失的报价信息`);
    repaired.myQuote = generateQuoteForOrder(order);
  }
  
  if (repaired.myQuote && !isValidQuote(repaired.myQuote)) {
    repaired.myQuote = generateQuoteForOrder(order);
  }
  
  if (repaired.myQuote) {
    if (typeof repaired.myQuote.price !== 'number' || isNaN(repaired.myQuote.price)) {
      repaired.myQuote.price = Math.max(order.budget, 100);
    }
    if (typeof repaired.myQuote.capacity !== 'number' || isNaN(repaired.myQuote.capacity)) {
      repaired.myQuote.capacity = 7;
    }
    if (!repaired.myQuote.vehicleType) {
      repaired.myQuote.vehicleType = '7座MPV';
    }
    if (!repaired.myQuote.arrivalTime) {
      repaired.myQuote.arrivalTime = dayjs(order.expectedEndTime)
        .subtract(15, 'minute')
        .format('YYYY-MM-DD HH:mm');
    }
  }
  
  if (order.status === 'completed') {
    if (!order.actualStartTime) {
      repaired.actualStartTime = dayjs(order.expectedEndTime)
        .subtract(30, 'minute')
        .format('YYYY-MM-DD HH:mm');
    }
    if (!order.actualEndTime) {
      repaired.actualEndTime = dayjs(order.expectedEndTime)
        .add(order.route.duration, 'minute')
        .format('YYYY-MM-DD HH:mm');
    }
    if (!order.serviceRemarks || order.serviceRemarks.length === 0) {
      repaired.serviceRemarks = ['玩家准时'];
    }
  }
  
  return repaired;
}

function migrateData(orders: Order[], fromVersion: number, toVersion: number): Order[] {
  console.log(`数据迁移：从版本 ${fromVersion} 迁移到 ${toVersion}`);
  
  if (fromVersion < 2) {
    orders = orders.map(order => repairOrder(order));
  }
  
  return orders;
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
  } catch (e) {
    console.error('保存订单数据失败:', e);
  }
}

export function loadOrders(): Order[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const savedVersion = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0');
    
    if (data) {
      let orders = JSON.parse(data) as Order[];
      
      if (savedVersion < CURRENT_VERSION) {
        orders = migrateData(orders, savedVersion, CURRENT_VERSION);
        saveOrders(orders);
      } else {
        orders = orders.map(order => repairOrder(order));
        saveOrders(orders);
      }
      
      return orders;
    }
  } catch (e) {
    console.error('读取订单数据失败:', e);
  }
  return null;
}

export function clearOrders(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_VERSION_KEY);
}

export function updateOrderWithQuote(
  orders: Order[],
  orderId: string,
  quote: Quote
): Order[] {
  const updated = orders.map(order =>
    order.id === orderId
      ? {
          ...order,
          status: 'quoted' as const,
          myQuote: quote,
        }
      : order
  );
  saveOrders(updated);
  return updated;
}

export function updateOrderAsCompleted(
  orders: Order[],
  orderId: string,
  data: {
    actualStartTime: string;
    actualEndTime: string;
    serviceRemarks: ServiceRemark[];
    serviceNote: string;
  }
): Order[] {
  const updated: Order[] = orders.map(order =>
    order.id === orderId
      ? {
          ...order,
          status: 'completed' as const,
          actualStartTime: data.actualStartTime,
          actualEndTime: data.actualEndTime,
          serviceRemarks: data.serviceRemarks,
          serviceNote: data.serviceNote,
        }
      : order
  );
  saveOrders(updated);
  return updated;
}

export function updateOrderStatus(
  orders: Order[],
  orderId: string,
  status: Order['status']
): Order[] {
  const updated = orders.map(order =>
    order.id === orderId
      ? { ...order, status }
      : order
  );
  saveOrders(updated);
  return updated;
}

export function saveDriverInfo(driver: {
  vehicleType: string;
  capacity: number;
}): void {
  try {
    localStorage.setItem(DRIVER_KEY, JSON.stringify(driver));
  } catch (e) {
    console.error('保存司机信息失败:', e);
  }
}

export function loadDriverInfo(): {
  vehicleType: string;
  capacity: number;
} | null {
  try {
    const data = localStorage.getItem(DRIVER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取司机信息失败:', e);
  }
  return null;
}
