
import React, { useState } from 'react';
import { CompanySettings, ViewType } from '../types';
import { 
  Settings as SettingsIcon, 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  CheckCircle
} from 'lucide-react';

interface SettingsProps {
  onViewChange: (view: ViewType) => void;
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ onViewChange, settings, onSave }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("সেটিংস সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <SettingsIcon className="text-blue-600" /> System Settings
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Customize your ERP experience</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Building size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Company Profile</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Update your business identity</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Building size={14} className="text-blue-500" /> Company Name
              </label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
                required
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={14} className="text-blue-500" /> Logo URL
              </label>
              <input 
                type="text" 
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium italic ml-1">* Use /logo.png if you put the logo in the public folder, or use a full URL.</p>
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-blue-500" /> Office Address
              </label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all resize-none"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Phone size={14} className="text-blue-500" /> Contact Phone
              </label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={14} className="text-blue-500" /> Business Email
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Globe size={14} className="text-blue-500" /> Website URL
              </label>
              <input 
                type="text" 
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-12 pt-12 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Logo Preview</h3>
            <div className="flex items-center justify-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              {formData.logoUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={formData.logoUrl} 
                    alt="Preview" 
                    className="max-h-32 object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                    }}
                  />
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle size={12} /> Logo Loaded Successfully
                  </span>
                </div>
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-2">
                  <ImageIcon size={48} />
                  <span className="text-xs font-bold uppercase tracking-widest">No Logo URL Provided</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-10 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-white transition-all shadow-2xl active:scale-95 uppercase text-sm tracking-widest ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
            >
              {isSaving ? 'Saving...' : <><Save size={20} /> Save Settings</>}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center gap-3 z-50">
          <CheckCircle size={20} /> Settings Updated Successfully!
        </div>
      )}
    </div>
  );
};
