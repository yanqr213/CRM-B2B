
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Support from './components/Support';
import Account from './components/Account'; // This is now Company Info view
import PartnerManagement from './components/PartnerManagement';
import InternalAccountManagement from './components/SalesManagement'; // Renamed file conceptually, but reusing the file with new content
import InstallerManagement from './components/InstallerManagement';
import { 
  USERS, 
  COMPANIES, 
  PRODUCTS, 
  INITIAL_TICKETS, 
  NOTIFICATIONS,
  REGISTRATION_REQUESTS
} from './services/mockData';
import { User, UserRole, Ticket, Company, RegistrationRequest, TicketStatus } from './types';

// Wrapper component to use hooks
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Application State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Mock Database States
  const [allUsers, setAllUsers] = useState<User[]>(USERS);
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(REGISTRATION_REQUESTS);
  const [preSelectedProductId, setPreSelectedProductId] = useState<string | null>(null);

  // Derived Data
  const myCompany = currentUser ? companies.find(c => c.id === currentUser.companyId) : null;
  
  // Installer List Logic:
  // If Sales/Super: Show HQ Installers (c0 + PARTNER_STAFF)
  // If Partner Admin: Show My Installers (myCompanyId + PARTNER_STAFF)
  const getInstallersList = () => {
      if (!currentUser) return [];
      const targetCompanyId = (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.INTERNAL_SALES) 
          ? 'c0' 
          : currentUser.companyId;
      
      return allUsers.filter(u => u.companyId === targetCompanyId && u.role === UserRole.PARTNER_STAFF);
  };

  // --- Handlers ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  const handleRequestSupport = (productId: string) => {
    setPreSelectedProductId(productId);
    navigate('/support');
  };

  const handleSaveTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  const handleUpdateCompany = (data: Partial<Company>) => {
    if (!currentUser) return;
    setCompanies(prev => prev.map(c => c.id === currentUser.companyId ? { ...c, ...data } : c));
  };

  // Generic User Handlers
  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || 'user@example.com',
      password: userData.password || '123',
      role: userData.role || UserRole.PARTNER_STAFF,
      companyId: userData.companyId || (currentUser ? currentUser.companyId : 'c0'),
    };
    setAllUsers(prev => [...prev, newUser]);
    alert(`账号已创建：${newUser.email}`);
  };

  const handleUpdateUser = (userId: string, data: Partial<User>) => {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  const handleRemoveUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  // --- Partner Management ---
  const handleApproveRequest = (requestId: string) => {
    const req = registrationRequests.find(r => r.id === requestId);
    if (!req) return;

    const newCompanyId = `c${Date.now()}`;
    const newCompany: Company = {
      id: newCompanyId,
      name: req.companyName,
      address: '待完善地址',
      phone: req.phone,
      serviceArea: '待完善区域',
    };

    // Create Admin User for Partner
    const newUser: User = {
      id: `u${Date.now()}`,
      name: req.contactPerson,
      email: req.email,
      password: '123', 
      role: UserRole.PARTNER_ADMIN,
      companyId: newCompanyId,
    };

    setCompanies(prev => [...prev, newCompany]);
    setAllUsers(prev => [...prev, newUser]);
    setRegistrationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));
    
    alert(`已批准 ${req.companyName}。账户已创建`);
  };

  const handleRejectRequest = (requestId: string) => {
    setRegistrationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
  };

  const handleDeletePartner = (companyId: string) => {
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      setAllUsers(prev => prev.filter(u => u.companyId !== companyId));

      // Orphaned Ticket Logic
      setTickets(prev => prev.map(t => {
          if (t.assignedToCompanyId === companyId && t.status !== TicketStatus.CLOSED) {
              return {
                  ...t,
                  assignedToCompanyId: undefined,
                  assignedToUserId: undefined,
                  upstreamCompanyId: 'c0', 
                  status: TicketStatus.PENDING_ASSIGN, 
                  messages: [...t.messages, {
                      id: `sys${Date.now()}`,
                      senderId: 'system',
                      senderName: '系统',
                      text: '原合作伙伴已被移除，工单回退至总部待分配。',
                      timestamp: new Date(),
                  }]
              };
          }
          return t;
      }));
      
      alert('合作伙伴已移除，相关未完成工单已回退至总部。');
  };
  
  const handleUpdatePartner = (companyId: string, data: Partial<Company>) => {
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...data } : c));
  };


  // --- Login Check ---
  if (!isAuthenticated || !currentUser) {
    return <Login users={allUsers} onLogin={handleLogin} />;
  }

  const currentPath = location.pathname.replace('/', '');

  return (
    <Layout 
      currentUser={currentUser} 
      currentPath={currentPath} 
      onNavigate={(path) => navigate(path)}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              user={currentUser} 
              notifications={NOTIFICATIONS} 
              recentTickets={tickets.filter(t => {
                  if (currentUser.role === UserRole.SUPER_ADMIN) return true;
                  if (currentUser.role === UserRole.INTERNAL_SALES) return t.createdBy === currentUser.id || t.salesOwnerId === currentUser.id;
                  if (currentUser.role === UserRole.PARTNER_STAFF) return t.assignedToUserId === currentUser.id;
                  return t.companyId === currentUser.companyId || t.assignedToCompanyId === currentUser.companyId;
              }).slice(0, 3)}
              onNavigate={(path) => navigate(path)}
            />
          } 
        />
        <Route 
          path="/products" 
          element={
            <Products 
              products={PRODUCTS} 
              onRequestSupport={handleRequestSupport} 
            />
          } 
        />
        <Route 
          path="/support" 
          element={
            <Support 
              currentUser={currentUser}
              tickets={tickets}
              products={PRODUCTS}
              allCompanies={companies}
              allUsers={allUsers}
              preSelectedProductId={preSelectedProductId}
              onClearPreSelectedProduct={() => setPreSelectedProductId(null)}
              onSaveTicket={handleSaveTicket}
              onUpdateTicket={handleUpdateTicket}
              onDeleteTicket={handleDeleteTicket}
            />
          } 
        />
        <Route 
          path="/company-info" 
          element={
             myCompany ? (
              <Account 
                currentUser={currentUser}
                company={myCompany}
                onUpdateCompany={handleUpdateCompany}
              />
             ) : <div>公司信息加载中...</div>
          } 
        />
        
        {/* Installer Management (Available to all except Staff, logic inside component handles scope) */}
        {currentUser.role !== UserRole.PARTNER_STAFF && (
           <Route
             path="/installers"
             element={
                <InstallerManagement 
                   currentUser={currentUser}
                   installers={getInstallersList()}
                   onAddInstaller={handleAddUser}
                   onRemoveInstaller={handleRemoveUser}
                   onUpdateInstaller={handleUpdateUser}
                />
             }
           />
        )}

        {/* Internal Account Management (Super Admin Only) */}
        {currentUser.role === UserRole.SUPER_ADMIN && (
            <Route 
                path="/internal-accounts"
                element={
                    <InternalAccountManagement 
                        internalUsers={allUsers.filter(u => u.role === UserRole.INTERNAL_SALES || u.role === UserRole.SUPER_ADMIN)}
                        onAddUser={handleAddUser}
                        onDeleteUser={handleRemoveUser}
                        onUpdateUser={handleUpdateUser}
                    />
                }
            />
        )}

        {/* Partner Management (Sales & Super Admin) */}
        {(currentUser.role === UserRole.INTERNAL_SALES || currentUser.role === UserRole.SUPER_ADMIN) && (
          <Route 
            path="/partner-management" 
            element={
              <PartnerManagement 
                requests={registrationRequests} 
                partners={companies}
                partnerAdmins={allUsers.filter(u => u.role === UserRole.PARTNER_ADMIN)}
                onApproveRequest={handleApproveRequest} 
                onRejectRequest={handleRejectRequest} 
                onDeletePartner={handleDeletePartner}
                onResetPassword={(uid, pass) => handleUpdateUser(uid, { password: pass })}
                onUpdatePartner={handleUpdatePartner}
              />
            } 
          />
        )}
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
