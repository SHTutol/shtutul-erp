
import React, { useState, useEffect, useRef } from 'react';
import { RequisitionData, UnitRecord, PayeeRecord, SisterRecord } from '../types';
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
  ArrowRightCircle
} from 'lucide-react';
import { ViewType } from '../App';

export interface RequisitionFormProps {
  onViewChange?: (view: ViewType) => void;
  onSave?: (data: RequisitionData) => void;
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
  editingData, 
  nextReqNo,
  readOnly = false,
  availableUnits = [],
  availablePayees = [],
  availableSisters = []
}) => {
  const [data, setData] = useState<RequisitionData>({
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0],
    requisitionNo: nextReqNo || '',
    nameOfPayee: '',
    sisterConcern: '',
    unit: '',
    through: '',
    purpose: '',
    typeOfRequisition: '',
    amountTk: 0,
    indentedBy: '',
    status: 'Pending'
  });

  const [payeeSearch, setPayeeSearch] = useState('');
  const [showPayeeList, setShowPayeeList] = useState(false);
  const payeeRef = useRef<HTMLDivElement>(null);

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
    window.print();
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

  const filteredPayees = availablePayees.filter(p => p.name.toLowerCase().includes(payeeSearch.toLowerCase()));

  const previewDate = new Date(data.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  return (
    <div className="flex flex-col items-center w-full max-w-[1200px]">
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
              <div className="space-y-2">
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

              <div className="space-y-2">
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

              <div className="space-y-2">
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
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-purple-600" /> Name of Payee
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="SEARCH PAYEE..."
                    value={payeeSearch}
                    onFocus={() => setShowPayeeList(true)}
                    onChange={(e) => setPayeeSearch(e.target.value)}
                    className="w-full pl-6 pr-12 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-purple-600 uppercase" 
                  />
                  {showPayeeList && (
                    <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                      {filteredPayees.map((payee, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePayeeSelect(payee.name)}
                          className="w-full text-left px-6 py-4 hover:bg-purple-50 transition-colors border-b border-slate-50 font-black text-slate-700 uppercase text-sm"
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
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-slate-800 outline-none focus:border-purple-600 transition-all text-lg uppercase" 
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
                  className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 outline-none focus:border-purple-600 transition-all resize-none text-base uppercase" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                <input 
                  type="text" 
                  name="typeOfRequisition"
                  value={data.typeOfRequisition}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-slate-800 outline-none focus:border-purple-600 h-[96px] text-lg uppercase" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Amount TK</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-white/50 text-2xl">৳</div>
                   <input 
                    type="number" 
                    name="amountTk"
                    value={data.amountTk || ''}
                    onChange={handleChange}
                    className="w-full h-[96px] bg-slate-900 text-white border-none rounded-3xl px-12 py-4 font-black text-5xl outline-none focus:ring-8 focus:ring-purple-600/20 text-right tabular-nums" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 flex gap-4 border-t border-slate-100">
              <button 
                type="submit"
                className="flex-grow px-10 py-5 rounded-2xl bg-purple-600 font-black text-white hover:bg-purple-700 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase text-xl tracking-wider active:scale-[0.98]"
              >
                <Save size={24} /> Save Requisition
              </button>
            </div>
          </form>
        </div>
      )}

      {readOnly && (
        <div className="w-full flex flex-col items-center pt-0 print:pt-0">
          <div className="no-print mb-4 w-full max-w-[8.2in] flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-xl">
             <button onClick={() => onViewChange?.('REQ_LIST')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><ArrowLeft size={18} /></button>
             <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs hover:bg-slate-800 transition-all shadow-2xl active:scale-95 uppercase">
               <Printer size={16} /> Print Voucher
             </button>
          </div>
          
          <div className="bg-white p-0 print:p-0 print:m-0 print:shadow-none shadow-2xl overflow-hidden rounded-xl mb-20 print:mb-0">
            <div className="requisition-paper bg-white text-black font-serif">
              
              <div className="text-center mb-6">
                <h1 className="text-[34px] font-bold uppercase leading-tight mb-0 tracking-tight">{data.sisterConcern || 'SHTutol ERP SYSTEM'}</h1>
                <h2 className="text-[20px] font-bold uppercase tracking-[0.1em] mt-0 mb-1">{data.unit || 'UNIT-2'}</h2>
                <div className="inline-block border-b border-black pb-0.5"><h3 className="text-[16px] font-bold uppercase tracking-[0.2em] italic underline">REQUISITION FORM</h3></div>
              </div>

              <div className="flex justify-between items-end mb-6 font-bold px-1">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] uppercase font-bold">DATE:</span>
                  <div className="px-3 py-0.5 min-w-[120px] text-center font-bold text-[16px] border-b border-black">
                    {previewDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold uppercase">REQUISITION NO:</span>
                  <span className="min-w-[60px] text-center font-bold text-[20px] border-b border-black">{data.requisitionNo.split('-').pop() || '001'}</span>
                </div>
              </div>

              <div className="space-y-4 px-1">
                <div className="flex items-end gap-3 h-8">
                  <span className="whitespace-nowrap font-bold uppercase text-[12px]">NAME OF PAYEE:,</span>
                  <div className="flex-grow border-b border-black font-bold text-[16px] uppercase px-2 italic tracking-tight">
                    {data.nameOfPayee}
                  </div>
                </div>

                <div className="flex items-end gap-3 h-8">
                  <span className="whitespace-nowrap font-bold uppercase text-[12px]">THROUGH:</span>
                  <div className="flex-grow border-b border-black font-bold text-[16px] uppercase px-2 italic">
                    {data.through}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-end gap-2 h-8">
                    <span className="whitespace-nowrap font-bold uppercase text-[12px]">PURPOSE:</span>
                    <div className="flex-grow border-b border-black font-bold text-[16px] uppercase px-2 italic h-full flex items-end">
                      {data.purpose}
                    </div>
                  </div>
                  <div className="border-b border-black h-8"></div>
                </div>

                <div className="flex items-end justify-between gap-3 pt-2">
                  <div className="flex items-end gap-3 flex-grow h-8">
                    <span className="whitespace-nowrap font-bold uppercase text-[12px]">TYPE OF REQUISITION:.</span>
                    <div className="flex-grow border-b border-black font-bold text-[16px] uppercase px-2 italic">
                      {data.typeOfRequisition}
                    </div>
                  </div>
                  <div className="flex items-end gap-3 h-8">
                    <span className="whitespace-nowrap font-bold uppercase text-[12px]">AMOUNT TK:</span>
                    <div className="w-32 border-b border-black font-bold text-[22px] text-right px-2 italic">
                      {data.amountTk.toLocaleString()}/-
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-3 pt-2 h-8">
                  <span className="whitespace-nowrap font-bold uppercase text-[12px]">AMOUNT IN WORDS.</span>
                  <div className="flex-grow border-b border-black font-bold uppercase text-[16px] px-2 italic underline leading-tight">
                    {numberToWords(data.amountTk)}
                  </div>
                </div>

                <div className="flex items-end gap-3 pt-2 h-8">
                  <span className="whitespace-nowrap font-bold uppercase text-[12px]">INDENTED BY</span>
                  <div className="w-48 border-b border-black"></div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="font-bold text-[13px] mb-1">Recommended by</p>
                <p className="font-bold text-[10px] uppercase tracking-widest text-black/80">CHECKED BY /MANAGER/AGM/DGM/GM/SR. GM. GM (A/C)</p>
              </div>

              <div className="mt-12 flex justify-between items-end px-1">
                <div className="flex flex-col items-center">
                  <div className="w-40 border-t border-black mb-1"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">(SIGNATURE)</span>
                </div>
                
                <div className="flex items-end gap-3">
                  <span className="text-[11px] font-bold uppercase whitespace-nowrap">APPROVE BY</span>
                  <div className="w-44 border-b border-black mb-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
