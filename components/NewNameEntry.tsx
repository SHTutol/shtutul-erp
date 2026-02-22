import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../App';
import { PayeeRecord } from '../types';
import { 
  Plus, 
  Pencil, 
  FileText, 
  MinusSquare, 
  Check, 
  Printer, 
  FileSearch,
  List,
  Search,
  ChevronDown,
  Save,
  User,
  X,
  UserPlus
} from 'lucide-react';

interface NewNameEntryProps {
  onViewChange: (view: ViewType) => void;
  payees: PayeeRecord[];
  onUpdatePayees: (payees: PayeeRecord[]) => void;
}

export const NewNameEntry: React.FC<NewNameEntryProps> = ({ onViewChange, payees, onUpdatePayees }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newParticulars, setNewParticulars] = useState('');
  
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Focus modal input on open
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  const handleOpenAddModal = () => {
    setNewPayeeName('');
    setNewParticulars('');
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    if (!newPayeeName.trim()) {
      alert("Please enter a payee name.");
      return;
    }
    
    const nextSl = payees.length > 0 ? Math.max(...payees.map(n => n.sl)) + 1 : 1;
    const newId = Math.random().toString(36).substr(2, 9);
    
    const newRecord: PayeeRecord = {
      id: newId,
      sl: nextSl,
      name: newPayeeName.trim(),
      phone: '', // Phone can be edited in the table later
      particulars: newParticulars.trim()
    };
    
    onUpdatePayees([...payees, newRecord]);
    setSelectedId(newId);
    setIsModalOpen(false);
    setNewPayeeName('');
    setNewParticulars('');
  };

  const handleNameChange = (id: string, value: string) => {
    onUpdatePayees(payees.map(n => n.id === id ? { ...n, name: value } : n));
  };

  const handlePhoneChange = (id: string, value: string) => {
    onUpdatePayees(payees.map(n => n.id === id ? { ...n, phone: value } : n));
  };

  const handleParticularsChange = (id: string, value: string) => {
    onUpdatePayees(payees.map(n => n.id === id ? { ...n, particulars: value } : n));
  };

  const handleDeleteRow = () => {
    if (selectedId && window.confirm("Are you sure you want to delete this person?")) {
      const updated = payees.filter(n => n.id !== selectedId);
      const reindexed = updated.map((item, i) => ({ ...item, sl: i + 1 }));
      onUpdatePayees(reindexed);
      setSelectedId(null);
    } else if (!selectedId) {
      alert("Please select a record first.");
    }
  };

  const handleEditRow = () => {
    if (selectedId) {
      nameInputRefs.current[selectedId]?.focus();
    } else {
      alert("Please select a record first.");
    }
  };

  const handleSaveToDB = () => {
    alert("Payee names saved successfully to the system database.");
  };

  const filtered = payees.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1200px] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* ERP Toolbar Style */}
      <div className="no-print bg-[#F3F3F3] border-b border-gray-300 p-1 flex items-center flex-wrap gap-x-1">
        <div className="flex items-center border border-gray-400 bg-white px-2 py-0.5 mr-2">
          <input 
            type="text" 
            placeholder="Search Names..." 
            className="outline-none text-sm w-48 text-gray-700 placeholder:text-gray-400 py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#444] font-medium text-[13px] border-r border-gray-300">
          <FileSearch size={16} className="text-blue-500" /> Adv. Search
        </button>
        
        <button onClick={handleOpenAddModal} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#444] font-medium text-[13px] border-r border-gray-300 transition-colors">
          <Plus size={16} className="text-green-600 font-bold" strokeWidth={3} /> Add
        </button>

        <button 
          onClick={handleEditRow}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${selectedId ? 'hover:bg-gray-200 text-[#444]' : 'text-gray-400 cursor-not-allowed opacity-50'}`}
        >
          <Pencil size={16} className={selectedId ? "text-green-600" : "text-gray-300"} /> Edit
        </button>

        <button 
          onClick={handleDeleteRow}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${selectedId ? 'hover:bg-gray-200 text-[#444]' : 'text-gray-400 cursor-not-allowed opacity-50'}`}
        >
          <MinusSquare size={16} className={selectedId ? "text-green-700" : "text-gray-300"} /> Delete
        </button>

        <button 
          onClick={handleSaveToDB}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#444] font-medium text-[13px] border-r border-gray-300 transition-colors"
        >
          <Save size={16} className="text-green-600" /> Save
        </button>

        <button className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 opacity-50 cursor-not-allowed`}>
          <Check size={16} className="text-gray-300" strokeWidth={3} /> Approve
        </button>

        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#444] font-medium text-[13px] border-r border-gray-300">
          <Printer size={16} className="text-blue-500" /> Preview
        </button>

        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#444] font-medium text-[13px]">
          <List size={16} className="text-gray-600" /> Print List
        </button>
      </div>

      {/* Main Table View */}
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EFEFEF] border-b border-gray-300 text-[#333] font-bold text-[12px] uppercase tracking-wide">
              <th className="px-4 py-2 border-r border-gray-300 text-center w-12">SL</th>
              <th className="px-4 py-2 border-r border-gray-300">Person Name</th>
              <th className="px-4 py-2 border-r border-gray-300">Phone Number</th>
              <th className="px-4 py-2 text-left">Default Particulars (For)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr 
                key={record.id} 
                onClick={() => setSelectedId(record.id)}
                className={`cursor-pointer transition-colors text-[14px] ${
                  selectedId === record.id ? 'bg-[#3399FF] text-white' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                <td className="px-4 py-2 text-center border-r border-gray-200 font-bold">{record.sl}</td>
                <td className="px-4 py-1 border-r border-gray-200">
                  <input 
                    ref={el => { nameInputRefs.current[record.id] = el; }}
                    type="text" 
                    value={record.name}
                    onChange={(e) => handleNameChange(record.id, e.target.value)}
                    className="w-full bg-transparent outline-none font-bold uppercase placeholder:text-gray-300"
                    placeholder="ENTER NAME..."
                  />
                </td>
                <td className="px-4 py-1 border-r border-gray-200">
                  <input 
                    type="text" 
                    value={record.phone}
                    onChange={(e) => handlePhoneChange(record.id, e.target.value)}
                    className="w-full bg-transparent outline-none font-medium placeholder:text-gray-300"
                    placeholder="ENTER PHONE..."
                  />
                </td>
                <td className="px-4 py-1">
                  <input 
                    type="text" 
                    value={record.particulars || ''}
                    onChange={(e) => handleParticularsChange(record.id, e.target.value)}
                    className="w-full bg-transparent outline-none font-medium placeholder:text-gray-300 italic"
                    placeholder="ENTER DEFAULT PARTICULARS..."
                  />
                </td>
              </tr>
            ))}
            {/* Filler rows */}
            {Array.from({ length: Math.max(0, 15 - filtered.length) }).map((_, i) => (
              <tr key={`filler-${i}`} className="h-9">
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Info */}
      <div className="bg-[#F3F3F3] border-t border-gray-300 p-2 flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase">
        <span>Total Names: {filtered.length}</span>
        <span>Selected: {selectedId ? payees.find(n => n.id === selectedId)?.name : 'None'}</span>
      </div>

      {/* Add Payee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <UserPlus size={18} className="text-green-500" /> Add New Payee
                </h3>
                <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">SHTUTUL ERP System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name of Payee</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      ref={modalInputRef}
                      type="text" 
                      placeholder="ENTER FULL NAME..."
                      value={newPayeeName}
                      onChange={(e) => setNewPayeeName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-green-600 focus:bg-white transition-all uppercase placeholder:text-slate-300 text-lg shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Particulars (For)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="ENTER DEFAULT PARTICULARS..."
                      value={newParticulars}
                      onChange={(e) => setNewParticulars(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-green-600 focus:bg-white transition-all uppercase placeholder:text-slate-300 text-lg shadow-inner"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs uppercase"
                >
                  Discard
                </button>
                <button 
                  onClick={handleModalSave}
                  className="flex-2 px-8 py-4 rounded-2xl bg-green-600 font-black text-white hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 text-xs uppercase flex items-center justify-center gap-2 active:scale-95"
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
