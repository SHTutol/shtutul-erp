import React, { useState, useEffect, useRef } from 'react';
import { RequisitionData, UnitRecord, PayeeRecord, SisterRecord, ViewType } from '../types';
import { numberToWords } from '../utils/numberToWords';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Building, 
  Layers, 
  Calendar, 
  Hash, 
  User,
  ArrowRightCircle,
  X
} from 'lucide-react';

export interface RequisitionFormProps {
  onViewChange?: (view: ViewType) => void;
  onSave?: (data: RequisitionData, shouldPrint?: boolean) => void;
  onPrint?: () => void;
  autoPrint?: boolean;
  editingData?: RequisitionData | null;
  nextReqNo?: string;
  readOnly?: boolean;
  availableUnits?: UnitRecord[];
  availablePayees?: PayeeRecord[];
  availableSisters?: SisterRecord[];
}

export const RequisitionForm: React.FC<RequisitionFormProps> = ({ 
  onViewChange, 
  onSave, 
  onPrint,
  autoPrint = false,
  editingData, 
  nextReqNo,
  readOnly = false,
  availableUnits = [],
  availablePayees = [],
  availableSisters = []
}) => {
  const [data, setData] = useState<RequisitionData>(() => {
    if (editingData) return { ...editingData };
    return {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      requisitionNo: nextReqNo || '',
      nameOfPayee: '',
      sisterConcern: availableSisters.length > 0 ? availableSisters[0].name : 'SIM FABRICS LIMITED',
      unit: availableUnits.length > 0 ? availableUnits[0].name : 'KNIT DYEING UNIT',
      through: '',
      purpose: '',
      typeOfRequisition: '',
      amountTk: 0,
      indentedBy: '',
      status: 'Pending'
    };
  });

  const [payeeSearch, setPayeeSearch] = useState(editingData?.nameOfPayee || '');
  const [showPayeeList, setShowPayeeList] = useState(false);
  const payeeRef = useRef<HTMLDivElement>(null);
  const requisitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoPrint && readOnly && requisitionRef.current) {
      handlePrint();
    }
  }, [autoPrint, readOnly]);

  useEffect(() => {
    if (editingData) {
      setData(editingData);
      setPayeeSearch(editingData.nameOfPayee);
    }
  }, [editingData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (payeeRef.current && !payeeRef.current.contains(event.target as Node)) {
        setShowPayeeList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: name === 'amountTk' ? parseFloat(value) || 0 : value }));
  };

  const handlePayeeSelect = (payee: string) => {
    setData(prev => ({ ...prev, nameOfPayee: payee }));
    setPayeeSearch(payee);
    setShowPayeeList(false);
  };

  const handlePrint = () => {
    if (!requisitionRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print.');
      return;
    }

    const content = requisitionRef.current.outerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Requisition - ${data.requisitionNo}</title>
          ${styles}
          <style>
            @page { size: A4 portrait; margin: 5mm; }
            body { margin: 0; padding: 0; background: white; }
            .requisition-paper { 
              width: 100% !important; 
              max-width: 210mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              padding: 5mm 10mm !important;
              visibility: visible !important;
              display: flex !important;
              flex-direction: column !important;
              min-height: 280mm !important;
            }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 700);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    onPrint?.();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nameOfPayee) {
      alert("Please select a Payee Name");
      return;
    }
    if (!data.sisterConcern) {
      alert("Please select a Sister Concern");
      return;
    }
    onSave?.(data);
  };

  const filteredPayees = availablePayees.filter(p => (p.name || '').toLowerCase().includes((payeeSearch || '').toLowerCase()));

  const previewDate = new Date(data.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  return (
    <div className="flex flex-col items-center w-full max-w-[1200px] mx-auto">
      {!readOnly && (
        <div className="no-print w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 mb-10">
          <div className="bg-slate-900 px-8 py-6 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => onViewChange?.('REQ_LIST')}
                className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-white text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                  <ArrowRightCircle className="text-purple-400" /> 
                  Requisition Entry
                </h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">SHTutol ERP System</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Building size={14} className="text-purple-600" /> Sister Concern
                </label>
                <div className="relative">
                   <select 
                    name="sisterConcern"
                    value={data.sisterConcern}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition-all appearance-none text-base uppercase"
                  >
                    <option value="">-- SELECT CONCERN --</option>
                    {availableSisters.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-purple-600" /> Unit
                </label>
                <div className="relative">
                  <select 
                    name="unit"
                    value={data.unit}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition-all appearance-none text-base uppercase"
                  >
                    <option value="">-- SELECT UNIT --</option>
                    {availableUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={14} className="text-purple-600" /> Requisition No
                </label>
                <input 
                  type="text" 
                  value={data.requisitionNo}
                  readOnly
                  className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl px-4 py-4 font-black text-slate-400 outline-none text-base" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-purple-600" /> Date
                </label>
                <input 
                  type="date" 
                  name="date"
                  value={data.date}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-black text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition-all text-base" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2" ref={payeeRef}>
                <label className="text-[11px] font-black text-slate-500 normal-case tracking-widest flex items-center gap-2">
                  <User size={14} className="text-purple-600" /> Name of Payee
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="SEARCH PAYEE..."
                    value={payeeSearch}
                    onFocus={() => setShowPayeeList(true)}
                    onChange={(e) => setPayeeSearch(e.target.value)}
                    className="w-full pl-6 pr-12 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-purple-600 normal-case" 
                  />
                  {showPayeeList && (
                    <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                      {filteredPayees.map((payee) => (
                        <button
                          key={payee.id}
                          type="button"
                          onClick={() => handlePayeeSelect(payee.name)}
                          className="w-full text-left px-6 py-4 hover:bg-purple-50 transition-colors border-b border-slate-50 font-black text-slate-700 normal-case text-sm"
                        >
                          {payee.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Through</label>
                <input 
                  type="text" 
                  name="through"
                  value={data.through}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-slate-800 outline-none focus:border-purple-600 transition-all text-lg normal-case" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Purpose</label>
                <textarea 
                  name="purpose"
                  value={data.purpose}
                  onChange={handleChange}
                  className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 outline-none focus:border-purple-600 transition-all resize-none text-base normal-case" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                <input 
                  type="text" 
                  name="typeOfRequisition"
                  value={data.typeOfRequisition}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 outline-none focus:border-purple-600 h-[64px] text-lg normal-case" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Amount TK</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-white/50 text-2xl">৳</div>
                   <input 
                    type="number" 
                    name="amountTk"
                    value={data.amountTk || ''}
                    onChange={handleChange}
                    className="w-full h-[120px] bg-slate-900 text-white border-none rounded-3xl px-12 py-4 font-black text-2xl outline-none focus:ring-8 focus:ring-purple-600/20 text-right tabular-nums" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 flex gap-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => {
                  if (!data.nameOfPayee) return alert("Please select a Payee Name");
                  if (!data.sisterConcern) return alert("Please select a Sister Concern");
                  onSave?.(data, false);
                }}
                className="flex-grow px-6 py-5 rounded-2xl bg-blue-600 font-black text-white hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 uppercase text-lg tracking-wider active:scale-[0.98]"
              >
                <Save size={22} /> Save
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  if (!data.nameOfPayee) return alert("Please select a Payee Name");
                  if (!data.sisterConcern) return alert("Please select a Sister Concern");
                  onSave?.(data, true);
                }}
                className="flex-grow px-6 py-5 rounded-2xl bg-purple-600 font-black text-white hover:bg-purple-700 transition-all shadow-xl flex items-center justify-center gap-3 uppercase text-lg tracking-wider active:scale-[0.98]"
              >
                <Printer size={22} /> Print
              </button>

              <button 
                type="button"
                onClick={() => onViewChange?.('REQ_LIST')}
                className="px-8 py-5 rounded-2xl bg-slate-200 font-black text-slate-600 hover:bg-slate-300 transition-all flex items-center justify-center gap-3 uppercase text-lg tracking-wider active:scale-[0.98]"
              >
                <X size={22} /> Close
              </button>
            </div>
          </form>
        </div>
      )}

      {readOnly && (
        <div className="w-full flex flex-col items-center pt-0 print:pt-0">
          <div className="no-print mb-6 w-full max-w-[210mm] flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-xl">
             <button onClick={() => onViewChange?.('REQ_LIST')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-95"><ArrowLeft size={18} /></button>
             <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Print Preview (A4 Size)</div>
             <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 shadow-xl active:scale-95 uppercase">
               <Printer size={18} /> Print Now
             </button>
          </div>
          
          {/* A4 পেপার কন্টেইনার - স্ক্রিনে প্রিভিউ সুন্দর দেখানোর জন্য */}
          <div className="no-print w-[210mm] h-[297mm] bg-white p-[20mm] shadow-inner mb-10 overflow-hidden rounded-xl">
             <div 
              ref={requisitionRef} 
              className="requisition-paper bg-white text-black w-full h-full mx-auto flex flex-col"
              style={{ fontFamily: "'Times New Roman', serif", fontSize: '15px' }}
            >
              {/* হেডার */}
              <div className="requisition-header text-center flex flex-col items-center pt-2 print:pt-1">
                <h1 className="text-[26px] font-bold leading-none m-0 uppercase tracking-tight">
                  {data.sisterConcern || 'SIM FABRICS LIMITED'}
                </h1>
                <h2 className="text-[18px] font-bold leading-none mt-2 mb-0 uppercase">
                  {data.unit || 'KNIT DYEING UNIT'}
                </h2>
                
                <div className="mt-2 border-b-[2px] border-black">
                  <h3 className="text-[16px] font-bold leading-none px-4 pb-1 uppercase">
                    REQUISITION FORM
                  </h3>
                </div>
              </div>

              {/* তারিখ ও নম্বর */}
              <div className="flex justify-between items-end mt-6 mb-6 font-bold px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold">Date:</span>
                  <div className="px-2 min-w-[110px] text-left font-bold text-[15px] border-b-[2px] border-black">
                    {previewDate}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold">Requisition No-</span>
                  <span className="min-w-[70px] text-right font-bold text-[15px] border-b-[2px] border-black">
                    {data.requisitionNo.split('-').pop() || '0'}
                  </span>
                </div>
              </div>

              {/* বডি ডাটা */}
              <div className="space-y-4.5 px-1">
                <div className="flex items-end gap-2 min-h-[30px]">
                  <span className="whitespace-nowrap font-bold text-[15px]">Name of Payee</span>
                  <div className="flex-grow border-b-2 border-black font-bold text-[16px] normal-case px-2 min-h-[24px]">
                    {data.nameOfPayee}
                  </div>
                </div>

                <div className="flex items-end gap-2 min-h-[30px]">
                  <span className="whitespace-nowrap font-bold text-[15px]">Through</span>
                  <div className="flex-grow border-b-2 border-black font-bold text-[16px] normal-case px-2 min-h-[24px]">
                    {data.through}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-end gap-2 min-h-[30px]">
                    <span className="whitespace-nowrap font-bold text-[15px]">Purpose</span>
                    <div className="flex-grow border-b-2 border-black font-bold text-[16px] normal-case px-2 min-h-[24px]">
                      {data.purpose}
                    </div>
                  </div>
                  <div className="border-b-2 border-black h-5"></div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
                  <div className="flex items-end gap-2 min-h-[32px]">
                    <span className="whitespace-nowrap font-bold text-[15px] flex-shrink-0">Type of Requisition.</span>
                    <div className="flex-grow border-b-2 border-black font-bold text-[16px] px-2">{data.typeOfRequisition}</div>
                  </div>
                  <div className="flex items-end gap-2 min-h-[32px] flex-shrink-0">
                    <span className="whitespace-nowrap font-bold text-[15px] flex-shrink-0">Amount Tk</span>
                    <div className="w-32 border-b-2 border-black font-bold text-[20px] text-right px-2 min-h-[26px]" style={{ fontFamily: "'Times New Roman', serif" }}>
                      {data.amountTk > 0 ? `${data.amountTk.toLocaleString()}/-` : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-2 pt-1 min-h-[32px]">
                  <span className="whitespace-nowrap font-bold text-[15px] flex-shrink-0">Amount in Words.</span>
                  <div className="flex-grow border-b-2 border-black font-bold normal-case text-[16px] px-2 min-h-[26px] leading-tight italic uppercase">
                    {data.amountTk > 0 ? `${numberToWords(data.amountTk)}` : ''}
                  </div>
                </div>

                <div className="flex items-end gap-2 pt-1 h-8">
                  <span className="whitespace-nowrap font-bold text-[15px]">Indented by</span>
                  <div className="flex-grow border-b-2 border-black h-7"></div>
                </div>
              </div>

              <div className="mt-[20pt]">
                <div className="text-center">
                  <p className="font-bold text-[15px] mb-2">Recommended by</p>
                  <p className="font-bold text-[12px] uppercase text-black inline-block px-4">
                    CHECKED BY / MANAGER / AGM / DGM / GM / SR. GM / GM (A/C)
                  </p>
                </div>

                <div style={{ height: '40pt' }}></div>

                <div className="flex justify-between items-end px-1">
                  <div className="flex flex-col items-center">
                    <div className="w-44 border-t-2 border-black mb-1.5"></div>
                    <span className="text-[12px] font-bold uppercase tracking-tight">(SIGNATURE)</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] font-bold whitespace-nowrap">Approved by</span>
                    <span className="w-44 border-b-2 border-black">&nbsp;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* প্রিন্ট করার জন্য আসল কন্টেইনার - এটি শুধুমাত্র প্রিন্ট করার সময় দৃশ্যমান হবে */}
          <div className="print-only requisition-paper bg-white text-black w-full min-h-[297mm] mx-auto flex flex-col"
              style={{ fontFamily: "'Times New Roman', serif", fontSize: '15px' }}
          >
              {/* প্রিভিউ কন্টেইনারের একই JSX এখানে রিপিট হবে (কোড বাদ না দেয়ার স্বার্থে) */}
              <div className="requisition-header text-center flex flex-col items-center pt-2 print:pt-1">
                <h1 className="text-[26px] font-bold leading-none m-0 uppercase tracking-tight print:mt-0">
                  {data.sisterConcern || 'SIM FABRICS LIMITED'}
                </h1>
                <h2 className="text-[18px] font-bold leading-none mt-2 mb-0 uppercase">
                  {data.unit || 'KNIT DYEING UNIT'}
                </h2>
                
                <div className="mt-2 border-b-[2px] border-black">
                  <h3 className="text-[16px] font-bold leading-none px-4 pb-1 uppercase">
                    REQUISITION FORM
                  </h3>
                </div>
              </div>

              <div className="flex justify-between items-end mt-6 mb-6 font-bold px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold">Date:</span>
                  <div className="px-2 min-w-[110px] text-left font-bold text-[15px] border-b-[2px] border-black">
                    {previewDate}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold">Requisition No-</span>
                  <span className="min-w-[70px] text-right font-bold text-[15px] border-b-[2px] border-black">
                    {data.requisitionNo.split('-').pop() || '0'}
                  </span>
                </div>
              </div>

              <div className="space-y-5 px-1">
                <div className="flex items-end gap-2 min-h-[30px]">
                  <span className="whitespace-nowrap font-bold text-[15px]">Name of Payee</span>
                  <div className="flex-grow border-b-2 border-black font-bold text-[16px] normal-case px-2 min-h-[24px]">
                    {data.nameOfPayee}
                  </div>
                </div>

                <div className="flex items-end gap-4 min-h-[30px]">
                  <span className="whitespace-nowrap font-bold text-[15px]">Through</span>
                  <div className="flex-grow border-b-2 border-black font-bold text-[16px] normal-case px-2 min-h-[24px]">
                    {data.through}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-end gap-2 min-h-[30px]">
                    <span className="whitespace-nowrap font-bold text-[15px]">Purpose</span>
                    <div className="flex-grow border-b-2 border-black font-bold text-[16px] normal-case px-2 min-h-[24px]">
                      {data.purpose}
                    </div>
                  </div>
                  <div className="border-b-2 border-black h-6"></div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
                  <div className="flex items-end gap-2 min-h-[32px]">
                    <span className="whitespace-nowrap font-bold text-[15px] flex-shrink-0">Type of Requisition.</span>
                    <div className="flex-grow border-b-2 border-black font-bold text-[16px] px-2">{data.typeOfRequisition}</div>
                  </div>
                  <div className="flex items-end gap-2 min-h-[32px] flex-shrink-0">
                    <span className="whitespace-nowrap font-bold text-[15px] flex-shrink-0">Amount Tk</span>
                    <div className="w-32 border-b-2 border-black font-bold text-[20px] text-right px-2 min-h-[26px]" style={{ fontFamily: "'Times New Roman', serif" }}>
                      {data.amountTk > 0 ? `${data.amountTk.toLocaleString()}/-` : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-2 pt-1 min-h-[32px]">
                  <span className="whitespace-nowrap font-bold text-[15px] flex-shrink-0">Amount in Words.</span>
                  <div className="flex-grow border-b-2 border-black font-bold normal-case text-[16px] px-2 min-h-[26px] leading-tight italic uppercase">
                    {data.amountTk > 0 ? `${numberToWords(data.amountTk)}` : ''}
                  </div>
                </div>
                
                <div className="flex items-end gap-2 pt-1 h-8">
                  <span className="whitespace-nowrap font-bold text-[15px]">Indented by</span>
                </div>
              </div>

              <div className="mt-[20pt]">
                <div className="text-center">
                  <p className="font-bold text-[14px] mb-1.5">Recommended by</p>
                  <p className="font-bold text-[12px] uppercase text-black">CHECKED BY / MANAGER / AGM / DGM / GM / SR. GM / GM (A/C)</p>
                </div>

                <div style={{ height: '40pt' }}></div>

                <div className="flex justify-between items-end px-1">
                  <div className="flex flex-col items-center">
                    <div className="w-44 border-t-2 border-black mb-1.5"></div>
                    <span className="text-[12px] font-bold uppercase tracking-tight">(SIGNATURE)</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] font-bold whitespace-nowrap">Approved by</span>
                    <span className="w-44 border-b-2 border-black">&nbsp;</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};