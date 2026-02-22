import React, { useState, useMemo } from 'react';
import { ViewType } from '../App';
import { DebitVoucherData } from '../types';
import { 
  FileBarChart, 
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
  Building,
  Briefcase
} from 'lucide-react';

interface DebitVoucherReportProps {
  onViewChange: (view: ViewType) => void;
  vouchers: DebitVoucherData[];
}

const LOGO_SRC = "https://files.oaiusercontent.com/file-m0hO9HiaS6O6N84Y8mG68O?se=2025-02-14T06%3A36%3A14Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D75a95ef8-10ce-4c12-8868-809228e938f3.webp&sig=G0S8/hWnK/4E8WjB6Nn7f09f0F5mD/G2O/v3Vv0V4%3D";

export const DebitVoucherReport: React.FC<DebitVoucherReportProps> = ({ onViewChange, vouchers }) => {
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

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchRef = (v.no || '').toLowerCase().includes(appliedFilters.ref.toLowerCase());
      const matchPayee = (v.paidTo || '').toLowerCase().includes(appliedFilters.payee.toLowerCase());
      
      let matchDate = true;
      if (appliedFilters.start) {
        const vDate = new Date(v.date);
        const start = new Date(appliedFilters.start);
        
        if (appliedFilters.mode === 'EQUAL') {
          matchDate = v.date === appliedFilters.start;
        } else if (appliedFilters.mode === 'BETWEEN' && appliedFilters.end) {
          const end = new Date(appliedFilters.end);
          vDate.setHours(0,0,0,0);
          start.setHours(0,0,0,0);
          end.setHours(23,59,59,999);
          matchDate = vDate >= start && vDate <= end;
        } else if (appliedFilters.mode === 'BETWEEN') {
          vDate.setHours(0,0,0,0);
          start.setHours(0,0,0,0);
          matchDate = vDate >= start;
        }
      }

      return matchRef && matchPayee && matchDate;
    });
  }, [vouchers, appliedFilters]);

  const totalAmount = filteredVouchers.reduce((sum, v) => sum + (v.amountTk || 0), 0);

  const exportToExcel = () => {
    if (filteredVouchers.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = ["SL", "DATE", "VOUCHER NO", "PAID TO", "ACCOUNT HEAD", "PARTICULARS (FOR)", "AMOUNT (TK)"];
    const rows = filteredVouchers.map((v, index) => [
      index + 1,
      v.date,
      `"${v.no}"`,
      `"${v.paidTo}"`,
      `"${v.accountHead}"`,
      `"${v.for.replace(/"/g, '""')}"`,
      v.amountTk
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Debit_Voucher_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[2100px] flex flex-col items-center animate-in fade-in duration-700 pb-20 relative">
      
      {/* ACTION BUTTONS AT TOP */}
      <div className="no-print w-full flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
            <FileBarChart size={14} /> Financial Modules / Debit Ledger
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Debit Voucher Ledger
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-slate-200">
              Auditor View
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
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all font-black text-xs uppercase shadow-xl shadow-green-500/20 active:scale-95"
          >
            <Printer size={18} /> Print Ledger / PDF
          </button>
        </div>
      </div>

      {/* Filter Dashboard */}
      <div className="no-print w-full bg-white border border-slate-200 rounded-[2rem] p-8 mb-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <Filter size={18} className="text-green-500" />
          <span className="font-black text-xs uppercase tracking-[0.3em]">Query Filters</span>
          <div className="flex-grow h-px bg-slate-100 ml-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Hash size={12} className="text-green-500" /> Voucher No
            </label>
            <input 
              type="text"
              placeholder="E.G. DV-001"
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none uppercase"
            />
          </div>

          <div className="flex flex-col gap-2 xl:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User size={12} className="text-green-500" /> Paid To
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
              <Calendar size={12} className="text-green-500" /> Date Mode
            </label>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setDateMode('EQUAL')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${dateMode === 'EQUAL' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>SINGLE</button>
              <button onClick={() => setDateMode('BETWEEN')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${dateMode === 'BETWEEN' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>RANGE</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSearch} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase active:scale-95"><Search size={16} /> Search</button>
            <button onClick={handleReset} className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase active:scale-95"><RotateCcw size={16} /></button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <div className="flex flex-col gap-2 w-full md:w-[220px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{dateMode === 'EQUAL' ? 'Select Date' : 'Start Date'}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          {dateMode === 'BETWEEN' && (
            <div className="flex flex-col gap-2 w-full md:w-[220px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
          )}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="w-full bg-white shadow-2xl md:border md:border-slate-200 md:rounded-[2.5rem] print-area flex flex-col">
        
        {/* Hidden Print Header with Logo */}
        <div className="hidden print:flex flex-col items-center mb-10 w-full text-center">
          <div className="flex items-center gap-6 mb-4">
            <img src={LOGO_SRC} alt="SIM Group Logo" className="w-24 h-24 object-contain" />
            <div className="text-left">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">SIM GROUP</h1>
              <h2 className="text-xl font-regular tracking-tighter text-slate-900 leading-none mt-2">Head Office: House # 315, Road # 04, Baridhara D.O.H.S, Dhaka.</h2>
              <h3 className="text-xl font-regular tracking-tighter text-slate-900 leading-none">Tel: +88 02 8415961-3 E-Mail: info@simgroup-bd.com www.simgroup-bd.com</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-2">SHTUTUL ERP Debit Ledger</p>
            </div>
          </div>
          <div className="w-full h-1 bg-slate-900 my-4"></div>
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] italic mb-1">Debit Voucher Ledger Report</h2>
          <div className="flex gap-6 text-[10px] font-bold uppercase text-slate-500">
            <span>Generated: {new Date().toLocaleString()}</span>
            {appliedFilters.start && (
              <span>Date Filter: {appliedFilters.start} {appliedFilters.mode === 'BETWEEN' ? ` to ${appliedFilters.end}` : ''}</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white font-black text-[11px] uppercase tracking-wider text-center print:text-black">
                <th className="bg-slate-900 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 w-12 sticky top-0">SL</th>
                <th className="bg-slate-900 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 w-32 sticky top-0">DATE</th>
                <th className="bg-slate-900 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 w-32 sticky top-0">Voucher No</th>
                <th className="bg-slate-800 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 w-64 sticky top-0 text-left">PAID TO</th>
                <th className="bg-slate-800 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 w-48 sticky top-0 text-left">ACCOUNT HEAD</th>
                <th className="bg-slate-700 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 sticky top-0 text-left">PARTICULARS</th>
                <th className="bg-green-600 print:bg-slate-100 border-b-2 border-white/10 px-4 py-5 w-48 sticky top-0 text-white text-right">AMOUNT (TK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredVouchers.length > 0 ? filteredVouchers.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group print:break-inside-avoid">
                  <td className="px-4 py-4 text-center font-black text-xs text-slate-400 print:text-slate-900 group-hover:text-slate-900">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="px-4 py-4 text-center font-bold text-xs text-slate-900 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-4 text-center font-black text-xs text-green-600 print:text-black bg-green-50/30 print:bg-transparent">{row.no}</td>
                  <td className="px-4 py-4 font-black text-xs text-slate-900">{row.paidTo}</td>
                  <td className="px-4 py-4 font-bold text-[10px] uppercase text-slate-500 print:text-black italic">
                    <div className="flex items-center gap-2">
                       <Briefcase size={12} className="text-slate-300" /> {row.accountHead}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-xs text-slate-600 print:text-black leading-relaxed">{row.for}</td>
                  <td className="px-4 py-4 text-right font-black text-base bg-green-50/30 print:bg-transparent text-slate-900 tabular-nums border-l border-slate-100 print:border-slate-300">
                    <span className="text-slate-400 print:text-black text-[10px] mr-1">৳</span>
                    {row.amountTk.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-32 text-center text-slate-300 uppercase font-black tracking-widest italic">No financial records matching your query</td>
                </tr>
              )}
              {/* Grand Total Row for Print */}
              <tr className="hidden print:table-row bg-white text-black font-black text-xl">
                <td colSpan={6} className="px-6 py-6 text-right uppercase tracking-[0.2em] italic border-t-2 border-black">Grand Ledger Total (Tk)</td>
                <td className="px-4 py-6 text-right bg-transparent text-slate-900 tabular-nums border-t-2 border-black">
                  ৳ {totalAmount.toLocaleString()} /-
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FIXED TOTAL FOOTER (SCREEN ONLY) */}
        <div className="no-print sticky bottom-0 z-40 bg-[#0b1424] px-12 py-8 flex items-center justify-between border-t-4 border-green-400 shadow-[0_-15px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-12 text-white">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Ledger Summary</span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-white font-black text-2xl tracking-tighter">
                  {filteredVouchers.length} <span className="text-slate-500 text-xs font-bold uppercase ml-1">Vouchers Found</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.4em] mb-3">Total Disbursement</span>
            <div className="flex items-center gap-5 text-white">
              <span className="text-4xl font-black text-slate-600 italic -mr-2">৳</span>
              <span className="text-7xl font-black tabular-nums tracking-tighter leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                {totalAmount.toLocaleString()}
              </span>
              <div className="flex flex-col items-start leading-none gap-1 ml-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">BDT</span>
                <div className="w-full h-1 bg-green-500/40 rounded-full"></div>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Closing Balance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="no-print mt-12 pb-12 flex flex-col items-center gap-6">
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
          <Info size={14} className="text-green-500" /> Secure Audit Trail Generated for SHTUTUL ERP System
        </p>
      </div>
    </div>
  );
};