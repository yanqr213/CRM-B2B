
import React from 'react';
import { RegistrationRequest } from '../types';
import { CheckCircle, XCircle, Clock, Building, User, Phone, Mail } from 'lucide-react';

interface AdminPartnersProps {
  requests: RegistrationRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AdminPartners: React.FC<AdminPartnersProps> = ({ requests, onApprove, onReject }) => {
  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">渠道商审批管理</h2>
      
      {pendingRequests.length === 0 ? (
         <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500 opacity-50"/>
            <p className="text-lg">暂无待审批的申请</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start gap-6">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide uppercase ${req.type === 'Distributor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {req.type === 'Distributor' ? '分销商申请' : '安装商申请'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> 申请时间: {req.requestDate}</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">{req.companyName}</h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><User size={14}/> 联系人: {req.contactPerson}</div>
                    <div className="flex items-center gap-2"><Phone size={14}/> 电话: {req.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={14}/> 邮箱: {req.email}</div>
                    <div className="flex items-center gap-2"><Building size={14}/> 资质审核: 待审核</div>
                 </div>
               </div>

               <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => onReject(req.id)}
                    className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <XCircle size={18}/> 拒绝
                  </button>
                  <button 
                    onClick={() => onApprove(req.id)}
                    className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <CheckCircle size={18}/> 批准加入
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
