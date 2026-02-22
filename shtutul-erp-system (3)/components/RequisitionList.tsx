
import React, { useState } from 'react';
import { RequisitionData } from '../types';
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
  Globe,
  Eye,
  Trash2,
  CheckCircle,
  List
} from 'lucide-react';

interface RequisitionListProps {
  requisitions: RequisitionData[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'Pending' | 'Approved') => void;
  onAdd: () => void;
  onEdit: (req: RequisitionData) => void;
  onView: (req: RequisitionData) => void;
  onPreview: (req: RequisitionData) => void;
  onViewChange: (view: ViewType) => void;
}

export const RequisitionList: React.FC<RequisitionListProps> = ({ 
  requisitions, 
  onDelete,
  onUpdateStatus,
  onAdd, 
  onEdit,
  onView,
  onPreview,
  onViewChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedReq = requisitions.find(r => r.id === selectedId);

  const handleDelete = (id?: string) => {
    const targetId = id || selectedId;
    if (targetId && confirm('Are you sure you want to delete this requisition?')) {
      onDelete(targetId);
      if (targetId === selectedId) setSelectedId(null);
    } else if (!targetId) {
      alert("Please select a record first.");
    }
  };

  const handleApprove = async (id?: string) => {
    const targetId = id || selectedId;
    if (targetId) {
      setIsSaving(true);
      onUpdateStatus(targetId, 'Approved');
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
      onUpdateStatus(selectedId, 'Pending');
    } else {
      alert("Please select a record first.");
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedId(id);
  };

  const filtered = requisitions.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      r.requisitionNo.toLowerCase().includes(term) ||
      r.nameOfPayee.toLowerCase().includes(term) ||
      r.purpose.toLowerCase().includes(term);

    if (term !== '') {
      return matchesSearch;
    }
    return (r.status === 'Pending' || !r.status);
  });

  const totalAmount = filtered.reduce((sum, req) => sum + (req.amountTk || 0), 0);

  // Check if preview is allowed
  const isPreviewDisabled = !selectedReq || selectedReq.status !== 'Approved';

  return (
    <div className="w-full flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* ERP Style Toolbar */}
      <div className="no-print bg-[#F3F3F3] border-b border-gray-300 p-1 flex items-center flex-wrap gap-x-1">
        
        {/* Search Field */}
        <div className="flex items-center border border-gray-400 bg-white px-2 py-0.5 mr-2 ml-1">
          <Search size={14} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search Requisitions..." 
            className="outline-none text-[13px] w-48 text-gray-700 placeholder:text-gray-400 py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={onAdd}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#003366] font-medium text-[13px] border-r border-gray-300 transition-colors"
        >
          <SquarePlus size={20} className="text-green-600" /> <span>Add</span>
        </button>

        <button 
          onClick={() => selectedReq && onEdit(selectedReq)}
          disabled={!selectedReq}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${selectedReq ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <Pencil size={20} className={selectedReq ? "text-[#4CAF50]" : "text-gray-300"} /> <span>Edit</span>
        </button>

        <button 
          onClick={() => selectedReq && onView(selectedReq)}
          disabled={!selectedReq}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${selectedReq ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <Layout size={20} className={selectedReq ? "text-[#2196F3]" : "text-gray-300"} /> <span>View</span>
        </button>

        <button 
          onClick={() => handleDelete()}
          disabled={!selectedReq}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${selectedReq ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <MinusSquare size={20} className={selectedReq ? "text-green-700" : "text-gray-300"} /> <span>Delete</span>
        </button>

        <button 
          onClick={() => handleApprove()}
          disabled={!selectedReq || selectedReq.status === 'Approved' || isSaving}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${(selectedReq && selectedReq.status !== 'Approved' && !isSaving) ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin text-purple-600" /> : <Check size={20} className={(selectedReq && selectedReq.status !== 'Approved') ? "text-green-600" : "text-gray-300"} strokeWidth={3} />} 
          <span>Approve</span>
        </button>

        <button 
          onClick={handleUndoApprove}
          disabled={!selectedReq || selectedReq.status !== 'Approved' || isSaving}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${(selectedReq && selectedReq.status === 'Approved' && !isSaving) ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
        >
          <RotateCcw size={20} className={(selectedReq && selectedReq.status === 'Approved') ? "text-amber-600" : "text-gray-300"} /> 
          <span>Undo Approve</span>
        </button>

        <button 
          onClick={() => selectedReq && onPreview(selectedReq)}
          disabled={isPreviewDisabled}
          className={`flex items-center gap-1.5 px-2 py-1.5 font-medium text-[13px] border-r border-gray-300 transition-colors ${!isPreviewDisabled ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
          title={isPreviewDisabled ? "Only approved requisitions can be previewed" : "Preview and Print"}
        >
          <Printer size={20} className={!isPreviewDisabled ? "text-[#2196F3]" : "text-gray-300"} /> <span>Preview</span>
        </button>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 text-[#003366] font-medium text-[13px] transition-colors"
        >
          <Printer size={20} className="text-gray-600" /> <span>Print List</span>
        </button>
      </div>

      {/* Global Status Banner */}
      {searchTerm.trim() !== '' && (
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-1.5 flex items-center gap-2">
          <Globe size={12} className="text-purple-600" />
          <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Global Search Active (Approved & Pending)</span>
        </div>
      )}

      {/* Main Standard List View */}
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[12px] uppercase tracking-widest">
              <th className="px-6 py-4 text-center w-16">SL</th>
              <th className="px-6 py-4">Ref Number</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Payee Name</th>
              <th className="px-6 py-4 text-right">Amount (Tk)</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center w-40 no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? filtered.map((req, idx) => (
              <tr 
                key={req.id} 
                onClick={() => !isSaving && handleRowClick(req.id)}
                className={`group cursor-pointer transition-all ${
                  selectedId === req.id 
                    ? 'bg-blue-50' 
                    : isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
                <td className="px-6 py-4">
                  <span className={`font-black text-sm ${selectedId === req.id ? 'text-blue-700' : 'text-slate-900'}`}>
                    {req.requisitionNo}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">{req.date}</td>
                <td className="px-6 py-4 font-bold text-sm truncate max-w-[200px]">{req.nameOfPayee}</td>
                <td className="px-6 py-4 text-right font-black text-base tabular-nums text-slate-900">
                  <span className="text-slate-400 text-xs mr-1 font-bold">৳</span>
                  {req.amountTk.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'Approved' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      {req.status || 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 no-print">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onView(req); }}
                      className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(req); }}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-all"
                      title="Edit Record"
                    >
                      <Pencil size={18} />
                    </button>
                    {req.status !== 'Approved' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-all"
                        title="Approve Requisition"
                        disabled={isSaving}
                      >
                        {isSaving && selectedId === req.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedId(req.id); handleUndoApprove(); }}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all"
                        title="Undo Approval"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                      title="Delete Record"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
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
                      {searchTerm.trim() !== '' ? 'No matching records found in the database.' : 'Excellent! All pending requisitions have been processed.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Summary Footer */}
      <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Item</span>
            <span className="text-white font-bold">{selectedReq ? selectedReq.requisitionNo : 'None Selected'}</span>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {searchTerm.trim() !== '' ? 'Total Search Results' : 'Total Pending Count'}
            </span>
            <span className="text-white font-bold">{filtered.length} Requisitions</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Total Displayed Amount</span>
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-xl font-bold opacity-50 italic">৳</span>
            <span className="text-4xl font-black tabular-nums tracking-tighter">
              {totalAmount.toLocaleString()}
            </span>
            <span className="text-sm font-bold opacity-50 uppercase">BDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon component for consistent styling
const RotateCcw = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
