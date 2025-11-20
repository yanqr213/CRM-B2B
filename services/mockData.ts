
import { Company, Notification, Product, Ticket, TicketStatus, User, UserRole, RegistrationRequest } from '../types';

// --- Mock Users ---
export const USERS: User[] = [
  {
    id: 'u0',
    name: 'Super Admin',
    email: 'root@sunenergyxt.com',
    password: '123',
    role: UserRole.SUPER_ADMIN,
    companyId: 'c0', 
  },
  {
    id: 'u1',
    name: 'Alice (销售 A)',
    email: 'alice@sunenergyxt.com',
    password: '123',
    role: UserRole.INTERNAL_SALES,
    companyId: 'c0', 
  },
  {
    id: 'u5',
    name: 'Bob (销售 B)',
    email: 'bob@sunenergyxt.com',
    password: '123',
    role: UserRole.INTERNAL_SALES,
    companyId: 'c0',
  },
  {
    id: 'u3',
    name: 'Ian (合作伙伴老板)',
    email: 'ian@partner.com',
    password: '123',
    role: UserRole.PARTNER_ADMIN,
    companyId: 'c2',
  },
  {
    id: 'u4',
    name: 'Sam (合作伙伴安装工)',
    email: 'sam@partner.com',
    password: '123',
    role: UserRole.PARTNER_STAFF,
    companyId: 'c2',
  },
  {
    id: 'u7',
    name: 'Make (总部安装工)',
    email: 'make@sunenergyxt.com',
    password: '123',
    role: UserRole.PARTNER_STAFF,
    companyId: 'c0',
  },
];

// --- Mock Companies ---
export const COMPANIES: Company[] = [
  {
    id: 'c0',
    name: 'SunEnergyXT 总部',
    address: '总部大楼',
    phone: '400-123-4567',
    serviceArea: '全球',
  },
  {
    id: 'c2',
    name: '快修新能源服务商',
    address: '上海市浦东新区科技园5号',
    phone: '+86 21 98765432',
    serviceArea: '上海及周边50公里',
  },
];

// --- Mock Products ---
export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'SunEnergyXT Pro 逆变器 5k',
    model: 'XT-INV-5000',
    category: '逆变器',
    imageUrl: 'https://picsum.photos/seed/inverter/300/200',
    specs: [
      { label: '最大输出', value: '5000W' },
      { label: '转换效率', value: '98.2%' },
      { label: '重量', value: '12kg' },
    ],
    descriptionHtml: `
      <p>SunEnergyXT Pro 5k 是一款高效、智能的单相混合逆变器，专为家庭储能系统设计。</p>
      <br/>
      <h4 class="font-bold">核心优势：</h4>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li><strong>超高效率：</strong> 采用最新的 MPPT 算法，最大转换效率达到 98.2%。</li>
        <li><strong>静音设计：</strong> 无风扇被动散热设计，噪音低于 25dB，适合室内安装。</li>
        <li><strong>智能监控：</strong> 内置 Wi-Fi 模块，支持 App 远程监控和固件升级。</li>
      </ul>
      <br/>
      <p>该产品通过了 IEC/EN 62109-1/-2 安全认证，提供 10 年标准质保。</p>
    `,
    documents: [
      { title: '用户手册', url: '#' },
      { title: '安装指南', url: '#' },
      { title: 'CE 认证', url: '#' },
    ],
    faqs: [
      { question: '错误代码 E01 是什么意思?', answer: '电网电压过高。请检查电网连接。' },
      { question: '如何重置 WiFi?', answer: '按住按钮 5 秒钟，直到 LED 闪烁蓝色。' },
    ],
  },
  {
    id: 'p2',
    name: 'SunEnergyXT 家庭储能电池 10',
    model: 'XT-BAT-10K',
    category: '储能电池',
    imageUrl: 'https://picsum.photos/seed/battery/300/200',
    specs: [
      { label: '容量', value: '10kWh' },
      { label: '技术路线', value: '磷酸铁锂 (LiFePO4)' },
      { label: '质保', value: '10 年' },
    ],
    descriptionHtml: `
      <p>XT-BAT-10K 采用顶级磷酸铁锂电芯，循环寿命超过 6000 次，为您的家庭提供持续稳定的绿色能源。</p>
      <br/>
      <h4 class="font-bold">产品特点：</h4>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li>模块化堆叠设计，安装简便，支持后续扩容。</li>
        <li>IP65 防护等级，支持户外安装。</li>
        <li>BMS 智能电池管理系统，全方位保护电池安全。</li>
      </ul>
    `,
    documents: [
      { title: '数据表', url: '#' },
      { title: '安全说明书', url: '#' },
    ],
    faqs: [
      { question: '可以安装在室外吗?', answer: '可以，防护等级为 IP65。' },
    ],
  },
];

// --- Mock Tickets ---

export const INITIAL_TICKETS: Ticket[] = [
  // --- TICKET 1: Alice's Ticket (Assigned to Partner/Sam) ---
  {
    id: 't1',
    sln: 'XT-SH-001',
    title: '上海浦东-逆变器安装 (Alice负责)',
    customerName: '张三',
    status: TicketStatus.IN_PROGRESS,
    priority: '高',
    productId: 'p1',
    createdBy: 'u1', // Alice
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u1', // Alice owns it
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: 'c2', // Partner
    assignedToUserId: 'u4',    // Sam
    
    description: '客户反馈设备红灯，无法并网，请快修团队处理。',
    createdAt: new Date('2023-10-25T10:00:00'),
    updatedAt: new Date('2023-10-25T14:30:00'),
    serviceTypes: ['新设备安装'],
    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        senderName: 'Alice',
        text: '已指派给快修处理，请尽快上门。',
        timestamp: new Date('2023-10-25T10:00:00'),
      },
    ],
    logs: [],
  },

  // --- TICKET 2: Bob's Ticket (Draft/Pending) ---
  {
    id: 't2',
    sln: 'XT-BJ-002',
    title: '北京朝阳-新装咨询 (Bob负责)',
    customerName: '李四',
    status: TicketStatus.PENDING_ASSIGN,
    priority: '中',
    productId: 'p2',
    createdBy: 'u5', // Bob
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u5', // Bob owns it
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: undefined, 
    assignedToUserId: undefined, 
    
    description: '客户需要购买并安装 10kWh 电池，等待分配安装商。',
    createdAt: new Date('2023-10-26T09:00:00'),
    updatedAt: new Date('2023-10-26T09:05:00'),
    serviceTypes: ['新设备安装', '旧设备拆除'],
    messages: [],
    logs: [],
  },

  // --- TICKET 3: Super Admin Created -> Assigned to Alice ---
  {
    id: 't3',
    sln: 'XT-SYS-003',
    title: '总部指派-VIP客户改造 (指派给Alice)',
    customerName: '王五 (VIP)',
    status: TicketStatus.PENDING_ASSIGN,
    priority: '高',
    productId: 'p1',
    createdBy: 'u0', // Super Admin
    createdRole: UserRole.SUPER_ADMIN,
    companyId: 'c0',
    salesOwnerId: 'u1', // Explicitly assigned to Alice by Super Admin
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: undefined,
    assignedToUserId: undefined,
    
    description: 'VIP客户需要拆除旧设备并安装新设备，请Alice优先跟进处理。',
    createdAt: new Date('2023-10-27T08:00:00'),
    updatedAt: new Date('2023-10-27T08:00:00'),
    serviceTypes: ['旧设备拆除', '新设备安装'],
    messages: [
        {
            id: 'm3a',
            senderId: 'u0',
            senderName: 'Super Admin',
            text: 'Alice, 这个客户很重要，请你亲自负责。',
            timestamp: new Date('2023-10-27T08:01:00'),
        }
    ],
    logs: [],
  },

  // --- TICKET 4: Partner Self-Service ---
  {
    id: 't4',
    sln: 'XT-QA-004',
    title: '库存设备安装申请',
    customerName: '快修库存',
    status: TicketStatus.PENDING_INTERNAL_AUDIT,
    priority: '中',
    productId: 'p1',
    createdBy: 'u3', // Ian
    createdRole: UserRole.PARTNER_ADMIN,
    companyId: 'c2',
    
    salesOwnerId: 'u5', // Assigned to Bob to manage
    upstreamCompanyId: 'c0', 
    assignedToCompanyId: 'c2', 
    assignedToUserId: 'u4', // Sam handled the check
    
    description: '为本地客户安装库存设备。',
    createdAt: new Date('2023-10-24T10:00:00'),
    updatedAt: new Date('2023-10-27T16:00:00'),
    serviceTypes: ['新设备安装'],
    messages: [
        {
            id: 'm4a',
            senderId: 'u4',
            senderName: 'Sam',
            text: '安装完成，运行正常。',
            timestamp: new Date('2023-10-27T15:00:00'),
        },
    ],
    logs: [],
  },

  // --- TICKET 5: HQ Installation (Make) ---
  {
    id: 't5',
    sln: 'XT-HQ-005',
    title: '总部样板间安装 (HQ团队)',
    customerName: 'SunEnergyXT 展厅',
    status: TicketStatus.PENDING_PROCESS,
    priority: '低',
    productId: 'p2',
    createdBy: 'u1', // Alice
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u1', // Alice
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: 'c0', // Assigned to HQ Self
    assignedToUserId: 'u7',    // Assigned to Make
    
    description: '需要在总部一楼展厅安装新的展示电池。',
    createdAt: new Date('2023-10-28T11:00:00'),
    updatedAt: new Date('2023-10-28T11:30:00'),
    serviceTypes: ['新设备安装'],
    messages: [],
    logs: [],
  },
  
  // --- TICKET 6: Completed Ticket (Bob) ---
  {
    id: 't6',
    sln: 'XT-OLD-006',
    title: '上月已完成的拆除任务',
    customerName: '赵六',
    status: TicketStatus.CLOSED,
    priority: '低',
    productId: 'p1',
    createdBy: 'u5', // Bob
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u5',
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: 'c2',
    assignedToUserId: 'u4',
    
    description: '客户搬迁，拆除旧设备。',
    createdAt: new Date('2023-09-01T10:00:00'),
    updatedAt: new Date('2023-09-05T16:00:00'),
    serviceTypes: ['旧设备拆除'],
    messages: [],
    logs: [],
  }
];

// --- Notifications ---
export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: '新产品 SunEnergyXT Pro X 系列发布', date: '2023-10-20', type: 'news', link: '#' },
  { id: 'n2', title: '系统维护通知：11月1日凌晨', date: '2023-10-28', type: 'alert' },
  { id: 'n3', title: '固件更新 v2.1.0 可下载', date: '2023-10-25', type: 'update', link: '#' },
];

export const REGISTRATION_REQUESTS: RegistrationRequest[] = [
  { 
    id: 'r1', 
    companyName: '绿色能源科技', 
    contactPerson: '王经理', 
    email: 'wang@green-energy.com', 
    phone: '13800001234', 
    status: 'PENDING', 
    requestDate: '2023-10-28',
    type: 'Installer'
  }
];
