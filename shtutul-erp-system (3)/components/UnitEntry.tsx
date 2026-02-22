
import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../App';
import { UnitRecord } from '../types';
import { 
  Plus, 
  Pencil, 
  MinusSquare, 
  Printer, 
  FileSearch,
  List,
  Layers,
  X,
  Eye,
  Save,
  Layout,
  Search
} from 'lucide-react';

interface UnitEntryProps {
  onViewChange: (view: ViewType) => void;
  units: UnitRecord[];
  onUpdateUnits: (units: UnitRecord[]) => void;
}

export const UnitEntry: React.FC<UnitEntryProps> = ({ onViewChange, units, onUpdateUnits }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddModalOpen) {
      modalInputRef.current?.focus();
    }
  }, [isAddModalOpen]);

  const handleOpenAddModal = () => {
    setNewUnitName('');
    setIsAddModalOpen(true);
  };

  const handleModalSave = () => {
    if (!newUnitName.trim()) {
      alert("Please enter a unit name.");
      return;
    }
    const nextSl = units.length > 0 ? Math.max(...units.map(u => u.sl)) + 1 : 1;
    const newId = Math.random().toString(36).substr(2, 9);
    onUpdateUnits([...units, { id: newId, sl: nextSl, name: newUnitName.trim() }]);
    setSelectedId(newId);
    setIsAddModalOpen(false);
  };

  const handleNameChange = (id: string, value: string) => {
    onUpdateUnits(units.map(u => u.id === id ? { ...u, name: value } : u));
  };

  const handleViewRow = () => {
    if (selectedId) {
      const unit = units.find(u => u.id === selectedId);
      alert(`Unit Details:\n\nSL: ${unit?.sl}\nName: ${unit?.name}`);
    } else {
      alert("Please select a record first.");
    }
  };

  const handleDeleteRow = () => {
    if (selectedId && window.confirm("Are you sure you want to delete this Unit?")) {
      const updated = units.filter(u => u.id !== selectedId);
      const reindexed = updated.map((item, i) => ({ ...item, sl: i + 1 }));
      onUpdateUnits(reindexed);
      setSelectedId(null);
    } else if (!selectedId) {
      alert("Please select a record first.");
    }
  };

  const handleEditRow = () => {
    if (selectedId) {
      inputRefs.current[selectedId]?.focus();
    } else {
      alert("Please select a record first.");
    }
  };

  const handleSaveAll = () => {
    alert("Unit information saved successfully!");
  };

  const filtered = units.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative animate-in fade-in duration-500">
      
      {/* Modern Standard Toolbar */}
      <div className="no-print bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter units..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm w-64 shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenAddModal} 
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 font-bold text-sm active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Add New Unit
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={handleEditRow}
              disabled={!selectedId}
              title="Edit Name"
              className={`p-2 rounded-lg transition-all ${selectedId ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300'}`}
            >
              <Pencil size={18} />
            </button>
            <button 
              onClick={handleViewRow}
              disabled={!selectedId}
              title="View Details"
              className={`p-2 rounded-lg transition-all ${selectedId ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-300'}`}
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={handleDeleteRow}
              disabled={!selectedId}
              title="Delete Unit"
              className={`p-2 rounded-lg transition-all ${selectedId ? 'text-red-600 hover:bg-red-50' : 'text-slate-300'}`}
            >
              <MinusSquare size={18} />
            </button>
          </div>

          <button 
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
          >
            <Save size={18} className="text-green-600" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Main Standard List View */}
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[12px] uppercase tracking-widest">
              <th className="px-6 py-4 text-center w-20">SL</th>
              <th className="px-6 py-4">Configuration Name (Unit)</th>
              <th className="px-6 py-4 text-center w-24 no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? filtered.map((record) => (
              <tr 
                key={record.id} 
                onClick={() => setSelectedId(record.id)}
                className={`group cursor-pointer transition-all ${
                  selectedId === record.id 
                    ? 'bg-purple-50' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <td className="px-6 py-4 text-center font-black text-slate-400 text-xs">{(record.sl).toString().padStart(2, '0')}</td>
                <td className="px-6 py-2">
                  <input 
                    ref={el => { inputRefs.current[record.id] = el; }}
                    type="text" 
                    value={record.name}
                    onChange={(e) => handleNameChange(record.id, e.target.value)}
                    className="w-full bg-transparent outline-none font-black uppercase text-slate-900 focus:text-purple-700 py-2 border-b-2 border-transparent focus:border-purple-200 transition-all placeholder:text-slate-300"
                    placeholder="UNIT NAME..."
                  />
                </td>
                <td className="px-6 py-4 text-center no-print">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(record.id); handleEditRow(); }}
                      className={`transition-colors ${selectedId === record.id ? 'text-purple-600' : 'text-slate-300 group-hover:text-blue-500'}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(record.id); handleDeleteRow(); }}
                      className={`transition-colors ${selectedId === record.id ? 'text-purple-600' : 'text-slate-300 group-hover:text-red-500'}`}
                    >
                      <MinusSquare size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Layers className="text-slate-300" size={32} />
                    </div>
                    <div className="text-slate-400 font-bold">No units configured yet.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modern Status Footer */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>Active Units: {filtered.length}</span>
          <div className="h-4 w-px bg-slate-700"></div>
          <span>Selection: {selectedId ? units.find(u => u.id === selectedId)?.name : 'None'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-slate-300">System Synced</span>
        </div>
      </div>

      {/* Modern Modal Component */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <Plus size={18} className="text-green-500" /> New Unit Entry
                </h3>
                <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">SHTUTUL ERP System</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Configuration Name</label>
                  <div className="relative">
                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      ref={modalInputRef}
                      type="text" 
                      placeholder="E.G. UNIT-04"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition-all uppercase placeholder:text-slate-300 text-lg shadow-inner"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs uppercase"
                >
                  Discard
                </button>
                <button 
                  onClick={handleModalSave}
                  className="flex-2 px-8 py-4 rounded-2xl bg-purple-600 font-black text-white hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 text-xs uppercase flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={18} /> Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
