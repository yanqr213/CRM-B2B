
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Trash2, Lock, Edit, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InternalAccountManagementProps {
  internalUsers: User[]; // Contains SALES and SUPER_ADMIN
  onAddUser: (user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
}

const InternalAccountManagement: React.FC<InternalAccountManagementProps> = ({ internalUsers, onAddUser, onDeleteUser, onUpdateUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [resettingPassUserId, setResettingPassUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const { t } = useLanguage();
  
  // Add Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.INTERNAL_SALES });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
        ...newUser,
        companyId: 'c0' // Internal users belong to Headquarters
    });
    setShowAddModal(false);
    setNewUser({ name: '', email: '', password: '', role: UserRole.INTERNAL_SALES });
  };

  const handleResetPass = () => {
      if(resettingPassUserId && newPassword) {
          onUpdateUser(resettingPassUserId, { password: newPassword });
          setResettingPassUserId(null);
          setNewPassword('');
          alert('Password Changed');
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('internal_accounts')}</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm">
           <UserPlus size={18} /> {t('add_user')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium uppercase">
                <tr>
                    <th className="px-6 py-4">{t('name')}</th>
                    <th className="px-6 py-4">{t('email')}</th>
                    <th className="px-6 py-4">{t('role')}</th>
                    <th className="px-6 py-4 text-right">{t('action')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {internalUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === UserRole.SUPER_ADMIN ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                              {t(`role_${u.role.toLowerCase()}`)}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                            <button onClick={() => setResettingPassUserId(u.id)} className="text-orange-500 hover:text-orange-700 flex items-center gap-1"><Lock size={14}/> {t('reset_pass')}</button>
                            {u.id !== 'u0' && ( // Prevent deleting main root user (mock logic)
                                <button 
                                    onClick={() => {
                                        if(window.confirm('Delete?')) onDeleteUser(u.id);
                                    }} 
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                    <Trash2 size={14}/> {t('delete')}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                  <div className="flex justify-between mb-4">
                      <h3 className="font-bold text-lg">{t('add_user')}</h3>
                      <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  <form onSubmit={handleAddSubmit} className="space-y-4">
                      <div>
                          <label className="text-sm text-gray-600">{t('role')}</label>
                          <select 
                            className="w-full border p-2 rounded bg-white text-gray-900" 
                            value={newUser.role} 
                            onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                          >
                              <option value={UserRole.INTERNAL_SALES}>{t('role_internal_sales')}</option>
                              <option value={UserRole.SUPER_ADMIN}>{t('role_super_admin')}</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">{t('name')}</label>
                          <input required className="w-full border p-2 rounded bg-white text-gray-900" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">{t('email')}</label>
                          <input required type="email" className="w-full border p-2 rounded bg-white text-gray-900" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">{t('password')}</label>
                          <input required type="text" className="w-full border p-2 rounded bg-white text-gray-900" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">{t('save')}</button>
                  </form>
              </div>
          </div>
      )}

      {/* Reset Password Modal */}
      {resettingPassUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                  <h3 className="font-bold text-lg mb-4">{t('reset_pass')}</h3>
                  <input className="w-full border p-2 rounded bg-white text-gray-900 mb-4" placeholder="..." value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setResettingPassUserId(null)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
                      <button onClick={handleResetPass} className="px-4 py-2 bg-orange-500 text-white rounded">{t('save')}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default InternalAccountManagement;
