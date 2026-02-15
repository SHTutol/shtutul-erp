import React, { useState } from 'react';
import { DebitVoucherData } from '../types';
import { ViewType } from '../App';
import { 
  SquarePlus, 
  Pencil, 
  Layout, 
  MinusSquare, 
  Check, 
  Printer, 
  Search,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  List,
  RotateCcw,
  FileSearch,
  Globe
} from 'lucide-react';

interface DebitVoucherListProps {
  vouchers: DebitVoucherData[];
  setVouchers: React.Dispatch<React.SetStateAction<DebitVoucherData[]>>;
  onAdd: () => void;
  onEdit: (dv: DebitVoucherData) => void;
  onView: (dv: DebitVoucherData) => void;
  onPreview: (dv: DebitVoucherData) => void;
  onViewChange: (view: ViewType) => void;
}

export const DebitVoucherList: React.FC<DebitVoucherListProps> = ({ 
  vouchers, 
  setVouchers, 
  onAdd, 
  onEdit,
  onView,
  onPreview,
  onViewChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedDV = vouchers.find(v => v.id === selectedId);

  const handleDelete = (id?: string) => {
    const targetId = id || selectedId;
    if (targetId && confirm('Are you sure you want to delete this debit voucher?')) {
      setVouchers(prev => prev.filter(v => v.id !== targetId));
      if (targetId === selectedId) setSelectedId(null);
    } else if (!targetId) {
      alert("Please select a record first.");
    }
  };

  const handleApprove = async (id?: string) => {
    const targetId = id || selectedId;
    if (targetId) {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setVouchers(prev => prev.map(v => v.id === targetId ? { ...v, status: 'Approved' } : v));
      
      // Clear selection if the approved item disappears from the default view
      if (searchTerm.trim() === '' && targetId === selectedId) {
        setSelectedId(null);
      }
      
      setIsSaving(false);
    } else {
      alert("Please select a record first.");
    }
  };

  const handleUndoApprove = () => {
    if (selectedId) {
      setVouchers(prev => prev.map(v => v.id === selectedId ? { ...v, status: 'Pending' } : v));
    } else {
      alert("Please select a record first.");
    }
  };

  const filtered = vouchers.filter(v => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = v.no.toLowerCase().includes(term) ||
                          v.paidTo.toLowerCase().includes(term) ||
                          v.for.toLowerCase().includes(term);
    
    // If searching, show all matching records (Global Search)
    if (term !== '') {
      return matchesSearch;
    }
    // Otherwise, show only pending items (Default worklist)
    return (v.status === 'Pending' || !v.status);
  });

  const totalAmount = filtered.reduce((sum, v) => sum + (v.amountTk || 0), 0);

  return (
    <div className="w-full flex-grow flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* ERP Style Toolbar */}
      <div className="no-print bg-[#F3F3F3] border-b border-gray-300 p-1.5 flex items-center flex-wrap gap-x-1">
        
        <div className="flex items-center border border-gray-400 bg-white px-2 py-0.5 mr-2 ml-1 rounded-sm shadow-inner">
          <Search size={14} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search Vouchers..." 
            className="outline-none text-[13px] w-40 text-gray-700 placeholder:text-gray-400 py-1 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 text-[#003366] font-semibold text-[13px] border-r border-gray-300 transition-colors">
          <FileSearch size={18} className="text-blue-500" /> <span>Adv. Search</span>
        </button>

        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 text-[#003366] font-semibold text-[13px] border-r border-gray-300 transition-colors">
          <SquarePlus size={20} className="text-green-600" /> <span>Add</span>
        </button>

        <button 
          onClick={() => selectedDV && onEdit(selectedDV)}
          disabled={!selectedDV}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedDV ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <Pencil size={20} className={selectedDV ? "text-green-600" : "text-gray-300"} /> <span>Edit</span>
        </button>

        <button 
          onClick={() => selectedDV && onView(selectedDV)}
          disabled={!selectedDV}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedDV ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <Layout size={20} className={selectedDV ? "text-[#2196F3]" : "text-gray-300"} /> <span>View</span>
        </button>

        <button 
          onClick={() => handleDelete()}
          disabled={!selectedId}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedId ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <MinusSquare size={20} className={selectedId ? "text-green-700" : "text-gray-300"} /> <span>Delete</span>
        </button>

        <button 
          onClick={() => handleApprove()}
          disabled={!selectedDV || selectedDV.status === 'Approved' || isSaving}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${(selectedDV && selectedDV.status !== 'Approved' && !isSaving) ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin text-purple-600" /> : <Check size={22} className={(selectedDV && selectedDV.status !== 'Approved') ? "text-green-600" : "text-gray-300"} strokeWidth={3} />} 
          <span>Approve</span>
        </button>

        <button 
          onClick={handleUndoApprove}
          disabled={!selectedDV || selectedDV.status !== 'Approved' || isSaving}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${(selectedDV && selectedDV.status === 'Approved' && !isSaving) ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <RotateCcw size={20} className={(selectedDV && selectedDV.status === 'Approved') ? "text-amber-600" : "text-gray-300"} /> 
          <span>Undo Approve</span>
        </button>

        <button 
          onClick={() => selectedDV && onPreview(selectedDV)}
          disabled={!selectedDV}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedDV ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <Printer size={20} className={selectedDV ? "text-[#2196F3]" : "text-gray-300"} /> <span>Preview</span>
        </button>

        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 text-[#003366] font-semibold text-[13px] transition-colors">
          <Printer size={20} className="text-gray-600" /> <span>Print List</span>
        </button>
      </div>

      {/* Global Status Banner */}
      {searchTerm.trim() !== '' && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center gap-2">
          <Globe size={14} className="text-blue-600 animate-pulse" />
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Global Search Mode: Displaying both Approved & Pending Records</span>
        </div>
      )}

      <div className="overflow-auto flex-grow max-h-[60vh]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[12px] uppercase tracking-widest sticky top-0 z-10">
              <th className="px-6 py-4 text-center w-16">SL</th>
              <th className="px-6 py-4">Ref Number</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Payee Name</th>
              <th className="px-6 py-4">Description (For)</th>
              <th className="px-6 py-4 text-right">Amount (Tk)</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? filtered.map((dv, idx) => (
              <tr 
                key={dv.id} 
                onClick={() => !isSaving && setSelectedId(dv.id)}
                className={`group cursor-pointer transition-all ${
                  selectedId === dv.id 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
                <td className="px-6 py-4 font-black text-sm text-slate-900">{dv.no}</td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">{dv.date}</td>
                <td className="px-6 py-4 font-bold text-sm">{dv.paidTo}</td>
                <td className="px-6 py-4 text-slate-500 text-xs italic truncate max-w-[200px]">{dv.for}</td>
                <td className="px-6 py-4 text-right font-black text-base tabular-nums">৳ {dv.amountTk.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    dv.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {dv.status || 'Pending'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <List size={32} />
                    </div>
                    <div className="text-slate-400 font-bold italic">
                      {searchTerm.trim() !== '' ? 'No matching records found.' : 'No pending vouchers in the queue.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#0b1424] px-10 py-6 flex items-center justify-between no-print border-t border-slate-800 shadow-2xl relative z-20">
        <div className="flex items-center gap-14 text-white">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Selected Record</span>
            <span className={`font-bold text-base ${selectedDV ? 'text-white' : 'text-slate-600'}`}>
              {selectedDV ? selectedDV.no : 'None Selected'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue Status</span>
            <span className="font-bold text-base">{filtered.length} Displayed Vouchers</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Net Amount</span>
          <div className="flex items-center gap-4 text-white">
            <span className="text-3xl font-black text-slate-600 italic -mr-1">৳</span>
            <span className="text-6xl font-black tabular-nums tracking-tighter leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
