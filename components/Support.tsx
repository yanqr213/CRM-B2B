
import React, { useState, useEffect } from 'react';
import { Ticket, User, Product, TicketStatus, UserRole, Message, Company, TicketLog } from '../types';
import { Search, Plus, Filter, MessageSquare, Paperclip, AlertTriangle, User as UserIcon, ArrowLeft, Send, XCircle, Calendar, Hash, UserCircle, Trash2, Settings, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SupportProps {
  currentUser: User;
  tickets: Ticket[];
  products: Product[];
  allCompanies: Company[];
  allUsers: User[];
  preSelectedProductId: string | null;
  onClearPreSelectedProduct: () => void;
  onSaveTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

const Support: React.FC<SupportProps> = ({ 
  currentUser, 
  tickets, 
  products, 
  allCompanies,
  allUsers,
  preSelectedProductId,
  onClearPreSelectedProduct,
  onSaveTicket, 
  onUpdateTicket,
  onDeleteTicket
}) => {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { t } = useLanguage();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Assignment Modal States
  const [showAssignCompanyModal, setShowAssignCompanyModal] = useState(false);
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const [selectedAssignId, setSelectedAssignId] = useState('');

  // Create Form States
  interface FormData {
      productId: string;
      sln: string;
      title: string;
      customerName: string;
      serviceTypes: string[];
      description: string;
      salesOwnerId: string;
  }

  const [formData, setFormData] = useState<FormData>({
    productId: '',
    sln: '',
    title: '',
    customerName: '',
    serviceTypes: [],
    description: '',
    salesOwnerId: '' // Only for Super Admin
  });

  useEffect(() => {
    if (preSelectedProductId) {
      setFormData(prev => ({ ...prev, productId: preSelectedProductId }));
      setView('create');
    }
  }, [preSelectedProductId]);

  // --- VISIBILITY RULES (ISOLATION) ---
  const filteredTickets = tickets.filter(ticket => {
    let canSee = false;
    
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super Admin sees EVERYTHING
      canSee = true;
    } else if (currentUser.role === UserRole.INTERNAL_SALES) {
      // Sales Isolation:
      // 1. Tickets created by ME
      // 2. Tickets assigned TO ME by Super Admin (salesOwnerId)
      canSee = ticket.createdBy === currentUser.id || ticket.salesOwnerId === currentUser.id;
    } else if (currentUser.role === UserRole.PARTNER_ADMIN) {
      // Partner Admin sees:
      // 1. Tickets assigned TO their company
      // 2. Tickets created BY their company/staff
      canSee = ticket.companyId === currentUser.companyId || 
               ticket.assignedToCompanyId === currentUser.companyId;
    } else if (currentUser.role === UserRole.PARTNER_STAFF) {
      // Staff sees:
      // 1. Tickets assigned strictly to them
      canSee = ticket.assignedToUserId === currentUser.id;
    }

    if (!canSee) return false;

    // Extended Search Logic
    const term = searchTerm.toLowerCase();
    const dateStr = new Date(ticket.createdAt).toLocaleDateString();
    const matchesSearch = 
      ticket.title.toLowerCase().includes(term) ||
      ticket.sln.toLowerCase().includes(term) ||
      ticket.id.toLowerCase().includes(term) ||
      ticket.customerName.toLowerCase().includes(term) ||
      dateStr.includes(term);
    
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- Helper: Can Delete Ticket? ---
  const canDeleteTicket = (ticket: Ticket) => {
      // 1. Super Admin & Sales can delete ANY ticket (that they can see)
      if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.INTERNAL_SALES) {
          return true;
      }
      // 2. Partner can delete ONLY tickets they created (Lifecycle ownership)
      if (currentUser.role === UserRole.PARTNER_ADMIN) {
          // If partner created it, they can delete it
          // BUT if it was assigned to them (upstreamCompanyId is Sales), they cannot delete
          return ticket.companyId === currentUser.companyId; 
      }
      return false;
  };

  // --- Helper: Create Log ---
  const createLog = (action: string): TicketLog => ({
      id: `log${Date.now()}`,
      action,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      timestamp: new Date()
  });

  // --- Lifecycle & Actions Helpers ---

  const getAssignablePartners = () => {
    // Sales/Super Admin assigns to Partners OR HQ (c0)
    return allCompanies; 
  };

  const getAssignableStaff = () => {
    if (!selectedTicket) return [];
    
    const targetCompanyId = selectedTicket.assignedToCompanyId;
    
    // If user is Sales/Super Admin acting on HQ ticket -> return HQ staff
    if ((currentUser.role === UserRole.INTERNAL_SALES || currentUser.role === UserRole.SUPER_ADMIN) && targetCompanyId === 'c0') {
        return allUsers.filter(u => u.companyId === 'c0' && u.role === UserRole.PARTNER_STAFF);
    }
    
    // Normal Partner logic
    return allUsers.filter(u => u.companyId === targetCompanyId && u.role === UserRole.PARTNER_STAFF);
  };

  const toggleServiceType = (type: string) => {
      setFormData(prev => {
          const exists = prev.serviceTypes.includes(type);
          return {
              ...prev,
              serviceTypes: exists 
                  ? prev.serviceTypes.filter(t => t !== type)
                  : [...prev.serviceTypes, type]
          };
      });
  };

  // --- Handlers ---

  const handleDelete = () => {
      if (!selectedTicket || !onDeleteTicket) return;
      if (window.confirm(t('confirm_delete'))) {
          onDeleteTicket(selectedTicket.id);
          setView('list');
          setSelectedTicket(null);
      }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.serviceTypes.length === 0) {
        alert('Please select at least one service type');
        return;
    }

    let initialStatus = TicketStatus.PENDING_ASSIGN;
    let assignedToCompanyId = undefined;
    let assignedToUserId = undefined;
    let upstreamCompanyId = undefined;
    let salesOwnerId = undefined;

    if (currentUser.role === UserRole.SUPER_ADMIN) {
        // Super Admin must assign to a Sales Rep
        if (!formData.salesOwnerId) {
            alert("Select Sales Rep");
            return;
        }
        salesOwnerId = formData.salesOwnerId;
        initialStatus = TicketStatus.PENDING_ASSIGN; // Waiting for Sales to assign partner
        upstreamCompanyId = 'c0';
    } else if (currentUser.role === UserRole.INTERNAL_SALES) {
        // Sales Creates -> Pending Assignment to Partner
        initialStatus = TicketStatus.PENDING_ASSIGN;
        upstreamCompanyId = 'c0';
        salesOwnerId = currentUser.id; // Self owned
    } else {
        // Partner creates -> Auto assigned to themselves
        initialStatus = currentUser.role === UserRole.PARTNER_ADMIN ? TicketStatus.PENDING_DISPATCH : TicketStatus.PENDING_PROCESS;
        assignedToCompanyId = currentUser.companyId;
        assignedToUserId = currentUser.role === UserRole.PARTNER_STAFF ? currentUser.id : undefined;
        upstreamCompanyId = 'c0'; // Upstream is Headquarters
        // Note: salesOwnerId remains undefined unless a Sales rep picks it up later, but Partner owns lifecycle
    }

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      sln: formData.sln,
      title: formData.title,
      customerName: formData.customerName,
      status: initialStatus,
      priority: 'MEDIUM',
      productId: formData.productId,
      createdBy: currentUser.id,
      createdRole: currentUser.role,
      companyId: currentUser.companyId,
      
      upstreamCompanyId,
      assignedToCompanyId,
      assignedToUserId,
      salesOwnerId,

      createdAt: new Date(),
      updatedAt: new Date(),
      serviceTypes: formData.serviceTypes,
      description: formData.description,
      messages: formData.description ? [{
        id: `m${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: formData.description,
        timestamp: new Date(),
      }] : [],
      logs: [{
          id: `log${Date.now()}`,
          action: 'Create Ticket',
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          operatorRole: currentUser.role,
          timestamp: new Date()
      }]
    };
    onSaveTicket(newTicket);
    setView('list');
    setFormData({ productId: '', sln: '', title: '', customerName: '', serviceTypes: [], description: '', salesOwnerId: '' });
    onClearPreSelectedProduct();
  };

  const handleAssignPartner = () => {
    if (!selectedTicket || !selectedAssignId) return;
    const partnerName = allCompanies.find(c => c.id === selectedAssignId)?.name;
    const updatedTicket = {
      ...selectedTicket,
      status: TicketStatus.PENDING_DISPATCH,
      assignedToCompanyId: selectedAssignId,
      upstreamCompanyId: currentUser.companyId,
      updatedAt: new Date(),
      messages: [...selectedTicket.messages, {
        id: `sys${Date.now()}`,
        senderId: 'system',
        senderName: 'system',
        text: `Assigned to: ${partnerName}`,
        timestamp: new Date(),
      }],
      logs: [...selectedTicket.logs, createLog(`Assign to: ${partnerName}`)]
    };
    onUpdateTicket(updatedTicket);
    setSelectedTicket(updatedTicket);
    setShowAssignCompanyModal(false);
    setSelectedAssignId('');
  };

  const handleAssignStaff = () => {
    if (!selectedTicket || !selectedAssignId) return;
    const staff = allUsers.find(u => u.id === selectedAssignId);
    const updatedTicket = {
      ...selectedTicket,
      status: TicketStatus.PENDING_PROCESS,
      assignedToUserId: selectedAssignId,
      updatedAt: new Date(),
      messages: [...selectedTicket.messages, {
        id: `sys${Date.now()}`,
        senderId: 'system',
        senderName: 'system',
        text: `Assigned to staff: ${staff?.name}`,
        timestamp: new Date(),
      }],
      logs: [...selectedTicket.logs, createLog(`Assign staff: ${staff?.name}`)]
    };
    onUpdateTicket(updatedTicket);
    setSelectedTicket(updatedTicket);
    setShowAssignStaffModal(false);
    setSelectedAssignId('');
  };

  const handleStatusChange = (newStatus: TicketStatus, note?: string) => {
    if (!selectedTicket) return;
    
    let sysMsgText = `Status updated: ${newStatus}`;
    if (note) sysMsgText += ` (${note})`;

    const logAction = `Update status: ${newStatus}${note ? ` (${note})` : ''}`;

    const updatedTicket = { 
      ...selectedTicket, 
      status: newStatus, 
      updatedAt: new Date(),
      messages: [...selectedTicket.messages, {
        id: `sys${Date.now()}`,
        senderId: 'system',
        senderName: 'system',
        text: sysMsgText,
        timestamp: new Date(),
      }],
      logs: [...selectedTicket.logs, createLog(logAction)]
    };
    onUpdateTicket(updatedTicket);
    setSelectedTicket(updatedTicket);
  };

  const handleInternalAuditPass = () => {
      if (!selectedTicket) return;
      
      const isPartnerCreated = selectedTicket.createdRole === UserRole.PARTNER_ADMIN || selectedTicket.createdRole === UserRole.PARTNER_STAFF;
      const isHQAssigned = selectedTicket.assignedToCompanyId === 'c0';
      
      if (isPartnerCreated || isHQAssigned) {
          handleStatusChange(TicketStatus.CLOSED, 'Audit Pass (Archived)');
      } else {
          handleStatusChange(TicketStatus.PENDING_FINAL_REVIEW, 'Audit Pass (Pending Review)');
      }
  }

  const handleSendMessage = (text: string) => {
    if (!selectedTicket) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date(),
    };
    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      updatedAt: new Date()
    };
    onUpdateTicket(updatedTicket);
    setSelectedTicket(updatedTicket);
  };

  // --- Render Actions ---

  const renderLifecycleActions = () => {
    if (!selectedTicket) return null;

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const isSales = currentUser.role === UserRole.INTERNAL_SALES;

    // 1. Sales Assignment
    if (selectedTicket.status === TicketStatus.PENDING_ASSIGN) {
       if (isSales || isSuperAdmin) {
          return (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><AlertTriangle size={16}/> {t('assign')}</h4>
              <button onClick={() => setShowAssignCompanyModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 w-full md:w-auto">
                {t('assign')}
              </button>
            </div>
          );
       }
    }

    // 2. Partner Dispatch
    const isPartnerDispatching = 
        selectedTicket.status === TicketStatus.PENDING_DISPATCH && 
        currentUser.role === UserRole.PARTNER_ADMIN && 
        currentUser.companyId === selectedTicket.assignedToCompanyId;

    const isHQDispatching = 
        selectedTicket.status === TicketStatus.PENDING_DISPATCH && 
        (isSales || isSuperAdmin) &&
        selectedTicket.assignedToCompanyId === 'c0'; 

    if (isPartnerDispatching || isHQDispatching || (isSuperAdmin && selectedTicket.status === TicketStatus.PENDING_DISPATCH)) {
       return (
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><UserIcon size={16}/> {t('dispatch')}</h4>
            <button onClick={() => setShowAssignStaffModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 w-full md:w-auto">
              {t('dispatch')}
            </button>
         </div>
       );
    }

    // 3. Execution (Staff Start/Finish) + Permission Override
    // Logic: Assigned Staff OR Partner Admin (of that company) OR Sales/Super (Override)
    const isAssignedStaff = selectedTicket.assignedToUserId === currentUser.id;
    const isPartnerAdmin = currentUser.role === UserRole.PARTNER_ADMIN && currentUser.companyId === selectedTicket.assignedToCompanyId;
    const isSalesOrSuper = currentUser.role === UserRole.INTERNAL_SALES || currentUser.role === UserRole.SUPER_ADMIN;

    const canOperateProcess = isAssignedStaff || isPartnerAdmin || isSalesOrSuper;
    
    // Helper to determine if this is an override action (not the assigned staff)
    const isOverride = !isAssignedStaff;
    const overrideLabel = isOverride ? ' (Override)' : '';

    if (canOperateProcess) {
        if (selectedTicket.status === TicketStatus.PENDING_PROCESS) {
            return (
              <button onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 mb-4">
                {t('start_process')} {overrideLabel}
              </button>
            );
        }
        if (selectedTicket.status === TicketStatus.IN_PROGRESS) {
             return (
              <button onClick={() => handleStatusChange(TicketStatus.PENDING_INTERNAL_AUDIT)} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 mb-4">
                {t('finish_submit')} {overrideLabel}
              </button>
            );
        }
    }

    // 4. Internal Audit 
    const isPartnerAuditing = 
        selectedTicket.status === TicketStatus.PENDING_INTERNAL_AUDIT && 
        currentUser.role === UserRole.PARTNER_ADMIN &&
        currentUser.companyId === selectedTicket.assignedToCompanyId;

    const isHQAuditing = 
        selectedTicket.status === TicketStatus.PENDING_INTERNAL_AUDIT && 
        (isSales || isSuperAdmin) &&
        selectedTicket.assignedToCompanyId === 'c0';

    if (isPartnerAuditing || isHQAuditing || (isSuperAdmin && selectedTicket.status === TicketStatus.PENDING_INTERNAL_AUDIT)) {
        const isPartnerCreated = selectedTicket.createdRole === UserRole.PARTNER_ADMIN || selectedTicket.createdRole === UserRole.PARTNER_STAFF;
        const isHQAssigned = selectedTicket.assignedToCompanyId === 'c0';

        const nextStepText = (isPartnerCreated || isHQAssigned) ? t('approve') : t('approve');
        
        return (
           <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
              <h4 className="font-bold text-purple-800 mb-3">{t('status_pending_internal_audit')}</h4>
              <div className="flex gap-2">
                 <button onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS, 'Rejected')} className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200 hover:bg-red-200 font-medium">
                    {t('reject')}
                 </button>
                 <button onClick={handleInternalAuditPass} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700">
                    {nextStepText}
                 </button>
              </div>
           </div>
        );
    }

    // 5. Final Review
    if (selectedTicket.status === TicketStatus.PENDING_FINAL_REVIEW && (isSales || isSuperAdmin)) {
         return (
           <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
              <h4 className="font-bold text-orange-800 mb-3">{t('status_pending_final_review')}</h4>
              <div className="flex gap-2">
                 <button onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS, 'Rejected')} className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200 hover:bg-red-200 font-medium">
                    {t('reject')}
                 </button>
                 <button onClick={() => handleStatusChange(TicketStatus.CLOSED, 'Approved')} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700">
                    {t('confirm_close')}
                 </button>
              </div>
           </div>
        );
    }

    return null;
  };


  // --- Views ---

  if (view === 'create') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t('create_ticket')}</h2>
          <button onClick={() => { setView('list'); onClearPreSelectedProduct(); }} className="text-gray-500 hover:text-gray-700"><XCircle /></button>
        </div>
        
        <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
          {/* SUPER ADMIN ASSIGNMENT */}
          {currentUser.role === UserRole.SUPER_ADMIN && (
             <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-bold text-purple-800 mb-2">{t('select_sales')}</label>
                <select 
                  required
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-900"
                  value={formData.salesOwnerId}
                  onChange={e => setFormData({...formData, salesOwnerId: e.target.value})}
                >
                  <option value="">...</option>
                  {allUsers.filter(u => u.role === UserRole.INTERNAL_SALES).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
             </div>
          )}

          {/* Customer Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('customer_name')}</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              placeholder={t('customer_name')}
            />
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('product_model')}</label>
              <select 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                value={formData.productId}
                onChange={e => setFormData({...formData, productId: e.target.value})}
              >
                <option value="">{t('product_model')}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sln')}</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                placeholder="SLN-2024-XXXX"
                value={formData.sln}
                onChange={e => setFormData({...formData, sln: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket_title')}</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder={t('ticket_title')}
            />
          </div>

          {/* Service Types (Multi-select) */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">{t('service_types')}</label>
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition select-none">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                     checked={formData.serviceTypes.includes('Installation')}
                     onChange={() => toggleServiceType('Installation')}
                   />
                   <span className="text-gray-700 font-medium">{t('type_install')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition select-none">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                     checked={formData.serviceTypes.includes('Removal')}
                     onChange={() => toggleServiceType('Removal')}
                   />
                   <span className="text-gray-700 font-medium">{t('type_remove')}</span>
                </label>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('desc')}</label>
            <textarea 
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white text-gray-900"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <button type="button" onClick={() => { setView('list'); onClearPreSelectedProduct(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">{t('cancel')}</button>
             <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">{t('submit')}</button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'detail' && selectedTicket) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 w-fit">
            <ArrowLeft size={18} /> {t('support')}
            </button>
            
            {/* Delete Button */}
            {canDeleteTicket(selectedTicket) && (
                <button 
                    onClick={handleDelete} 
                    className="flex items-center gap-2 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition"
                >
                    <Trash2 size={16} /> {t('delete')}
                </button>
            )}
        </div>

        <div className="flex flex-col md:flex-row h-full gap-6">
           {/* Left: Details & Actions */}
           <div className="md:w-1/3 space-y-6 overflow-y-auto pr-2">
              {/* Status Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('ticket_id')} #{selectedTicket.id}</span>
                     <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedTicket.title}</h2>
                     <p className="text-sm text-blue-600 mt-1 font-medium flex items-center gap-1"><UserCircle size={14}/> {selectedTicket.customerName}</p>
                   </div>
                   <StatusBadge status={selectedTicket.status} />
                 </div>
                 
                 {/* Action Buttons based on Lifecycle */}
                 {renderLifecycleActions()}

                 {/* Assignment Info */}
                 <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-2 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('partners')}:</span>
                      <span className="font-medium">{allCompanies.find(c => c.id === selectedTicket.assignedToCompanyId)?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('installers')}:</span>
                      <span className="font-medium">{allUsers.find(u => u.id === selectedTicket.assignedToUserId)?.name || '-'}</span>
                    </div>
                    {/* Show Sales Owner if assigned by Super Admin */}
                    {selectedTicket.salesOwnerId && (
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500">{t('role_internal_sales')}:</span>
                            <span className="font-medium text-purple-700">{allUsers.find(u => u.id === selectedTicket.salesOwnerId)?.name}</span>
                        </div>
                    )}
                 </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="font-semibold text-gray-900 mb-4">{t('details')}</h3>
                 <div className="space-y-4 text-sm">
                    <div>
                       <span className="text-gray-500 block mb-1">{t('desc')}</span>
                       <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-100">{selectedTicket.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <span className="text-gray-500 block">{t('sln')}</span>
                          <span className="font-medium">{selectedTicket.sln}</span>
                       </div>
                       <div>
                          <span className="text-gray-500 block">{t('last_updated')}</span>
                          <span className="font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                     <div>
                       <span className="text-gray-500 block mb-1">{t('service_types')}</span>
                       <div className="flex flex-wrap gap-2">
                          {selectedTicket.serviceTypes && selectedTicket.serviceTypes.length > 0 ? (
                              selectedTicket.serviceTypes.map(t => (
                                  <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-xs font-semibold flex items-center gap-1">
                                     <Settings size={10}/> {t}
                                  </span>
                              ))
                          ) : <span className="text-gray-400 italic">None</span>}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Operation Logs */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History size={18} className="text-gray-400"/> Log
                </h3>
                <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {[...selectedTicket.logs].reverse().map(log => (
                        <li key={log.id} className="relative pl-4 border-l-2 border-gray-200 last:border-0">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <div className="text-xs text-gray-400 mb-0.5">{new Date(log.timestamp).toLocaleString()}</div>
                            <div className="text-sm font-medium text-gray-800">{log.action}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {log.operatorName} 
                            </div>
                        </li>
                    ))}
                    {selectedTicket.logs.length === 0 && (
                        <li className="text-center text-gray-400 text-sm py-2">No logs</li>
                    )}
                </ul>
              </div>
           </div>

           {/* Right: Chat */}
           <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
             <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-700 flex items-center gap-2"><MessageSquare size={18} /> Chat</h3>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
                {selectedTicket.messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSystem = msg.senderId === 'system';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                         <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-200">{msg.text} - {new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        isMe 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                         <div className={`text-xs mb-1 ${isMe ? 'text-blue-200' : 'text-gray-500'} flex justify-between gap-4`}>
                            <span className="font-bold">{msg.senderName}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
             </div>

             {selectedTicket.status !== TicketStatus.CLOSED && (
               <div className="p-4 bg-gray-50 border-t border-gray-200">
                 <MessageInput onSend={handleSendMessage} />
               </div>
             )}
           </div>
        </div>

        {/* Modal: Assign Partner */}
        {showAssignCompanyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
               <h3 className="font-bold text-lg mb-4">{t('assign')}</h3>
               <select className="w-full border border-gray-300 p-2 rounded mb-4 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={selectedAssignId} onChange={e => setSelectedAssignId(e.target.value)}>
                 <option value="">...</option>
                 {getAssignablePartners().map(c => (
                   <option key={c.id} value={c.id}>{c.name} {c.id === 'c0' ? '(HQ)' : `(${c.serviceArea})`}</option>
                 ))}
               </select>
               <div className="flex justify-end gap-2">
                 <button onClick={() => setShowAssignCompanyModal(false)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
                 <button onClick={handleAssignPartner} className="px-4 py-2 bg-blue-600 text-white rounded">{t('save')}</button>
               </div>
            </div>
          </div>
        )}

        {/* Modal: Assign Staff */}
        {showAssignStaffModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
               <h3 className="font-bold text-lg mb-4">{t('dispatch')}</h3>
               <select className="w-full border border-gray-300 p-2 rounded mb-4 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={selectedAssignId} onChange={e => setSelectedAssignId(e.target.value)}>
                 <option value="">...</option>
                 {getAssignableStaff().map(u => (
                   <option key={u.id} value={u.id}>{u.name}</option>
                 ))}
               </select>
               <div className="flex justify-end gap-2">
                 <button onClick={() => setShowAssignStaffModal(false)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
                 <button onClick={handleAssignStaff} className="px-4 py-2 bg-blue-600 text-white rounded">{t('save')}</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('support')}</h2>
        {currentUser.role !== UserRole.PARTNER_STAFF && (
          <button onClick={() => setView('create')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition">
            <Plus size={18} /> {t('create_ticket')}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder={t('search_placeholder')}
             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">{t('all_status')}</option>
            {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium uppercase">
              <tr>
                <th className="px-6 py-4">{t('ticket_id')}</th>
                <th className="px-6 py-4">{t('title_customer')}</th>
                <th className="px-6 py-4">{t('responsible')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">{t('last_updated')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">#{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{ticket.title}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                       <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{ticket.sln}</span>
                       <span className="flex items-center gap-1 text-blue-600"><UserIcon size={10}/> {ticket.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex flex-col text-xs">
                      <span className="font-bold">{allCompanies.find(c => c.id === ticket.assignedToCompanyId)?.name || '-'}</span>
                      <span className="text-gray-400">{allUsers.find(u => u.id === ticket.assignedToUserId)?.name || ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                  <td className="px-6 py-4 text-gray-500">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => { setSelectedTicket(ticket); setView('detail'); }}
                      className="text-blue-600 hover:underline font-medium bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition"
                    >
                      {t('process')}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const { t } = useLanguage();
  const styles = {
    [TicketStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [TicketStatus.PENDING_ASSIGN]: 'bg-yellow-100 text-yellow-800',
    [TicketStatus.PENDING_DISPATCH]: 'bg-blue-100 text-blue-800',
    [TicketStatus.PENDING_PROCESS]: 'bg-cyan-100 text-cyan-800',
    [TicketStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800',
    [TicketStatus.PENDING_INTERNAL_AUDIT]: 'bg-purple-100 text-purple-800',
    [TicketStatus.PENDING_FINAL_REVIEW]: 'bg-orange-100 text-orange-800',
    [TicketStatus.CLOSED]: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {t(`status_${status.toLowerCase()}`)}
    </span>
  );
};

const MessageInput: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => {
  const [text, setText] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
       <div className="relative">
         <textarea 
           className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white text-gray-900"
           placeholder="..."
           rows={2}
           value={text}
           onChange={e => setText(e.target.value)}
           onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }}}
         />
         <button type="button" className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600">
           <Paperclip size={18} />
         </button>
       </div>
       <div className="flex justify-end items-center">
          <button type="submit" disabled={!text.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <Send size={16} /> {t('submit')}
          </button>
       </div>
    </form>
  );
};

export default Support;
