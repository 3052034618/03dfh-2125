import type { Order, Quote, ServiceRemark } from '../types';

const STORAGE_KEY = 'juben_sha_driver_orders';
const DRIVER_KEY = 'juben_sha_driver_info';

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('保存订单数据失败:', e);
  }
}

export function loadOrders(): Order[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Order[];
    }
  } catch (e) {
    console.error('读取订单数据失败:', e);
  }
  return null;
}

export function clearOrders(): void {
  localStorage.removeItem(STORAGE_KEY);
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
