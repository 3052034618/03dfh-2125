import dayjs from 'dayjs';
import type { Order, Store, Driver, ScriptGenre, VehicleType } from '../types';

const stores: Store[] = [
  {
    id: 's1',
    name: '迷雾剧社·总店',
    address: '徐汇区漕溪北路398号2楼',
    contactName: '王店长',
    contactPhone: '138****1234',
    parkingInfo: '门店楼下有付费停车场，10元/小时，凭消费小票可减免2小时',
    gatheringNote: '玩家在一楼大厅集合，提前10分钟到场点名',
    distance: 2.3,
  },
  {
    id: 's2',
    name: '剧本杀研究所',
    address: '静安区南京西路1788号B1层',
    contactName: '李前台',
    contactPhone: '139****5678',
    parkingInfo: '商场地下车库，B3层E区，电梯直达门店',
    gatheringNote: '请在商场正门口接人，玩家会提前5分钟出来',
    distance: 4.5,
  },
  {
    id: 's3',
    name: '三更剧本体验馆',
    address: '黄浦区人民广场福州路666号5楼',
    contactName: '张老板',
    contactPhone: '137****9012',
    parkingInfo: '周边小区可停，15元畅停到深夜，需要的话帮您联系',
    gatheringNote: '散场后在楼下便利店门口集合',
    distance: 6.8,
  },
  {
    id: 's4',
    name: '推理俱乐部',
    address: '浦东新区陆家嘴环路1000号3楼',
    contactName: '陈主管',
    contactPhone: '136****3456',
    parkingInfo: '写字楼地下车库，15元/小时，夜间8点后半价',
    gatheringNote: '大堂集合，需登记身份证进入',
    distance: 8.2,
  },
  {
    id: 's5',
    name: '戏精学院',
    address: '长宁区定西路1232号4楼',
    contactName: '刘DM',
    contactPhone: '135****7890',
    parkingInfo: '门前路边有停车位，晚8点后免费',
    gatheringNote: '门口集合，注意不要按门铃',
    distance: 3.1,
  },
  {
    id: 's6',
    name: '探案馆·旗舰店',
    address: '杨浦区大学路235号2楼',
    contactName: '赵店长',
    contactPhone: '134****2345',
    parkingInfo: '大学路路边车位紧张，建议停旁边创智天地停车场',
    gatheringNote: '楼下星巴克门口等',
    distance: 9.5,
  },
];

const driver: Driver = {
  id: 'd1',
  name: '张师傅',
  phone: '138****8888',
  vehicleType: '7座MPV',
  capacity: 7,
  plateNumber: '沪A·88888',
};

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

const scriptNames: Record<ScriptGenre, string[]> = {
  '推理本': ['迷雾山庄', '死亡循环', '无名之町'],
  '情感本': ['年轮', '声声慢', '就像水消失在水中'],
  '欢乐本': ['搞钱', '市井狂人', '拆迁'],
  '恐怖本': ['第二十二条校规', '纸妻', '校规2'],
  '机制本': ['权倾天下', '水镜八奇', '三国系列'],
  '阵营本': ['孤城', '刀鞘', '将至'],
  '硬核本': ['死者在幻夜中醒来', '漓川怪谈簿', '七月十三日'],
  '沉浸本': ['破晓', '挟剑惊风', '致新世界'],
};

const destinations = [
  '虹桥火车站',
  '浦东国际机场',
  '虹桥机场T2',
  '上海火车站',
  '松江大学城',
  '嘉定新城',
  '宝山万达',
  '莘庄地铁站',
];

const genres: ScriptGenre[] = ['推理本', '情感本', '欢乐本', '恐怖本', '机制本', '硬核本', '沉浸本'];

function generateOrder(id: string, dayOffset: number, hour: number, minute: number, storeIndex: number): Order {
  const store = stores[storeIndex];
  const genre = genres[Math.floor(Math.random() * genres.length)];
  const scriptName = scriptNames[genre][Math.floor(Math.random() * scriptNames[genre].length)];
  const playerCount = 5 + Math.floor(Math.random() * 6);
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  const distance = 15 + Math.floor(Math.random() * 40);
  const duration = 30 + Math.floor(Math.random() * 60);
  const mayDelay = Math.random() > 0.6;
  
  const expectedEnd = dayjs()
    .add(dayOffset, 'day')
    .hour(hour)
    .minute(minute)
    .second(0);
  
  const budget = Math.floor((distance * 3 + 50 + playerCount * 5) / 10) * 10;
  
  return {
    id,
    storeId: store.id,
    store,
    scriptName,
    scriptGenre: genre,
    playerCount,
    expectedEndTime: expectedEnd.format('YYYY-MM-DD HH:mm'),
    route: {
      from: store.address,
      to: destination,
      distance,
      duration,
    },
    budget,
    mayDelay,
    delayReason: mayDelay ? (['DM拖堂', '玩家迟到', '剧本超时', '复盘较长'][Math.floor(Math.random() * 4)]) : undefined,
    status: Math.random() > 0.5 ? 'pending' : 'quoted',
    createdAt: dayjs().subtract(Math.floor(Math.random() * 24), 'hour').format('YYYY-MM-DD HH:mm'),
  };
}

function generateOrders(): Order[] {
  const orders: Order[] = [];
  
  const todayTimes = [
    [18, 30], [19, 0], [19, 30], [20, 0], [20, 30], [21, 0], [21, 30], [22, 0], [22, 30], [23, 0]
  ];
  
  const tomorrowTimes = [
    [18, 0], [18, 30], [19, 0], [19, 30], [20, 0], [20, 30], [21, 0], [21, 30], [22, 0]
  ];
  
  todayTimes.forEach((time, index) => {
    const order = generateOrder(`order-today-${index}`, 0, time[0], time[1], index % stores.length);
    if (order.status === 'quoted') {
      const price = Math.floor(order.budget * (0.9 + Math.random() * 0.2));
      const vehicleIdx = Math.floor(Math.random() * vehiclePool.length);
      const vehicle = vehiclePool[vehicleIdx];
      const arrivalOffset = Math.floor(Math.random() * 30);
      order.myQuote = {
        driverId: driver.id,
        driverName: driver.name,
        vehicleType: vehicle.type,
        capacity: vehicle.capacity,
        price: price,
        arrivalTime: dayjs(order.expectedEndTime).subtract(10 + arrivalOffset, 'minute').format('YYYY-MM-DD HH:mm'),
        quotedAt: dayjs().subtract(1 + Math.floor(Math.random() * 12), 'hour').format('YYYY-MM-DD HH:mm'),
      };
    }
    orders.push(order);
  });
  
  tomorrowTimes.forEach((time, index) => {
    const order = generateOrder(`order-tomorrow-${index}`, 1, time[0], time[1], index % stores.length);
    if (order.status === 'quoted') {
      const price = Math.floor(order.budget * (0.9 + Math.random() * 0.2));
      const vehicleIdx = Math.floor(Math.random() * vehiclePool.length);
      const vehicle = vehiclePool[vehicleIdx];
      const arrivalOffset = Math.floor(Math.random() * 30);
      order.myQuote = {
        driverId: driver.id,
        driverName: driver.name,
        vehicleType: vehicle.type,
        capacity: vehicle.capacity,
        price: price,
        arrivalTime: dayjs(order.expectedEndTime).subtract(10 + arrivalOffset, 'minute').format('YYYY-MM-DD HH:mm'),
        quotedAt: dayjs().subtract(1 + Math.floor(Math.random() * 12), 'hour').format('YYYY-MM-DD HH:mm'),
      };
    }
    orders.push(order);
  });
  
  orders[1].status = 'accepted';
  orders[1].myQuote = {
    driverId: driver.id,
    driverName: driver.name,
    vehicleType: '7座MPV',
    capacity: 7,
    price: 180,
    arrivalTime: dayjs().add(0, 'day').hour(18).minute(45).format('YYYY-MM-DD HH:mm'),
    quotedAt: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm'),
  };
  
  orders[3].status = 'in_progress';
  orders[3].myQuote = {
    driverId: driver.id,
    driverName: driver.name,
    vehicleType: '7座MPV',
    capacity: 7,
    price: 220,
    arrivalTime: dayjs().add(0, 'day').hour(20).minute(15).format('YYYY-MM-DD HH:mm'),
    quotedAt: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm'),
  };
  orders[3].actualStartTime = dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm');
  
  orders[5].status = 'completed';
  orders[5].myQuote = {
    driverId: driver.id,
    driverName: driver.name,
    vehicleType: '9座商务',
    capacity: 9,
    price: 260,
    arrivalTime: dayjs().add(0, 'day').hour(20).minute(45).format('YYYY-MM-DD HH:mm'),
    quotedAt: dayjs().subtract(10, 'hour').format('YYYY-MM-DD HH:mm'),
  };
  orders[5].actualStartTime = dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm');
  orders[5].actualEndTime = dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm');
  orders[5].serviceRemarks = ['玩家准时', '小费好评'];
  orders[5].serviceNote = '玩家很准时，路线熟悉，下次有机会继续合作';
  
  return orders.sort((a, b) => 
    dayjs(a.expectedEndTime).valueOf() - dayjs(b.expectedEndTime).valueOf()
  );
}

export const mockOrders = generateOrders();
export const mockDriver = driver;
export const mockStores = stores;
