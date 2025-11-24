
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',       // 超级管理员 (管理销售)
  INTERNAL_SALES = 'INTERNAL_SALES', // 销售 (管理业务 + 合作伙伴)
  PARTNER_ADMIN = 'PARTNER_ADMIN',   // 合作伙伴管理员 (原经销商/安装商老板)
  PARTNER_STAFF = 'PARTNER_STAFF',   // 安装工
}

export enum TicketStatus {
  DRAFT = 'DRAFT',
  PENDING_ASSIGN = 'PENDING_ASSIGN', // Created by Sales, waiting to be sent to Partner
  PENDING_DISPATCH = 'PENDING_DISPATCH', // Received by Partner Admin, waiting to assign to Staff
  PENDING_PROCESS = 'PENDING_PROCESS', // Assigned to Staff
  IN_PROGRESS = 'IN_PROGRESS',    // Staff working
  PENDING_INTERNAL_AUDIT = 'PENDING_INTERNAL_AUDIT', // Staff finished, Partner Admin checks
  PENDING_FINAL_REVIEW = 'PENDING_FINAL_REVIEW',     // Partner Admin approved, Sales checks
  CLOSED = 'CLOSED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  role: UserRole;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  serviceArea: string;
}

export interface Product {
  id: string;
  name: string;
  model: string;
  imageUrl: string;
  category: string;
  specs: { label: string; value: string }[];
  descriptionHtml: string; // New field for rich text
  documents: { title: string; url: string }[];
  faqs: { question: string; answer: string }[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export interface TicketLog {
  id: string;
  action: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  timestamp: Date;
}

export interface Ticket {
  id: string;
  sln: string;
  title: string;
  customerName: string; // Added for search
  status: TicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  productId: string;
  
  // Creation Info
  createdBy: string; 
  createdRole: UserRole; 
  companyId: string; 
  
  // Assignment / Lifecycle Tracking
  upstreamCompanyId?: string;   // Usually SunEnergyXT (Sales)
  salesOwnerId?: string;        // If created by Super Admin, this tracks which Sales rep owns it
  assignedToCompanyId?: string; // The Partner Company
  assignedToUserId?: string;    // The Staff
  
  description: string;

  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  
  // Refactored Category to Service Types (Multi-select)
  serviceTypes: string[]; 
  
  // Operation Logs
  logs: TicketLog[];
}

export interface Notification {
  id: string;
  title: string;
  date: string;
  type: 'news' | 'alert' | 'update';
  link?: string;
}

export interface RegistrationRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  type?: 'Distributor' | 'Installer';
}
