
import React from 'react';
import { Company, User, UserRole } from '../types';
import { Building, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AccountProps {
  currentUser: User;
  company: Company;
  onUpdateCompany: (data: Partial<Company>) => void;
}

const Account: React.FC<AccountProps> = ({ currentUser, company, onUpdateCompany }) => {
  const { t } = useLanguage();
  
  const isHQ = company.id === 'c0';
  // Permission Logic:
  // 1. HQ Info: Read-only in this view (System locked or managed elsewhere).
  // 2. Partner Info: Read-only for Partner Admin/Staff in this view.
  //    (Editing happens via Sales/Super in PartnerManagement component)
  const canEditInfo = false; 

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-gray-900">{t('company_info')}</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
         <div className="animate-fade-in space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Company Details Form */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Building size={20}/> {t('details')} 
                  {!canEditInfo && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Read-only</span>}
                </h3>
                <div>
                   <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                   <input 
                     type="text" 
                     className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
                     value={company.name} 
                     disabled 
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">{t('address')}</label>
                   <div className="relative mt-1">
                     <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                     <input 
                       type="text" 
                       className={`w-full border border-gray-300 rounded-lg pl-9 p-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 ${!canEditInfo ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`} 
                       value={company.address}
                       onChange={(e) => onUpdateCompany({ address: e.target.value })}
                       disabled={!canEditInfo}
                     />
                   </div>
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">{t('phone')}</label>
                   <div className="relative mt-1">
                     <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                     <input 
                       type="text" 
                       className={`w-full border border-gray-300 rounded-lg pl-9 p-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 ${!canEditInfo ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`} 
                       value={company.phone}
                       onChange={(e) => onUpdateCompany({ phone: e.target.value })}
                       disabled={!canEditInfo}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">{t('service_area')}</label>
                   <input 
                       type="text" 
                       className={`mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 ${!canEditInfo ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`} 
                       value={company.serviceArea}
                       onChange={(e) => onUpdateCompany({ serviceArea: e.target.value })}
                       disabled={!canEditInfo}
                     />
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
