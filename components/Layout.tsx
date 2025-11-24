
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  LifeBuoy, 
  Building2, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck,
  Users,
  UserCog,
  Wrench,
  UserCircle,
  Globe
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  currentUser: User;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentUser, currentPath, onNavigate, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  // Base Nav Items
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, path: 'dashboard' },
    { id: 'products', label: t('products'), icon: Package, path: 'products' },
    { id: 'support', label: t('support'), icon: LifeBuoy, path: 'support' },
    // Account renamed to Company Info
    { id: 'company-info', label: t('company_info'), icon: Building2, path: 'company-info' },
  ];

  // 1. Internal Account Management (Super Admin Only) - Replaces Sales Mgmt
  if (currentUser.role === UserRole.SUPER_ADMIN) {
    navItems.splice(1, 0, { id: 'internal-accounts', label: t('internal_accounts'), icon: ShieldCheck, path: 'internal-accounts' });
  }

  // 2. Partner Management (Super Admin & Sales)
  if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.INTERNAL_SALES) {
    navItems.splice(currentUser.role === UserRole.SUPER_ADMIN ? 2 : 1, 0, { id: 'partner-mgmt', label: t('partners'), icon: Users, path: 'partner-management' });
  }

  // 3. Installer Management (Super Admin, Sales, Partner Admin)
  // Sales/Super manage HQ installers here. Partner Admin manages their own.
  if (currentUser.role !== UserRole.PARTNER_STAFF) {
      const insertIndex = navItems.findIndex(i => i.id === 'products');
      navItems.splice(insertIndex, 0, { id: 'installers', label: t('installers'), icon: Wrench, path: 'installers' });
  }

  const getRoleLabel = (role: UserRole) => {
    return t(`role_${role.toLowerCase()}`);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.INTERNAL_SALES: return 'bg-purple-100 text-purple-800';
      case UserRole.PARTNER_ADMIN: return 'bg-blue-100 text-blue-800';
      case UserRole.PARTNER_STAFF: return 'bg-green-100 text-green-800';
    }
  };

  const LanguageSwitcher = () => (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
       <button 
         onClick={() => setLanguage('de')} 
         className={`px-2 py-1 text-xs font-bold rounded ${language === 'de' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
       >
         DE
       </button>
       <button 
         onClick={() => setLanguage('en')} 
         className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
       >
         EN
       </button>
       <button 
         onClick={() => setLanguage('zh')} 
         className={`px-2 py-1 text-xs font-bold rounded ${language === 'zh' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
       >
         CN
       </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-full z-20">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center text-white font-bold">S</div>
          <span className="text-lg font-bold text-gray-800">SunEnergyXT</span>
        </div>
        
        <div className="p-4">
           <div className={`px-3 py-2 rounded-lg text-xs font-semibold mb-6 flex items-center gap-2 ${getRoleColor(currentUser.role)}`}>
              <UserCog size={14} />
              {getRoleLabel(currentUser.role)}
           </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentPath === item.path
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white border-b border-gray-200 z-30 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center text-white font-bold">S</div>
          <span className="text-lg font-bold text-gray-800">SunEnergyXT</span>
        </div>
        <div className="flex items-center gap-2">
           <LanguageSwitcher />
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4 flex flex-col" onClick={e => e.stopPropagation()}>
             <nav className="space-y-2 mt-16">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg ${
                    currentPath === item.path ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
               <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg text-red-600 mt-4 border-t"
              >
                <LogOut size={18} />
                {t('logout')}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 overflow-y-auto relative">
        {/* Desktop Header Language Switcher */}
        <div className="hidden md:flex absolute top-4 right-8 z-10">
           <LanguageSwitcher />
        </div>
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
