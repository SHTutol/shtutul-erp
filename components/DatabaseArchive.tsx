import React, { useState } from 'react';
import { AuditLog } from '../types';
import { 
  Pencil, 
  Layout, 
  MinusSquare, 
  Search,
  RotateCcw,
  Printer,
  FileSearch
} from 'lucide-react';

interface DatabaseArchiveProps {
  logs: AuditLog[];
  onRestore: (log: AuditLog) => void;
  onDelete: (id: string) => void;
  onView: (log: AuditLog) => void;
  onPreview: (log: AuditLog) => void;
}

export const DatabaseArchive: React.FC<DatabaseArchiveProps> = ({ 
  logs, 
  onRestore, 
  onDelete, 
  onView, 
  onPreview 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [advSearch, setAdvSearch] = useState({ 
    module: '',
    operation: '',
    ref: '', 
    user: '',
    dateMode: 'EQUAL' as 'EQUAL' | 'BETWEEN',
    startDate: '',
    endDate: ''
  });
  const [appliedAdvSearch, setAppliedAdvSearch] = useState({ ...advSearch });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLog = logs.find(log => log.id === selectedId);

  const handleAdvSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAdvSearch({ ...advSearch, [e.target.name]: e.target.value });
  };

  const applyAdvSearch = () => {
    setAppliedAdvSearch({ ...advSearch });
    setIsAdvSearchOpen(false);
  };

  const resetAdvSearch = () => {
    const initial = { 
      module: '',
      operation: '',
      ref: '', 
      user: '',
      dateMode: 'EQUAL' as 'EQUAL' | 'BETWEEN',
      startDate: '',
      endDate: ''
    };
    setAdvSearch(initial);
    setAppliedAdvSearch(initial);
  };

  const filtered = logs.filter(log => {
    const term = searchTerm.toLowerCase().trim();
    const isSearching = term !== '' || appliedAdvSearch.module !== '' || appliedAdvSearch.operation !== '' || appliedAdvSearch.ref !== '' || appliedAdvSearch.user !== '' || appliedAdvSearch.startDate !== '';

    if (!isSearching) return true;

    const matchesSimple = 
      log.module.toLowerCase().includes(term) ||
      log.operation.toLowerCase().includes(term) ||
      log.referenceNo.toLowerCase().includes(term) ||
      log.user.toLowerCase().includes(term);

    const matchesAdv = 
      (!appliedAdvSearch.module || log.module === appliedAdvSearch.module) &&
      (!appliedAdvSearch.operation || log.operation === appliedAdvSearch.operation) &&
      (!appliedAdvSearch.ref || log.referenceNo.toLowerCase().includes(appliedAdvSearch.ref.toLowerCase())) &&
      (!appliedAdvSearch.user || log.user.toLowerCase().includes(appliedAdvSearch.user.toLowerCase()));

    let matchesDate = true;
    if (appliedAdvSearch.startDate) {
      const logDate = new Date(log.timestamp);
      const startInput = appliedAdvSearch.startDate;
      const [year, month, day] = startInput.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      start.setHours(0, 0, 0, 0);

      if (appliedAdvSearch.dateMode === 'EQUAL') {
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        matchesDate = logDate >= start && logDate <= end;
      } else if (appliedAdvSearch.dateMode === 'BETWEEN' && appliedAdvSearch.endDate) {
        const endInput = appliedAdvSearch.endDate;
        const [endYear, endMonth, endDay] = endInput.split('-').map(Number);
        const end = new Date(endYear, endMonth - 1, endDay);
        end.setHours(23, 59, 59, 999);
        matchesDate = logDate >= start && logDate <= end;
      }
    }

    if (term) return matchesSimple;
    return matchesAdv && matchesDate;
  });

  return (
    <div className="w-full flex-grow flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500 h-full">
      {/* Toolbar */}
      <div className="no-print bg-[#F3F3F3] border-b border-gray-300 p-1.5 flex items-center flex-wrap gap-x-1">
        <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden w-full max-w-sm">
          <input 
            type="text"
            placeholder="Search by module, operation, ref, user..."
            className="flex-grow p-2 text-sm outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="text-gray-400 mx-3" />
        </div>

        <button onClick={() => setIsAdvSearchOpen(!isAdvSearchOpen)} className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors hover:bg-gray-200 text-[#003366]">
          <FileSearch size={16} /> Adv. Search
        </button>

        <button disabled={!selectedLog} onClick={() => selectedLog && onRestore(selectedLog)} className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedLog ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}>
          <RotateCcw size={16} /> Restore
        </button>

        <button disabled={!selectedLog} onClick={() => selectedLog && onDelete(selectedLog.id)} className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedLog ? 'hover:bg-red-100 text-red-600' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}>
          <MinusSquare size={16} /> Delete
        </button>

        <button disabled={!selectedLog} onClick={() => selectedLog && onView(selectedLog)} className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedLog ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}>
          <Layout size={16} /> View
        </button>

        <button disabled={!selectedLog} onClick={() => selectedLog && onPreview(selectedLog)} className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] border-r border-gray-300 transition-colors ${selectedLog ? 'hover:bg-gray-200 text-[#003366]' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}>
          <Pencil size={16} /> Preview
        </button>

        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[13px] transition-colors hover:bg-gray-200 text-[#003366]">
          <Printer size={16} /> Print List
        </button>
      </div>

      {/* Advanced Search Panel */}
      {isAdvSearchOpen && (
        <div className="no-print bg-slate-50 border-b border-gray-300 p-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-4 gap-4">
            <select name="module" value={advSearch.module} onChange={handleAdvSearchChange} className="p-2 border rounded">
              <option value="">All Modules</option>
              <option value="Requisition">Requisition</option>
              <option value="Debit Voucher">Debit Voucher</option>
              <option value="Settings">Settings</option>
            </select>
            <select name="operation" value={advSearch.operation} onChange={handleAdvSearchChange} className="p-2 border rounded">
              <option value="">All Operations</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="Approve">Approve</option>
              <option value="Process">Process</option>
              <option value="Restore">Restore</option>
            </select>
            <input type="text" name="ref" placeholder="Reference No." value={advSearch.ref} onChange={handleAdvSearchChange} className="p-2 border rounded" />
            <input type="text" name="user" placeholder="Operate By" value={advSearch.user} onChange={handleAdvSearchChange} className="p-2 border rounded" />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <select name="dateMode" value={advSearch.dateMode} onChange={handleAdvSearchChange} className="p-2 border rounded">
              <option value="EQUAL">Equal</option>
              <option value="BETWEEN">Between</option>
            </select>
            <input type="date" name="startDate" value={advSearch.startDate} onChange={handleAdvSearchChange} className="p-2 border rounded" />
            {advSearch.dateMode === 'BETWEEN' && 
              <input type="date" name="endDate" value={advSearch.endDate} onChange={handleAdvSearchChange} className="p-2 border rounded" />
            }
            <button onClick={applyAdvSearch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Search</button>
            <button onClick={resetAdvSearch} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Reset</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[12px] uppercase tracking-widest sticky top-0 z-10">
              <th className="px-6 py-4">Module Name</th>
              <th className="px-6 py-4">Operation Type</th>
              <th className="px-6 py-4">Reference No</th>
              <th className="px-6 py-4">Operate By</th>
              <th className="px-6 py-4">Operate Date - Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(log => (
              <tr 
                key={log.id} 
                onClick={() => setSelectedId(log.id)} 
                className={`cursor-pointer transition-colors ${selectedId === log.id ? 'bg-indigo-100' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4">{log.module}</td>
                <td className="px-6 py-4">{log.operation}</td>
                <td className="px-6 py-4">{log.referenceNo}</td>
                <td className="px-6 py-4">{log.user}</td>
                <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-[#0b1424] px-10 py-6 flex items-center justify-between no-print border-t border-slate-800 shadow-2xl relative z-20">
        <div className="text-slate-400 text-xs font-bold">
          Total Records: {filtered.length}
        </div>
      </div>
    </div>
  );
};
