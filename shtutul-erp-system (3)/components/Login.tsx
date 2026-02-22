
import React, { useState, useEffect } from 'react';
import { Lock, User as UserIcon, LogIn, ShieldCheck, AlertCircle, Eye, EyeOff, Cloud, CloudOff, RefreshCw, Terminal, ServerOff } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR'>('CONNECTING');

  useEffect(() => {
    // Check if we can actually read the users collection
    if (users.length > 0) {
      setDbStatus('CONNECTED');
    } else {
      // Set a longer timeout for Firestore potential initial lag
      const timer = setTimeout(() => {
        if (users.length === 0) setDbStatus('ERROR');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Artificial delay to show processing
    setTimeout(() => {
      // 1. Check cloud users first
      const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

      if (foundUser) {
        onLogin({ ...foundUser, permissions: foundUser.permissions || ['DASHBOARD'] });
      } 
      // 2. Fallback for emergency admin access if Cloud is failing
      else if (username.toLowerCase() === 'admin' && password === '123') {
        onLogin({ 
          id: 'admin', 
          name: 'System Admin (Local)', 
          username: 'admin', 
          role: 'System Admin', 
          permissions: ['DASHBOARD', 'REQ_LIST', 'DV_LIST', 'REQ_REPORT', 'DV_REPORT', 'NEW_NAME', 'NEW_SISTER', 'UNIT_ENTRY', 'USER_MANAGEMENT'],
          avatar: 'https://ui-avatars.com/api/?name=Admin'
        });
      } else {
        if (dbStatus === 'ERROR') {
          setError('Database Access Blocked. Check Firestore Rules or use admin/123.');
        } else {
          setError('Invalid Username or Password. Credentials not found in system.');
        }
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] shadow-2xl mb-8 border border-white/10 ring-8 ring-indigo-500/5">
            <ShieldCheck size={58} className="text-white" />
          </div>
          <h1 className="text-white text-4xl font-black tracking-tighter uppercase italic leading-none">
            SHTutol <span className="text-indigo-400">ERP</span>
          </h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[9px] mt-4 opacity-70">Enterprise Cloud Resource Manager</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          
          {/* Status Badge */}
          <div className="mb-10 flex flex-col items-center gap-2">
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${
              dbStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              dbStatus === 'CONNECTING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {dbStatus === 'CONNECTED' ? <Cloud size={14} /> : dbStatus === 'CONNECTING' ? <RefreshCw size={14} className="animate-spin" /> : <ServerOff size={14} />}
              {dbStatus === 'CONNECTED' ? `System Synced: ${users.length} Users` : dbStatus === 'CONNECTING' ? 'Syncing Cloud Profiles...' : 'Permission Denied! Check Rules'}
            </div>
            {dbStatus === 'ERROR' && (
              <p className="text-[9px] text-red-500/60 font-black uppercase animate-pulse">Rules update required for multi-pc sync</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Access Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/40 focus:bg-white/10 transition-all font-bold text-lg"
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/40 focus:bg-white/10 transition-all font-bold text-lg tracking-[0.3em]"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-bounce-short">
                <AlertCircle className="text-red-500 shrink-0" size={22} />
                <p className="text-red-400 text-[10px] font-black uppercase leading-tight tracking-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-[1.75rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <><LogIn size={20} /> Secure Login To Cloud</>}
            </button>
          </form>
        </div>

        {dbStatus === 'ERROR' && (
          <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Admin Notice</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              If cloud sync is blocked, use <span className="text-amber-400 font-bold uppercase italic">admin / 123</span> to enter local mode and fix the database rules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
