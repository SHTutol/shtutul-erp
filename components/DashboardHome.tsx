
import React, { useEffect, useState } from 'react';
import { ViewType } from '../App';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  History, 
  Building,
  ArrowRight,
  Zap
} from 'lucide-react';

interface DashboardHomeProps {
  onViewChange: (view: ViewType) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onViewChange }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Total Requisitions', value: '1,284', icon: <TrendingUp className="text-blue-500" />, trend: '+12% from last month' },
    { label: 'Pending Vouchers', value: '14', icon: <Clock className="text-amber-500" />, trend: 'Needs immediate attention' },
    { label: 'Disbursed (Month)', value: '৳4,52,000', icon: <CheckCircle2 className="text-green-500" />, trend: 'Within budget limits' },
    { label: 'Active Concerns', value: '7', icon: <Building className="text-purple-500" />, trend: 'All systems operational' },
  ];

  const recentActivities = [
    { id: 1, type: 'Requisition', title: 'Fuel for SIM Fabrics', amount: '৳15,000', time: '2 hours ago', status: 'Approved' },
    { id: 2, type: 'Voucher', title: 'Stationery - SIM Knit Dyeing', amount: '৳2,450', time: '5 hours ago', status: 'Pending' },
    { id: 3, type: 'Requisition', title: 'Raw Material - SIM Denim Ltd', amount: '৳1,20,000', time: 'Yesterday', status: 'Disbursed' },
    { id: 4, type: 'System', title: 'New Sister Concern Added', amount: 'N/A', time: '2 days ago', status: 'Complete' },
  ];

  const quickActions = [
    { id: 'REQUISITION', label: 'Create Requisition', color: 'bg-blue-600', icon: <PlusCircle size={24} /> },
    { id: 'DEBIT_VOUCHER', label: 'New Debit Voucher', color: 'bg-green-600', icon: <Zap size={24} /> },
    { id: 'REQ_REPORT', label: 'View Ledger Report', color: 'bg-slate-800', icon: <History size={24} /> },
  ];

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="w-full flex flex-col bg-slate-50 min-h-screen">
      <div className="relative h-72 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col justify-center px-12 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="z-10 flex justify-between items-end">
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight mb-2 italic">
              SHTutol <span className="text-indigo-400">ERP</span>
            </h1>
            <p className="text-slate-300 text-xl font-medium">
              {getGreeting()}, <span className="text-white font-bold uppercase tracking-widest italic">Manager</span>. Welcome back.
            </p>
          </div>
          <div className="text-right">
            <div className="text-white text-4xl font-mono font-bold">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">SHTutol ERP Systems</p>
          </div>
        </div>
      </div>

      <div className="px-12 -mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-20">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase mb-1">{stat.label}</h3>
            <div className="text-3xl font-black text-slate-800">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="px-12 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tighter italic">Recent Activities</h2>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{act.title}</td>
                    <td className="px-6 py-4 font-black text-slate-900 text-right">{act.amount}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{act.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
           {quickActions.map(action => (
             <button key={action.id} onClick={() => onViewChange(action.id as ViewType)} className={`w-full ${action.color} text-white p-6 rounded-2xl flex items-center justify-between font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-[0.98] transition-all group`}>
               {action.label} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};
