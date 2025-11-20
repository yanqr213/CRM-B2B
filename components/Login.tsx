
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple mock authentication
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('邮箱或密码错误 (默认密码: 123)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col md:flex-row">
        <div className="w-full p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
              S
            </div>
            <h1 className="text-2xl font-bold text-gray-800">SunEnergyXT B2B</h1>
            <p className="text-gray-500 text-sm mt-2">合作伙伴综合服务门户</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100 text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
            >
              登录 <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-xs text-gray-400 text-center mb-2">快速演示入口 (点击切换角色):</p>
             <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
                {/* Super Admin */}
                <div onClick={() => {setEmail('root@sunenergyxt.com'); setPassword('123')}} 
                     className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-gray-50 p-2 rounded text-center border border-gray-200 transition">
                     🚀 超级管理员
                </div>
                
                {/* Sales A */}
                <div onClick={() => {setEmail('alice@sunenergyxt.com'); setPassword('123')}} 
                     className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-gray-50 p-2 rounded text-center border border-gray-200 transition">
                     👩‍💼 销售 A (Alice)
                </div>

                {/* Sales B */}
                <div onClick={() => {setEmail('bob@sunenergyxt.com'); setPassword('123')}} 
                     className="cursor-pointer hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 bg-gray-50 p-2 rounded text-center border border-gray-200 transition">
                     👨‍💼 销售 B (Bob)
                </div>

                {/* Partner Admin */}
                <div onClick={() => {setEmail('ian@partner.com'); setPassword('123')}} 
                     className="cursor-pointer hover:bg-green-50 hover:text-green-600 hover:border-green-200 bg-gray-50 p-2 rounded text-center border border-gray-200 transition">
                     🏢 合作伙伴 (Ian)
                </div>

                {/* Partner Staff */}
                <div onClick={() => {setEmail('sam@partner.com'); setPassword('123')}} 
                     className="cursor-pointer hover:bg-green-50 hover:text-green-600 hover:border-green-200 bg-gray-50 p-2 rounded text-center border border-gray-200 transition">
                     🔧 伙伴安装工 (Sam)
                </div>

                {/* HQ Staff */}
                <div onClick={() => {setEmail('make@sunenergyxt.com'); setPassword('123')}} 
                     className="cursor-pointer hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 bg-gray-50 p-2 rounded text-center border border-gray-200 transition">
                     🛠️ 总部安装工 (Make)
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
