
import React from 'react';
import { User, Notification, Ticket, TicketStatus } from '../types';
import { AlertCircle, CheckCircle, Clock, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  user: User;
  notifications: Notification[];
  recentTickets: Ticket[];
  onNavigate: (path: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, notifications, recentTickets, onNavigate }) => {
  const { t } = useLanguage();
  const pendingTickets = recentTickets.filter(t => t.status !== TicketStatus.CLOSED).length;
  const closedTickets = recentTickets.filter(t => t.status === TicketStatus.CLOSED).length;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden mt-6 md:mt-0">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
           <svg width="300" height="300" viewBox="0 0 100 100" fill="white"><circle cx="50" cy="50" r="50"/></svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('welcome_back')}, {user.name}</h1>
        <p className="text-blue-100 text-lg">{t('welcome_sub')}</p>
        <div className="mt-6 flex gap-4">
           <button 
            onClick={() => onNavigate('products')}
            className="px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition shadow-sm">
             {t('view_products')}
           </button>
           <button 
            onClick={() => onNavigate('support')}
            className="px-4 py-2 bg-blue-500 text-white bg-opacity-30 border border-blue-400 rounded-lg font-semibold text-sm hover:bg-opacity-40 transition">
             {t('view_tickets')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Quick Stats & Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition cursor-pointer" onClick={() => onNavigate('support')}>
              <div>
                <p className="text-gray-500 text-sm font-medium">{t('pending_tickets')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingTickets}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition cursor-pointer" onClick={() => onNavigate('support')}>
              <div>
                <p className="text-gray-500 text-sm font-medium">{t('closed_tickets')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{closedTickets}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          {/* Internal News (Tile Style) */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600" />
              {t('latest_news')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications.filter(n => n.type !== 'news').map(note => (
                <div key={note.id} className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                     <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                       note.type === 'alert' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                       {note.type === 'alert' ? t('urgent') : t('update')}
                     </span>
                     <span className="text-xs text-gray-400">{note.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{note.title}</h3>
                  {note.link && (
                    <a href={note.link} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">
                      {t('details')} <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: External News */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-gray-500"/> {t('industry_news')}
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {notifications.filter(n => n.type === 'news').map(news => (
                <li key={news.id} className="p-4 hover:bg-gray-50 transition group">
                   <a href={news.link || '#'} className="block">
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{news.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">{news.date}</span>
                        <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-500" />
                      </div>
                   </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
