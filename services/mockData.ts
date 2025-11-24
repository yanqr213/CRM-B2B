
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
    name: 'SunEnergyXT HQ',
    address: '总部大楼',
    phone: '400-123-4567',
    serviceArea: 'Global',
  },
  {
    id: 'c2',
    name: 'FastFix Energy Services',
    address: '上海市浦东新区科技园5号',
    phone: '+86 21 98765432',
    serviceArea: 'Shanghai Area',
  },
];

// --- Mock Products ---
export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'SunEnergyXT Pro Inverter 5k',
    model: 'XT-INV-5000',
    category: 'Inverter',
    imageUrl: 'https://picsum.photos/seed/inverter/300/200',
    specs: [
      { label: 'Max Output', value: '5000W' },
      { label: 'Efficiency', value: '98.2%' },
      { label: 'Weight', value: '12kg' },
    ],
    descriptionHtml: `
      <p>SunEnergyXT Pro 5k is a high-efficiency single-phase hybrid inverter.</p>
      <br/>
      <h4 class="font-bold">Key Features:</h4>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li><strong>High Efficiency:</strong> 98.2% max efficiency.</li>
        <li><strong>Silent:</strong> Fanless design, <25dB.</li>
        <li><strong>Smart:</strong> Built-in Wi-Fi.</li>
      </ul>
    `,
    documents: [
      { title: 'User Manual', url: '#' },
      { title: 'Installation Guide', url: '#' },
    ],
    faqs: [
      { question: 'What does error E01 mean?', answer: 'Grid voltage too high.' },
      { question: 'How to reset WiFi?', answer: 'Hold button for 5s.' },
    ],
  },
  {
    id: 'p2',
    name: 'SunEnergyXT Home Battery 10',
    model: 'XT-BAT-10K',
    category: 'Battery',
    imageUrl: 'https://picsum.photos/seed/battery/300/200',
    specs: [
      { label: 'Capacity', value: '10kWh' },
      { label: 'Technology', value: 'LiFePO4' },
      { label: 'Warranty', value: '10 Years' },
    ],
    descriptionHtml: `
      <p>XT-BAT-10K uses top-tier LiFePO4 cells.</p>
      <br/>
      <h4 class="font-bold">Features:</h4>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li>Modular design.</li>
        <li>IP65 rated.</li>
        <li>Smart BMS.</li>
      </ul>
    `,
    documents: [
      { title: 'Datasheet', url: '#' },
    ],
    faqs: [
      { question: 'Outdoor installation?', answer: 'Yes, IP65 rated.' },
    ],
  },
];

// --- Mock Tickets ---

export const INITIAL_TICKETS: Ticket[] = [
  // --- TICKET 1: Alice's Ticket (Assigned to Partner/Sam) ---
  {
    id: 't1',
    sln: 'XT-SH-001',
    title: 'Shanghai Pudong - Inverter Install (Alice)',
    customerName: 'Zhang San',
    status: TicketStatus.IN_PROGRESS,
    priority: 'HIGH',
    productId: 'p1',
    createdBy: 'u1', // Alice
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u1', // Alice owns it
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: 'c2', // Partner
    assignedToUserId: 'u4',    // Sam
    
    description: 'Customer reports red light error.',
    createdAt: new Date('2023-10-25T10:00:00'),
    updatedAt: new Date('2023-10-25T14:30:00'),
    serviceTypes: ['New Installation'],
    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        senderName: 'Alice',
        text: 'Assigned to FastFix.',
        timestamp: new Date('2023-10-25T10:00:00'),
      },
    ],
    logs: [],
  },

  // --- TICKET 2: Bob's Ticket (Draft/Pending) ---
  {
    id: 't2',
    sln: 'XT-BJ-002',
    title: 'Beijing - New Inquiry (Bob)',
    customerName: 'Li Si',
    status: TicketStatus.PENDING_ASSIGN,
    priority: 'MEDIUM',
    productId: 'p2',
    createdBy: 'u5', // Bob
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u5', // Bob owns it
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: undefined, 
    assignedToUserId: undefined, 
    
    description: 'Customer wants 10kWh battery.',
    createdAt: new Date('2023-10-26T09:00:00'),
    updatedAt: new Date('2023-10-26T09:05:00'),
    serviceTypes: ['New Installation', 'Removal'],
    messages: [],
    logs: [],
  },

  // --- TICKET 3: Super Admin Created -> Assigned to Alice ---
  {
    id: 't3',
    sln: 'XT-SYS-003',
    title: 'HQ Assign - VIP Retrofit (Alice)',
    customerName: 'Wang Wu (VIP)',
    status: TicketStatus.PENDING_ASSIGN,
    priority: 'HIGH',
    productId: 'p1',
    createdBy: 'u0', // Super Admin
    createdRole: UserRole.SUPER_ADMIN,
    companyId: 'c0',
    salesOwnerId: 'u1', // Explicitly assigned to Alice by Super Admin
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: undefined,
    assignedToUserId: undefined,
    
    description: 'VIP needs retrofit. Alice please handle.',
    createdAt: new Date('2023-10-27T08:00:00'),
    updatedAt: new Date('2023-10-27T08:00:00'),
    serviceTypes: ['Removal', 'New Installation'],
    messages: [
        {
            id: 'm3a',
            senderId: 'u0',
            senderName: 'Super Admin',
            text: 'Alice, high priority.',
            timestamp: new Date('2023-10-27T08:01:00'),
        }
    ],
    logs: [],
  },

  // --- TICKET 4: Partner Self-Service ---
  {
    id: 't4',
    sln: 'XT-QA-004',
    title: 'Stock Install Application',
    customerName: 'FastFix Stock',
    status: TicketStatus.PENDING_INTERNAL_AUDIT,
    priority: 'MEDIUM',
    productId: 'p1',
    createdBy: 'u3', // Ian
    createdRole: UserRole.PARTNER_ADMIN,
    companyId: 'c2',
    
    salesOwnerId: 'u5', // Assigned to Bob to manage
    upstreamCompanyId: 'c0', 
    assignedToCompanyId: 'c2', 
    assignedToUserId: 'u4', // Sam handled the check
    
    description: 'Installing stock unit for local client.',
    createdAt: new Date('2023-10-24T10:00:00'),
    updatedAt: new Date('2023-10-27T16:00:00'),
    serviceTypes: ['New Installation'],
    messages: [
        {
            id: 'm4a',
            senderId: 'u4',
            senderName: 'Sam',
            text: 'Installation complete.',
            timestamp: new Date('2023-10-27T15:00:00'),
        },
    ],
    logs: [],
  },

  // --- TICKET 5: HQ Installation (Make) ---
  {
    id: 't5',
    sln: 'XT-HQ-005',
    title: 'HQ Showroom Install',
    customerName: 'SunEnergyXT Showroom',
    status: TicketStatus.PENDING_PROCESS,
    priority: 'LOW',
    productId: 'p2',
    createdBy: 'u1', // Alice
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u1', // Alice
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: 'c0', // Assigned to HQ Self
    assignedToUserId: 'u7',    // Assigned to Make
    
    description: 'Install new battery in lobby.',
    createdAt: new Date('2023-10-28T11:00:00'),
    updatedAt: new Date('2023-10-28T11:30:00'),
    serviceTypes: ['New Installation'],
    messages: [],
    logs: [],
  },
  
  // --- TICKET 6: Completed Ticket (Bob) ---
  {
    id: 't6',
    sln: 'XT-OLD-006',
    title: 'Last Month Removal',
    customerName: 'Zhao Liu',
    status: TicketStatus.CLOSED,
    priority: 'LOW',
    productId: 'p1',
    createdBy: 'u5', // Bob
    createdRole: UserRole.INTERNAL_SALES,
    companyId: 'c0',
    salesOwnerId: 'u5',
    
    upstreamCompanyId: 'c0',
    assignedToCompanyId: 'c2',
    assignedToUserId: 'u4',
    
    description: 'Client moving out.',
    createdAt: new Date('2023-09-01T10:00:00'),
    updatedAt: new Date('2023-09-05T16:00:00'),
    serviceTypes: ['Removal'],
    messages: [],
    logs: [],
  }
];

// --- Notifications ---
export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Product: SunEnergyXT Pro X Released', date: '2023-10-20', type: 'news', link: '#' },
  { id: 'n2', title: 'System Maintenance: Nov 1st', date: '2023-10-28', type: 'alert' },
  { id: 'n3', title: 'Firmware v2.1.0 Available', date: '2023-10-25', type: 'update', link: '#' },
];

export const REGISTRATION_REQUESTS: RegistrationRequest[] = [
  { 
    id: 'r1', 
    companyName: 'Green Energy Tech', 
    contactPerson: 'Manager Wang', 
    email: 'wang@green-energy.com', 
    phone: '13800001234', 
    status: 'PENDING', 
    requestDate: '2023-10-28',
    type: 'Installer'
  }
];
