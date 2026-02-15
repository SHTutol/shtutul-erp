
// Add missing React import to fix 'Cannot find namespace React' error when using React.FC
import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../App';
import { User } from '../types';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Search, 
  X, 
  Save, 
  Key,
  ShieldCheck,
  Check,
  Lock,
  Download,
  Upload,
  Database,
  Cloud,
  RefreshCw
} from 'lucide-react';

interface UserManagementProps {
  onViewChange: (view: ViewType) => void;
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

const PERMISSION_OPTIONS = [
  { id: 'DASHBOARD', label: 'Dashboard' },
  { id: 'REQ_LIST', label: 'Requisition List' },
  { id: 'DV_LIST', label: 'Debit Voucher List' },
  { id: 'REQ_REPORT', label: 'Req Report' },
  { id: 'DV_REPORT', label: 'DV Report' },
  { id: 'NEW_NAME', label: 'Payee Names' },
  { id: 'NEW_SISTER', label: 'Sister Concerns' },
  { id: 'UNIT_ENTRY', label: 'Unit Entry' },
  { id: 'USER_MANAGEMENT', label: 'User Management' },
];

export const UserManagement: React.FC<UserManagementProps> = ({ onViewChange, users, onUpdateUsers }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Staff',
    permissions: ['DASHBOARD'] as string[]
  });

  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      modalInputRef.current?.focus();
    }
  }, [isModalOpen]);

  const handleExportData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `SIM_ERP_USERS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', password: '', role: 'Staff', permissions: ['DASHBOARD'] });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    const user = users.find(u => u.id === selectedId);
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        password: user.password || '',
        role: user.role,
        permissions: user.permissions || ['DASHBOARD']
      });
      setIsModalOpen(true);
    }
  };

  const handleTogglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.username || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingUser) {
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData } 
          : u
      );
      onUpdateUsers(updatedUsers);
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        lastLogin: 'Never'
      };
      onUpdateUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = () => {
    if (selectedId) {
      if (selectedId === '1' || users.find(u => u.id === selectedId)?.username === 'admin') {
        alert("Primary administrator cannot be deleted.");
        return;
      }
      if (confirm("Are you sure you want to remove this user's system access?")) {
        onUpdateUsers(users.filter(u => u.id !== selectedId));
        setSelectedId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1200px] flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Cloud Database Status Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Cloud size={24} />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Google Cloud Database Active
            </h4>
            <p className="text-[11px] text-indigo-700 font-bold mt-1">All user profiles and permissions are securely synced with the SIM Group cloud infrastructure.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportData}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-700 font-black text-[10px] uppercase rounded-xl hover:bg-indigo-50 transition-all"
          >
            <Download size={14} /> Export User List
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
        <div className="no-print bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm w-64 shadow-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenAddModal} 
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Create User
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <button 
              onClick={handleOpenEditModal}
              disabled={!selectedId}
              className={`p-2.5 rounded-xl transition-all border ${selectedId ? 'border-slate-200 text-indigo-600 hover:bg-slate-50' : 'border-slate-100 text-slate-300'}`}
            >
              <Pencil size={20} />
            </button>

            <button 
              onClick={handleDeleteUser}
              disabled={!selectedId}
              className={`p-2.5 rounded-xl transition-all border ${selectedId ? 'border-slate-200 text-red-600 hover:bg-red-50' : 'border-slate-100 text-slate-300'}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-widest sticky top-0 z-10">
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Modules Access</th>
                <th className="px-6 py-4 text-center">Cloud Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedId(u.id)}
                  className={`group cursor-pointer transition-all ${
                    selectedId === u.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${selectedId === u.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {selectedId === u.id && <Check size={10} className="text-white" strokeWidth={4} />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm uppercase">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-600 text-sm italic">{u.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'System Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Shield size={10} /> {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                        {u.permissions.slice(0, 3).map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase">{p.replace('_', ' ')}</span>
                        ))}
                        {u.permissions.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{u.permissions.length - 3} more</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900 p-4 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <span>Total Managed Accounts: {users.length}</span>
          <div className="flex items-center gap-2">
            <Database size={14} className="text-indigo-400" />
            <span>Encrypted Sync Active</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <UserIcon size={18} className="text-indigo-400" /> {editingUser ? 'Update Profile' : 'New Cloud Access'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">SHTUTUL ERP Security</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      ref={modalInputRef}
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="E.G. JOHN DOE"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all uppercase text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="user.one"
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role / Access</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs uppercase"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Auditor">Auditor</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Lock size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Access Permissions</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PERMISSION_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent has-[:checked]:border-indigo-200 has-[:checked]:bg-indigo-50/50">
                      <input 
                        type="checkbox" 
                        checked={formData.permissions.includes(opt.id)}
                        onChange={() => handleTogglePermission(opt.id)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] font-bold text-slate-700 uppercase">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs uppercase"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveUser}
                  className="flex-2 px-8 py-4 rounded-2xl bg-indigo-600 font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 text-xs uppercase flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={18} /> Save to Cloud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
