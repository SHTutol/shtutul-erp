
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
  Zap,
  Wifi
} from 'lucide-react';

import { RequisitionData, DebitVoucherData, SisterRecord, User } from '../types';

interface DashboardHomeProps {
  onViewChange: (view: ViewType) => void;
  activeUserCount?: number;
  requisitions: RequisitionData[];
  vouchers: DebitVoucherData[];
  sisters: SisterRecord[];
  user: User | null;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ 
  onViewChange, 
  activeUserCount = 1,
  requisitions,
  vouchers,
  sisters,
  user
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingVouchers = vouchers.filter(v => v.status === 'Pending').length;
  const pendingReqs = requisitions.filter(r => r.status === 'Pending').length;

  const totalReqAmount = requisitions.reduce((sum, r) => sum + (Number(r.amountTk) || 0), 0);

  const stats = [
    { label: 'Total Requisitions', value: requisitions.length.toLocaleString(), icon: <TrendingUp className="text-blue-500" />, trend: `Total: ৳${totalReqAmount.toLocaleString()}` },
    { label: 'Pending Vouchers', value: pendingVouchers.toString(), icon: <Clock className="text-amber-500" />, trend: `${pendingReqs} Req Pending Approval` },
    { label: 'Active Sessions', value: activeUserCount.toString(), icon: <Wifi className="text-green-500 animate-pulse" />, trend: 'Live system users' },
    { label: 'Active Concerns', value: sisters.length.toString(), icon: <Building className="text-purple-500" />, trend: 'All systems operational' },
  ];

  // Combine and sort activities
  const allActivities = [
    ...requisitions.map(r => ({
      id: r.id,
      type: 'Requisition',
      title: `${r.purpose || 'No Purpose'} - ${r.sisterConcern || 'No Concern'}`,
      amount: `৳${(Number(r.amountTk) || 0).toLocaleString()}`,
      date: r.date ? new Date(r.date) : new Date(),
      status: r.status || 'Pending'
    })),
    ...vouchers.map(v => ({
      id: v.id,
      type: 'Voucher',
      title: `${v.accountHead || 'No Head'} - ${v.sisterConcern || 'No Concern'}`,
      amount: `৳${(Number(v.amountTk) || 0).toLocaleString()}`,
      date: v.date ? new Date(v.date) : new Date(),
      status: v.status || 'Pending'
    }))
  ].sort((a, b) => {
    const timeA = isNaN(a.date.getTime()) ? 0 : a.date.getTime();
    const timeB = isNaN(b.date.getTime()) ? 0 : b.date.getTime();
    return timeB - timeA;
  }).slice(0, 6);

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
              {getGreeting()}, <span className="text-white font-bold uppercase tracking-widest italic">{user?.name || 'User'}</span>. Welcome back.
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
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
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
                {allActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{act.title}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.type} • {act.date.toLocaleDateString('en-GB')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-right">{act.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        act.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {allActivities.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-bold uppercase text-xs">No recent activities found</td>
                  </tr>
                )}
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
