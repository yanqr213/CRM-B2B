
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, UserPlus, Trash2, Lock, X } from 'lucide-react';

interface InstallerManagementProps {
  currentUser: User;
  installers: User[];
  onAddInstaller: (user: Partial<User>) => void;
  onRemoveInstaller: (id: string) => void;
  onUpdateInstaller: (id: string, data: Partial<User>) => void;
}

const InstallerManagement: React.FC<InstallerManagementProps> = ({ 
  currentUser, 
  installers, 
  onAddInstaller, 
  onRemoveInstaller, 
  onUpdateInstaller 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [resettingPassId, setResettingPassId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const isHQ = currentUser.companyId === 'c0';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInstaller({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: UserRole.PARTNER_STAFF,
      companyId: currentUser.companyId // Create under current user's company (HQ or Partner)
    });
    setShowAddModal(false);
    setNewUser({ name: '', email: '', password: '' });
  };

  const handleResetPass = () => {
    if (resettingPassId && newPassword) {
        onUpdateInstaller(resettingPassId, { password: newPassword });
        setResettingPassId(null);
        setNewPassword('');
        alert('密码修改成功');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{isHQ ? '总部安装团队管理' : '安装团队管理'}</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
           <UserPlus size={18} /> 添加安装工
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium uppercase">
                <tr>
                    <th className="px-6 py-4">姓名</th>
                    <th className="px-6 py-4">邮箱 (登录名)</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4 text-right">操作</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {installers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                    {u.name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">正常</span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                            <button onClick={() => setResettingPassId(u.id)} className="text-orange-500 hover:text-orange-700 flex items-center gap-1" title="重置密码"><Lock size={16}/></button>
                            <button 
                                onClick={() => {
                                    if(window.confirm('确定删除该安装工？')) onRemoveInstaller(u.id);
                                }} 
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                title="删除"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </td>
                    </tr>
                ))}
                {installers.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">暂无安装人员</td></tr>
                )}
            </tbody>
         </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                  <div className="flex justify-between mb-4">
                      <h3 className="font-bold text-lg">添加安装工</h3>
                      <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  <form onSubmit={handleAddSubmit} className="space-y-4">
                      <div>
                          <label className="text-sm text-gray-600">姓名</label>
                          <input required className="w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">邮箱 (登录账号)</label>
                          <input required type="email" className="w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-sm text-gray-600">初始密码</label>
                          <input required type="text" className="w-full border p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">创建账号</button>
                  </form>
              </div>
          </div>
      )}

      {/* Reset Password Modal */}
      {resettingPassId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                  <h3 className="font-bold text-lg mb-4">重置密码</h3>
                  <input className="w-full border p-2 rounded bg-white text-gray-900 mb-4" placeholder="新密码" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setResettingPassId(null)} className="px-4 py-2 text-gray-600">取消</button>
                      <button onClick={handleResetPass} className="px-4 py-2 bg-orange-500 text-white rounded">确认</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default InstallerManagement;
