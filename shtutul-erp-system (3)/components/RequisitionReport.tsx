
import React, { useState, useMemo } from 'react';
import { ViewType } from '../App';
import { RequisitionData } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  Calendar, 
  User, 
  Hash,
  Filter,
  Download,
  Info,
  Building
} from 'lucide-react';

interface RequisitionReportProps {
  onViewChange: (view: ViewType) => void;
  requisitions: RequisitionData[];
}

export const RequisitionReport: React.FC<RequisitionReportProps> = ({ onViewChange, requisitions }) => {
  // Filter States
  const [refFilter, setRefFilter] = useState('');
  const [payeeFilter, setPayeeFilter] = useState('');
  const [dateMode, setDateMode] = useState<'EQUAL' | 'BETWEEN'>('EQUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Applied Filters state
  const [appliedFilters, setAppliedFilters] = useState({
    ref: '',
    payee: '',
    mode: 'EQUAL' as 'EQUAL' | 'BETWEEN',
    start: '',
    end: ''
  });

  const handleSearch = () => {
    setAppliedFilters({
      ref: refFilter,
      payee: payeeFilter,
      mode: dateMode,
      start: startDate,
      end: endDate
    });
  };

  const handleReset = () => {
    setRefFilter('');
    setPayeeFilter('');
    setDateMode('EQUAL');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({
      ref: '',
      payee: '',
      mode: 'EQUAL',
      start: '',
      end: ''
    });
  };

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      const matchRef = (req.requisitionNo || '').toLowerCase().includes(appliedFilters.ref.toLowerCase());
      const matchPayee = (req.nameOfPayee || '').toLowerCase().includes(appliedFilters.payee.toLowerCase());
      
      let matchDate = true;
      if (appliedFilters.start) {
        const reqDate = new Date(req.date);
        const start = new Date(appliedFilters.start);
        
        if (appliedFilters.mode === 'EQUAL') {
          matchDate = req.date === appliedFilters.start;
        } else if (appliedFilters.mode === 'BETWEEN' && appliedFilters.end) {
          const end = new Date(appliedFilters.end);
          reqDate.setHours(0,0,0,0);
          start.setHours(0,0,0,0);
          end.setHours(23,59,59,999);
          matchDate = reqDate >= start && reqDate <= end;
        } else if (appliedFilters.mode === 'BETWEEN') {
          reqDate.setHours(0,0,0,0);
          start.setHours(0,0,0,0);
          matchDate = reqDate >= start;
        }
      }

      return matchRef && matchPayee && matchDate;
    });
  }, [requisitions, appliedFilters]);

  const totalAmount = filteredRequisitions.reduce((sum, r) => sum + (r.amountTk || 0), 0);

  const exportToExcel = () => {
    if (filteredRequisitions.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = ["SL", "DATE", "REF NUMBER", "NAME OF PAYEE", "THROUGH", "PURPOSE", "TYPE", "AMOUNT (TK)"];
    const rows = filteredRequisitions.map((req, index) => [
      index + 1,
      req.date,
      `"${req.requisitionNo}"`,
      `"${req.nameOfPayee}"`,
      `"${req.through}"`,
      `"${req.purpose.replace(/"/g, '""')}"`,
      `"${req.typeOfRequisition}"`,
      req.amountTk
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Requisition_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1400px] flex flex-col items-center animate-in fade-in duration-700 pb-20 relative">
      
      {/* ACTION BUTTONS AT TOP */}
      <div className="no-print w-full flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
            <FileSpreadsheet size={14} /> Financial Modules / Ledger
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Requisition Ledger
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-slate-200">
              System Live Report
            </span>
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black text-xs uppercase shadow-sm"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          
          <button 
            onClick={exportToExcel} 
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 border border-slate-200 transition-all font-black text-xs uppercase shadow-sm active:scale-95"
          >
            <Download size={18} /> Export CSV
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <Printer size={18} /> Print Ledger / PDF
          </button>
        </div>
      </div>

      {/* Modern Filter Dashboard */}
      <div className="no-print w-full bg-white border border-slate-200 rounded-[2rem] p-8 mb-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <Filter size={18} className="text-blue-500" />
          <span className="font-black text-xs uppercase tracking-[0.3em]">Filter Parameters</span>
          <div className="flex-grow h-px bg-slate-100 ml-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Hash size={12} className="text-blue-500" /> Ref Number
            </label>
            <input 
              type="text"
              placeholder="E.G. REQ-001"
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none uppercase"
            />
          </div>

          <div className="flex flex-col gap-2 xl:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User size={12} className="text-blue-500" /> Name of Payee
            </label>
            <input 
              type="text" 
              placeholder="SEARCH PAYEE..."
              value={payeeFilter}
              onChange={(e) => setPayeeFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none uppercase"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar size={12} className="text-blue-500" /> Search Mode
            </label>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setDateMode('EQUAL')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${dateMode === 'EQUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>SINGLE</button>
              <button onClick={() => setDateMode('BETWEEN')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${dateMode === 'BETWEEN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>RANGE</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSearch} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase active:scale-95"><Search size={16} /> Search</button>
            <button onClick={handleReset} className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase active:scale-95"><RotateCcw size={16} /></button>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="w-full bg-white shadow-2xl md:border md:border-slate-200 md:rounded-[2.5rem] overflow-hidden print-area flex flex-col">
        
        {/* Hidden Print Header */}
        <div className="hidden print:flex flex-col items-center mb-10 w-full text-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-900 rounded-xl text-white">
              <Building size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">SIM GROUP</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1">SHTUTUL ERP Financial Services</p>
            </div>
          </div>
          <div className="w-full h-1 bg-slate-900 my-4"></div>
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] italic mb-1">Requisition Ledger Report</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white font-black text-[11px] uppercase tracking-wider text-center print:text-black">
                <th className="bg-slate-900 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-12 sticky top-0">SL</th>
                <th className="bg-slate-900 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-32 sticky top-0">DATE</th>
                <th className="bg-slate-900 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-32 sticky top-0">Ref Number</th>
                <th className="bg-slate-800 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-64 sticky top-0 text-left">NAME OF PAYEE</th>
                <th className="bg-slate-800 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-40 sticky top-0">THROUGH</th>
                <th className="bg-slate-700 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 sticky top-0 text-left">PURPOSE</th>
                <th className="bg-slate-700 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-48 sticky top-0 text-white">TYPE</th>
                <th className="bg-blue-600 print:bg-slate-100 border-b-2 border-black/10 px-4 py-5 w-48 sticky top-0 text-white text-right">AMOUNT (TK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredRequisitions.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group print:break-inside-avoid">
                  <td className="px-4 py-4 text-center font-black text-xs text-slate-400 print:text-slate-900 group-hover:text-slate-900">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="px-4 py-4 text-center font-bold text-xs text-slate-900 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-4 text-center font-black text-xs text-blue-600 print:text-black bg-blue-50/30 print:bg-transparent">{row.requisitionNo}</td>
                  <td className="px-4 py-4 font-black text-xs uppercase text-slate-900">{row.nameOfPayee}</td>
                  <td className="px-4 py-4 text-center font-bold text-[10px] uppercase text-slate-500 print:text-black italic">{row.through}</td>
                  <td className="px-4 py-4 font-medium text-xs text-slate-600 print:text-black leading-relaxed">{row.purpose}</td>
                  <td className="px-4 py-4 text-center font-black text-[10px] uppercase text-slate-900 bg-slate-50/50 print:bg-transparent">{row.typeOfRequisition}</td>
                  <td className="px-4 py-4 text-right font-black text-base bg-yellow-50/50 print:bg-transparent text-slate-900 tabular-nums border-l border-slate-100 print:border-slate-300">
                    <span className="text-slate-400 print:text-black text-[10px] mr-1">৳</span>
                    {row.amountTk.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
