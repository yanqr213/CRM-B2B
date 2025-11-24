
import React, { useState } from 'react';
import { RegistrationRequest, Company, User, UserRole } from '../types';
import { CheckCircle, XCircle, Clock, Building, User as UserIcon, Phone, Mail, Plus, Edit, Trash2, Lock, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PartnerManagementProps {
  requests: RegistrationRequest[];
  partners: Company[];
  partnerAdmins: User[]; // The main user for each company
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onDeletePartner: (companyId: string) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  onUpdatePartner: (companyId: string, data: Partial<Company>) => void;
}

const PartnerManagement: React.FC<PartnerManagementProps> = ({ 
  requests, 
  partners, 
  partnerAdmins, 
  onApproveRequest, 
  onRejectRequest,
  onDeletePartner,
  onResetPassword,
  onUpdatePartner
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'requests'>('active');
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const { t } = useLanguage();

  // Modal State for Edit/Reset
  const [editingPartner, setEditingPartner] = useState<Company | null>(null);
  const [resettingPassUserId, setResettingPassUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
        onUpdatePartner(editingPartner.id, editingPartner);
        setEditingPartner(null);
    }
  };

  const handleSavePassword = () => {
    if (resettingPassUserId && newPassword) {
        onResetPassword(resettingPassUserId, newPassword);
        setResettingPassUserId(null);
        setNewPassword('');
        alert('Password Reset.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('partners')}</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t('active_partners')} ({partners.filter(p => p.id !== 'c0').length})
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t('requests')} ({pendingRequests.length})
            </button>
         </div>

         <div className="p-6">
            {activeTab === 'active' && (
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium uppercase">
                        <tr>
                            <th className="px-4 py-3">{t('name')}</th>
                            <th className="px-4 py-3">{t('service_area')}</th>
                            <th className="px-4 py-3">{t('role_partner_admin')}</th>
                            <th className="px-4 py-3">{t('phone')}</th>
                            <th className="px-4 py-3 text-right">{t('action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {partners.filter(p => p.id !== 'c0').map(p => {
                            const admin = partnerAdmins.find(u => u.companyId === p.id);
                            return (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                                    <td className="px-4 py-3">{p.serviceArea}</td>
                                    <td className="px-4 py-3">
                                        {admin ? (
                                            <div>
                                                <div className="font-medium">{admin.name}</div>
                                                <div className="text-xs text-gray-400">{admin.email}</div>
                                            </div>
                                        ) : <span className="text-red-500 text-xs">No Admin</span>}
                                    </td>
                                    <td className="px-4 py-3">{p.phone}</td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button onClick={() => setEditingPartner(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title={t('edit')}><Edit size={16}/></button>
                                        {admin && (
                                            <button onClick={() => setResettingPassUserId(admin.id)} className="p-1 text-orange-500 hover:bg-orange-50 rounded" title={t('reset_pass')}><Lock size={16}/></button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`${t('delete')}?`)) {
                                                    onDeletePartner(p.id);
                                                }
                                            }} 
                                            className="p-1 text-red-600 hover:bg-red-50 rounded" 
                                            title={t('delete')}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {partners.filter(p => p.id !== 'c0').length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">None</td>
                            </tr>
                        )}
                    </tbody>
                  </table>
               </div>
            )}

            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">None</p>
                    ) : pendingRequests.map(req => (
                        <div key={req.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                             <div>
                                 <h3 className="font-bold text-gray-900">{req.companyName}</h3>
                                 <p className="text-sm text-gray-500 mt-1">{req.contactPerson} | {req.phone}</p>
                                 <p className="text-xs text-gray-400 mt-1">{req.requestDate}</p>
                             </div>
                             <div className="flex gap-2">
                                 <button onClick={() => onRejectRequest(req.id)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm">{t('reject')}</button>
                                 <button onClick={() => onApproveRequest(req.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">{t('approve')}</button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>

      {/* Edit Modal */}
      {editingPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                  <h3 className="font-bold text-lg mb-4">{t('edit')}</h3>
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                      <div>
                          <label className="text-sm text-gray-600">{t('name')}</label>
                          <input className="w-full border p-2 rounded bg-white text-gray-900" value={editingPartner.name} onChange={e => setEditingPartner({...editingPartner, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">{t('service_area')}</label>
                          <input className="w-full border p-2 rounded bg-white text-gray-900" value={editingPartner.serviceArea} onChange={e => setEditingPartner({...editingPartner, serviceArea: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">{t('phone')}</label>
                          <input className="w-full border p-2 rounded bg-white text-gray-900" value={editingPartner.phone} onChange={e => setEditingPartner({...editingPartner, phone: e.target.value})} />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setEditingPartner(null)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{t('save')}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Reset Password Modal */}
      {resettingPassUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                  <h3 className="font-bold text-lg mb-4">{t('reset_pass')}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm text-gray-600">{t('password')}</label>
                          <input className="w-full border p-2 rounded bg-white text-gray-900" type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="..." />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setResettingPassUserId(null)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
                          <button onClick={handleSavePassword} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">{t('save')}</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PartnerManagement;
