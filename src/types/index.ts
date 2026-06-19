export type OrderStatus = 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed';

export type ScriptGenre = 
  | '推理本' 
  | '情感本' 
  | '欢乐本' 
  | '恐怖本' 
  | '机制本' 
  | '阵营本' 
  | '硬核本' 
  | '沉浸本';

export type VehicleType = 
  | '经济型轿车' 
  | '舒适型轿车' 
  | 'SUV' 
  | '商务车' 
  | '7座MPV' 
  | '9座商务' 
  | '14座中巴' 
  | '17座中巴';

export type ServiceRemark = 
  | '玩家准时' 
  | '等候较久' 
  | '临时改期' 
  | '超员问题' 
  | '小费好评' 
  | '路线复杂';

export interface Store {
  id: string;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  parkingInfo: string;
  gatheringNote: string;
  distance?: number;
}

export interface OrderRoute {
  from: string;
  to: string;
  distance: number;
  duration: number;
}

export interface Quote {
  driverId: string;
  driverName: string;
  vehicleType: VehicleType;
  capacity: number;
  price: number;
  arrivalTime: string;
  quotedAt: string;
}

export interface Order {
  id: string;
  storeId: string;
  store: Store;
  scriptName: string;
  scriptGenre: ScriptGenre;
  playerCount: number;
  expectedEndTime: string;
  route: OrderRoute;
  budget: number;
  mayDelay: boolean;
  delayReason?: string;
  status: OrderStatus;
  myQuote?: Quote;
  actualStartTime?: string;
  actualEndTime?: string;
  serviceRemarks?: ServiceRemark[];
  serviceNote?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  capacity: number;
  plateNumber: string;
}

export type FilterType = 'all' | 'nearby' | 'night' | 'large';
export type DayTab = 'today' | 'tomorrow';
