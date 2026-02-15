
import React, { useState, useEffect, useRef } from 'react';
import { RequisitionForm } from './components/RequisitionForm';
import { DebitVoucher } from './components/DebitVoucher';
import { RequisitionReport } from './components/RequisitionReport';
import { DebitVoucherReport } from './components/DebitVoucherReport';
import { NewNameEntry } from './components/NewNameEntry';
import { SisterConcernEntry } from './components/SisterConcernEntry';
import { UnitEntry } from './components/UnitEntry';
import { DashboardHome } from './components/DashboardHome';
import { RequisitionList } from './components/RequisitionList';
import { DebitVoucherList } from './components/DebitVoucherList';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { RequisitionData, UnitRecord, DebitVoucherData, PayeeRecord, SisterRecord, User } from './types';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
  Query,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  UserPlus, 
  Building2,
  Menu,
  X,
  List,
  Layers,
  FileBarChart,
  FileSpreadsheet,
  Receipt,
  LogOut,
  ChevronDown,
  Users,
  Cloud,
  CloudOff,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ServerCrash,
  ShieldAlert,
  Terminal,
  CircleCheck,
  Loader2
} from 'lucide-react';

export type ViewType = 'DASHBOARD' | 'REQ_LIST' | 'REQUISITION' | 'VIEW_REQUISITION' | 'DV_LIST' | 'DEBIT_VOUCHER' | 'VIEW_DV' | 'REQ_REPORT' | 'DV_REPORT' | 'NEW_NAME' | 'NEW_SISTER' | 'UNIT_ENTRY' | 'USER_MANAGEMENT';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionData[]>([]);
  const [debitVouchers, setDebitVouchers] = useState<DebitVoucherData[]>([]);
  const [units, setUnits] = useState<UnitRecord[]>([]);
  const [payees, setPayees] = useState<PayeeRecord[]>([]);
  const [sisters, setSisters] = useState<SisterRecord[]>([]);
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shtutul_erp_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'loading', msg: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingRequisition, setEditingRequisition] = useState<RequisitionData | null>(null);
  const [viewingRequisition, setViewingRequisition] = useState<RequisitionData | null>(null);
  const [editingDV, setEditingDV] = useState<DebitVoucherData | null>(null);
  const [viewingDV, setViewingDV] = useState<DebitVoucherData | null>(null);

  const ruleCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  useEffect(() => {
    const handleError = (error: any) => {
      console.error("Firestore Error:", error);
      if (error.code === 'permission-denied') {
        setIsOnline(false);
        setPermissionError(true);
      }
    };

    const setupListener = (coll: string, setter: (data: any[]) => void, sortQuery?: Query<DocumentData>) => {
      const q = sortQuery || collection(db, coll);
      return onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const data = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as any);
          setter(data);
          setPermissionError(false);
          setIsOnline(true);
        }, 
        handleError
      );
    };

    const unsubUsers = setupListener('users', setUsers);
    const unsubReqs = setupListener('requisitions', setRequisitions, query(collection(db, 'requisitions'), orderBy('date', 'desc')));
    const unsubDVs = setupListener('vouchers', setDebitVouchers, query(collection(db, 'vouchers'), orderBy('date', 'desc')));
    const unsubUnits = setupListener('units', setUnits);
    const unsubPayees = setupListener('payees', setPayees);
    const unsubSisters = setupListener('sisters', setSisters);

    return () => {
      unsubUsers(); unsubReqs(); unsubDVs(); unsubUnits(); unsubPayees(); unsubSisters();
    };
  }, []);

  const copyRules = () => {
    navigator.clipboard.writeText(ruleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToCloud = async (collName: string, data: any) => {
    setSaveStatus({ type: 'loading', msg: 'Cloud-এ সেভ হচ্ছে...' });
    try {
      await setDoc(doc(db, collName, data.id), data);
      setIsOnline(true);
      setPermissionError(false);
      setSaveStatus({ type: 'success', msg: 'Cloud-এ সফলভাবে সেভ হয়েছে!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e: any) {
      console.error("Save failed:", e);
      setIsOnline(false);
      setSaveStatus(null);
      if (e.code === 'permission-denied') {
        setPermissionError(true);
      } else {
        alert("ডাটা সেভ করতে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।");
      }
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('shtutul_erp_user', JSON.stringify(newUser));
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('shtutul_erp_user');
      setUser(null);
      setCurrentView('DASHBOARD');
    }
  };

  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'REQ_LIST', label: 'Requisition List', icon: <List size={20} /> },
    { id: 'DV_LIST', label: 'Debit Voucher List', icon: <Receipt size={20} /> },
    { id: 'REQ_REPORT', label: 'Req Report', icon: <FileSpreadsheet size={20} /> },
    { id: 'DV_REPORT', label: 'DV Report', icon: <FileBarChart size={20} /> },
    { id: 'NEW_NAME', label: 'Payee Names', icon: <UserPlus size={20} /> },
    { id: 'NEW_SISTER', label: 'Sister Concerns', icon: <Building2 size={20} /> },
    { id: 'UNIT_ENTRY', label: 'Unit Entry', icon: <Layers size={20} /> },
    { id: 'USER_MANAGEMENT', label: 'User Management', icon: <Users size={20} /> },
  ];

  const userPermissions = user?.permissions || [];
  const filteredMenuItems = menuItems.filter(item => userPermissions.includes(item.id));

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <DashboardHome onViewChange={setCurrentView} />;
      case 'REQ_LIST': return <RequisitionList requisitions={requisitions} setRequisitions={() => {}} onAdd={() => { setEditingRequisition(null); setCurrentView('REQUISITION'); }} onEdit={(req) => { setEditingRequisition(req); setCurrentView('REQUISITION'); }} onView={(req) => { setViewingRequisition(req); setCurrentView('VIEW_REQUISITION'); }} onPreview={(req) => { setViewingRequisition(req); setCurrentView('VIEW_REQUISITION'); setTimeout(() => window.print(), 800); }} onViewChange={setCurrentView} />;
      case 'REQUISITION': return <RequisitionForm onViewChange={setCurrentView} onSave={(data) => { saveToCloud('requisitions', data); setCurrentView('REQ_LIST'); }} editingData={editingRequisition} nextReqNo={`REQ-00${requisitions.length + 1}`} availableUnits={units} availablePayees={payees} availableSisters={sisters} />;
      case 'VIEW_REQUISITION': return <RequisitionForm onViewChange={setCurrentView} editingData={viewingRequisition} readOnly={true} availableUnits={units} availablePayees={payees} availableSisters={sisters} />;
      case 'DV_LIST': return <DebitVoucherList vouchers={debitVouchers} setVouchers={() => {}} onAdd={() => { setEditingDV(null); setCurrentView('DEBIT_VOUCHER'); }} onEdit={(dv) => { setEditingDV(dv); setCurrentView('DEBIT_VOUCHER'); }} onView={(dv) => { setViewingDV(dv); setCurrentView('VIEW_DV'); }} onPreview={(dv) => { setViewingDV(dv); setCurrentView('VIEW_DV'); setTimeout(() => window.print(), 800); }} onViewChange={setCurrentView} />;
      case 'DEBIT_VOUCHER': return <DebitVoucher onViewChange={setCurrentView} onSave={(newData) => { saveToCloud('vouchers', newData); setCurrentView('DV_LIST'); }} editingData={editingDV} nextDVNo={`DV-00${debitVouchers.length + 1}/25`} availableUnits={units} availablePayees={payees} availableSisters={sisters} />;
      case 'VIEW_DV': return <DebitVoucher onViewChange={setCurrentView} editingData={viewingDV} readOnly={true} availableUnits={units} availablePayees={payees} availableSisters={sisters} />;
      case 'REQ_REPORT': return <RequisitionReport requisitions={requisitions} onViewChange={setCurrentView} />;
      case 'DV_REPORT': return <DebitVoucherReport vouchers={debitVouchers} onViewChange={setCurrentView} />;
      case 'NEW_NAME': return <NewNameEntry payees={payees} onUpdatePayees={(list) => list.forEach(p => saveToCloud('payees', p))} onViewChange={setCurrentView} />;
      case 'NEW_SISTER': return <SisterConcernEntry sisters={sisters} onUpdateSisters={(list) => list.forEach(s => saveToCloud('sisters', s))} onViewChange={setCurrentView} availablePayees={payees} />;
      case 'UNIT_ENTRY': return <UnitEntry units={units} onUpdateUnits={(list) => list.forEach(u => saveToCloud('units', u))} onViewChange={setCurrentView} />;
      case 'USER_MANAGEMENT': return <UserManagement users={users} onUpdateUsers={(list) => list.forEach(u => saveToCloud('users', u))} onViewChange={setCurrentView} />;
      default: return <DashboardHome onViewChange={setCurrentView} />;
    }
  };

  if (!user) return <Login onLogin={handleLogin} users={users} />;

  const isListView = ['REQ_LIST', 'DV_LIST', 'REQ_REPORT', 'DV_REPORT', 'NEW_NAME', 'NEW_SISTER', 'UNIT_ENTRY', 'USER_MANAGEMENT'].includes(currentView);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`no-print bg-slate-900 text-white flex flex-col transition-all duration-500 ease-in-out shadow-2xl z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950">
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto' : 'w-0'}`}>
            <span className="text-2xl font-black tracking-tighter whitespace-nowrap bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic">SIM ERP</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all shadow-lg">{isSidebarOpen ? <X size={20} /> : <Menu size={24} />}</button>
        </div>
        <nav className="flex-grow py-8 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          {filteredMenuItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentView(item.id as ViewType)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative active:scale-95 ${currentView === item.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`}>
              <div className="transition-transform group-hover:scale-110">{item.icon}</div>
              <span className={`font-black text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-grow overflow-auto relative flex flex-col bg-[#F8FAFC]">
        
        {saveStatus && (
          <div className="no-print fixed top-6 right-6 z-[1000] toast-box">
             <div className={`${saveStatus.type === 'success' ? 'bg-green-600 shadow-green-500/20 toast-fade-out' : 'bg-indigo-600 shadow-indigo-500/20'} text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/20`}>
                {saveStatus.type === 'loading' ? <Loader2 size={24} className="animate-spin" /> : <CircleCheck size={24} />}
                <span className="font-black text-xs uppercase tracking-widest">{saveStatus.msg}</span>
             </div>
          </div>
        )}

        {permissionError && (
          <div className="no-print bg-red-600 text-white py-4 px-10 flex items-center justify-between shadow-2xl z-[100] sticky top-0 border-b border-white/20 animate-in slide-in-from-top-full duration-500">
            <div className="flex items-center gap-4">
              <ShieldAlert size={28} className="animate-pulse" />
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Database Permission Denied!</p>
                <p className="text-[10px] font-bold opacity-80">Cloud Sync is disabled. Please update your Firestore Rules in the Firebase Console.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={copyRules} className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all">
                 {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Rules Copied' : 'Copy Rule Code'}
               </button>
               <a href="https://console.firebase.google.com/project/sim-voucher-erp/firestore/rules" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-black transition-all">
                 Open Rules Console <ExternalLink size={14} />
               </a>
            </div>
          </div>
        )}

        <header className="no-print h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 shadow-sm z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl text-indigo-600">{menuItems.find(m => m.id === currentView)?.icon || <Layers size={22} />}</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{menuItems.find(m => m.id === currentView)?.label || 'Document'}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-1">SIM Group ERP Systems</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />} {isOnline ? 'Cloud Synced' : 'Permission Error'}
            </div>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-4 group p-1.5 pr-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 shadow-sm">
                <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl object-cover" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name}</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-md mt-1">{user.role}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-3 z-[100] animate-in fade-in slide-in-from-top-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-black text-xs uppercase tracking-widest"><LogOut size={18} /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className={`flex-grow flex flex-col ${currentView === 'DASHBOARD' ? 'p-0' : isListView ? 'p-6 md:p-10' : 'p-6 md:p-12 items-center'}`}>{renderContent()}</div>
        <footer className="no-print py-4 px-10 bg-white border-t border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <RefreshCw size={12} className={isOnline ? "animate-spin text-indigo-500" : "text-red-500"} /> 
             System Status: <span className={isOnline ? "text-green-500" : "text-red-500"}>{isOnline ? "Cloud Synchronized" : "Sync Error (Check Permissions)"}</span>
           </div>
           <div>© 2025 SIM Group - All Rights Reserved</div>
        </footer>
      </main>

      {permissionError && (
        <div className="no-print bg-slate-900/95 backdrop-blur-xl fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 flex flex-col items-center text-center overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
                <ServerCrash size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4 italic">ফায়ারবেস রুলস আপডেট করুন</h2>
              <p className="text-slate-500 font-bold leading-relaxed mb-8">
                আপনার ডাটাবেসে ডাটা সেভ করার অনুমতি নেই। এটি ঠিক করতে নিচের কোডটি কপি করে <br/> 
                আপনার ফায়ারবেস কনসোলের <b>Rules</b> ট্যাবে পেস্ট করে <b>Publish</b> করুন।
              </p>
              
              <div className="w-full bg-slate-950 rounded-2xl p-6 mb-8 text-left relative">
                 <div className="flex items-center gap-2 mb-3 text-indigo-500">
                    <Terminal size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Copy this Code</span>
                 </div>
                 <pre className="text-indigo-400 text-[11px] font-mono leading-relaxed overflow-x-auto h-24 select-all">
                    {ruleCode}
                 </pre>
                 <button onClick={copyRules} className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase transition-all">
                   {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                 </button>
              </div>

              <div className="flex flex-col w-full gap-3">
                 <a href="https://console.firebase.google.com/project/sim-voucher-erp/firestore/rules" target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                   সরাসরি Rules পেজ ওপেন করুন <ExternalLink size={18} />
                 </a>
                 <button onClick={() => setPermissionError(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all">
                   I understand, let me explore first
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
