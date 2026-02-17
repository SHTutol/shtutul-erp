
import React, { useState, useRef, useEffect } from 'react';
import { DebitVoucherData, UnitRecord, PayeeRecord, SisterRecord } from '../types';
import { numberToWords } from '../utils/numberToWords';
import { 
  Save, 
  Printer, 
  ArrowLeft, 
  ArrowRightCircle,
  Building,
  Calendar,
  CreditCard,
  User,
  CheckCircle,
  X,
  ChevronLeft
} from 'lucide-react';
import { ViewType } from '../App';

interface DebitVoucherProps {
  onViewChange?: (view: ViewType) => void;
  onSave?: (data: DebitVoucherData) => void;
  editingData?: DebitVoucherData | null;
  nextDVNo?: string;
  readOnly?: boolean;
  availableUnits?: UnitRecord[];
  availablePayees?: PayeeRecord[];
  availableSisters?: SisterRecord[];
}

const FOR_PREFIX = "THE AMOUNT PAID IN CASH / FOR CHEQUE AGAINST ";

export const DebitVoucher: React.FC<DebitVoucherProps> = ({ 
  onViewChange, 
  onSave, 
  editingData, 
  nextDVNo,
  readOnly = false,
  availableUnits = [],
  availablePayees = [],
  availableSisters = []
}) => {
  const [data, setData] = useState<DebitVoucherData>({
    id: Math.random().toString(36).substr(2, 9),
    no: nextDVNo || '',
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    sisterConcern: '',
    unit: '',
    paymentType: '',
    paymentNo: '',
    chequeDate: '',
    bankName: '',
    paymentDate: '',
    bankAccountNo: '',
    for: FOR_PREFIX,
    enclosedNoPapers: '',
    accountHead: '',
    amountTk: 0,
    status: 'Pending',
    rows: []
  });

  const [payeeSearch, setPayeeSearch] = useState('');
  const [showPayeeList, setShowPayeeList] = useState(false);
  const payeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingData) {
      setData({ ...editingData });
      setPayeeSearch(editingData.paidTo);
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
    setData(prev => ({ ...prev, paidTo: payee }));
    setPayeeSearch(payee);
    setShowPayeeList(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.paidTo) return alert("Please select a Payee Name");
    if (!data.sisterConcern) return alert("Please select a Sister Concern");
    onSave?.(data);
  };

  const filteredPayees = availablePayees.filter(p => p.name.toLowerCase().includes(payeeSearch.toLowerCase()));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const voucherDate = formatDate(data.date);
  const instrumentDate = formatDate(data.chequeDate);

  // PREVIEW / READ-ONLY MODE
  if (readOnly) {
    return (
      <div className="w-full flex flex-col items-center pt-0">
        <div className="no-print mb-4 w-full max-w-[5.83in] flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-xl">
           <button onClick={() => onViewChange?.('DV_LIST')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><ArrowLeft size={18} /></button>
           <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs hover:bg-slate-800 transition-all shadow-2xl active:scale-95 uppercase">
             <Printer size={16} /> Print Voucher
           </button>
        </div>
        
        <div className="bg-white p-0 shadow-2xl overflow-hidden rounded-xl mb-20 print:shadow-none print:m-0">
          <div className="debit-voucher-paper font-serif text-black bg-white flex flex-col h-full relative border border-gray-100 print:border-none">
            <div className="text-center mb-4">
              <h1 className="text-[20px] font-black leading-tight uppercase mb-0">{data.sisterConcern || 'AZLAN KNIT DYEING LTD.'}</h1>
              <h2 className="text-[14px] font-bold uppercase mt-0 mb-0">{data.unit || 'KNIT DYEING UNIT'}</h2>
              <p className="text-[10px] font-medium italic">House no. 315, Road No. 4, Baridhara DOHS, Dhaka-1206</p>
            </div>

            <div className="flex justify-between items-start px-1 mt-2 mb-1">
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[11px] font-bold">No.</span>
                <div className="w-40 border border-black px-2 py-1 text-center font-bold text-[14px] h-[32px] flex items-center justify-center">
                  {data.no.split('-').pop()}
                </div>
              </div>

              <div className="flex flex-col w-44 border border-black text-[11px]">
                <div className="flex border-b border-black">
                  <div className="w-14 px-2 py-1.5 border-r border-black font-bold bg-gray-50/50 uppercase text-[9px]">Date</div>
                  <div className="flex-grow px-2 py-1.5 text-center font-bold">{voucherDate}</div>
                </div>
                <div className="flex">
                  <div className="w-14 px-2 py-1.5 border-r border-black font-bold bg-gray-50/50 uppercase text-[9px]">Tk.</div>
                  <div className="flex-grow px-2 py-1.5 text-right font-black italic">{data.amountTk > 0 ? data.amountTk.toLocaleString() : '-'} /-</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-1 mb-1">
              <h3 className="text-[16px] font-black italic">Debit Voucher (Cash/Cheque)</h3>
            </div>

            <div className="space-y-4 px-1 flex-grow">
              <div className="flex border border-black">
                <div className="px-3 py-2 border-r border-black font-bold whitespace-nowrap bg-gray-50/50 text-[11px]">Paid to Mr/Messrs</div>
                <div className="flex-grow px-3 py-2 font-bold italic text-[14px] flex items-center uppercase">{data.paidTo}</div>
              </div>
              
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-bold whitespace-nowrap">Taka (in words)</span>
                <div className="flex-grow border-b border-black font-bold italic text-[11px] px-2 min-h-[22px] flex items-end uppercase">
                  {numberToWords(data.amountTk)}
                </div>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-[11px] font-medium whitespace-nowrap">Cash/Cheque/P.O/D.D/Advice No.</span>
                <div className="flex-grow border-b border-black font-bold px-2 italic text-[12px]">{data.paymentNo}</div>
                <span className="text-[11px] font-medium whitespace-nowrap ml-2">Date</span>
                <div className="w-32 border-b border-black font-bold px-2 text-center text-[12px]">{instrumentDate}</div>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-[11px] font-medium whitespace-nowrap">On</span>
                <div className="flex-grow border-b border-black font-bold px-2 italic text-[12px]">{data.bankName}</div>
                <span className="text-[11px] font-medium whitespace-nowrap ml-2">Bank A/C No</span>
                <div className="w-48 border-b border-black font-bold px-2 text-[12px]">{data.bankAccountNo}</div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold mt-1 whitespace-nowrap">For</span>
                <div className="flex-grow font-bold italic text-[11px] px-2 uppercase leading-6 break-words min-h-[48px]"
                     style={{ 
                       backgroundImage: 'linear-gradient(transparent 23px, black 23.5px)', 
                       backgroundSize: '100% 24px' 
                     }}>
                  {data.for}
                </div>
              </div>

              <div className="mt-4">
                <table className="w-full border-collapse border border-black text-center text-[11px]">
                  <thead>
                    <tr className="font-bold">
                      <th className="border border-black p-2 w-[40%]">Account Head & Particulars</th>
                      <th className="border border-black p-2 w-16">Control</th>
                      <th className="border border-black p-2 w-16">Subsidiary</th>
                      <th className="border border-black p-0" colSpan={2}>
                        <div className="border-b border-black p-2">Amount</div>
                        <div className="flex">
                           <div className="flex-grow border-r border-black p-2">Tk.</div>
                           <div className="w-5 p-2 text-[9px]">Ps.</div>
                        </div>
                      </th>
                      <th className="border border-black p-2 w-24">Signature of Recipient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(6)].map((_, i) => (
                      <tr key={i} className="h-7">
                        <td className="border border-black text-left px-2 font-bold italic uppercase">{i === 0 ? data.accountHead : ''}</td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black text-right px-2 font-bold italic">{i === 0 && data.amountTk > 0 ? data.amountTk.toLocaleString() : ''}</td>
                        <td className="border border-black text-center text-[10px] w-10">{i === 0 && data.amountTk > 0 ? '00' : ''}</td>
                        <td className="border border-black"></td>
                      </tr>
                    ))}
                    <tr className="h-7 font-black">
                      <td className="border border-black" colSpan={3}></td>
                      <td className="border border-black text-right px-2 font-black italic">{data.amountTk > 0 ? data.amountTk.toLocaleString() : '-'}</td>
                      <td className="border border-black text-center text-[10px] w-10">{data.amountTk > 0 ? '00' : ''}</td>
                      <td className="border border-black"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-2 text-[11px]">
                <span className="font-bold mr-2">Enclosed No. Papers :</span>
              </div>
            </div>

            <div className="mt-8 mb-6 px-1 flex justify-between items-end text-[11px] font-bold w-full">
              <div className="flex flex-col items-center">
                <div className="w-28 border-t border-black mb-1"></div>
                <span>Prepared by</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-28 border-t border-black mb-1"></div>
                <span>Checked by</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-28 border-t border-black mb-1"></div>
                <span>Head of Accounts</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-28 border-t border-black mb-1"></div>
                <span>Director</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ENTRY FORM MODE
  return (
    <div className="no-print w-full flex flex-col items-center bg-slate-100 min-h-screen pb-20">
      <div className="w-full max-w-[1000px] mt-10 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Dark Header */}
        <div className="bg-[#121927] px-8 py-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-6">
            <button 
              type="button" 
              onClick={() => onViewChange?.('DV_LIST')} 
              className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              <ArrowRightCircle className="text-green-500" size={28} />
              <h1 className="text-white text-3xl font-black uppercase italic tracking-tighter">Debit Voucher Entry</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-10 space-y-12">
          
          {/* Top Row: Concern, Unit, No, Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sister Concern</label>
              <select 
                name="sisterConcern" 
                value={data.sisterConcern} 
                onChange={handleChange}
                className="w-full px-6 py-5 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-indigo-500 transition-all text-sm uppercase"
              >
                <option value="">-- SELECT --</option>
                {availableSisters.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
              <select 
                name="unit" 
                value={data.unit} 
                onChange={handleChange}
                className="w-full px-6 py-5 bg-[#F8FAFC] border-2 border-green-600 rounded-2xl font-black text-slate-800 outline-none transition-all text-sm uppercase"
              >
                <option value="">-- SELECT --</option>
                {availableUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Voucher No</label>
              <input 
                type="text" 
                value={data.no} 
                readOnly 
                className="w-full px-6 py-5 bg-[#F1F5F9] border-2 border-transparent rounded-2xl font-black text-slate-400 text-sm uppercase" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="date"
                  value={data.date}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-indigo-500 transition-all text-sm uppercase"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Paid To, Account Head */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3" ref={payeeRef}>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid To</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="SEARCH PAYEE..."
                  value={payeeSearch}
                  onFocus={() => setShowPayeeList(true)}
                  onChange={(e) => {
                    setPayeeSearch(e.target.value);
                    setData(prev => ({ ...prev, paidTo: e.target.value }));
                  }}
                  className="w-full px-8 py-6 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300"
                />
                {showPayeeList && filteredPayees.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white border-2 border-slate-200 rounded-3xl shadow-2xl max-h-60 overflow-y-auto">
                    {filteredPayees.map((payee, idx) => (
                      <button key={idx} type="button" onClick={() => handlePayeeSelect(payee.name)} className="w-full text-left px-8 py-5 hover:bg-slate-50 font-black text-slate-700 uppercase text-xs border-b border-slate-50 last:border-none">{payee.name}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Head</label>
              <input 
                type="text" 
                name="accountHead"
                value={data.accountHead}
                onChange={handleChange}
                placeholder="OFFICE EXPENSE"
                className="w-full px-8 py-6 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Third Row: Particulars & Amount Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Particulars (For)</label>
              <textarea 
                name="for"
                value={data.for}
                onChange={handleChange}
                className="w-full h-[180px] px-8 py-8 bg-[#F8FAFC] border-2 border-slate-100 rounded-[2rem] font-black text-slate-800 outline-none focus:border-indigo-500 transition-all text-base uppercase leading-relaxed resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount TK</label>
              <div className="relative group h-[180px]">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-indigo-400/30 text-4xl pointer-events-none">৳</div>
                <input 
                  type="number" 
                  name="amountTk"
                  value={data.amountTk || ''}
                  onChange={handleChange}
                  className="w-full h-full bg-[#121927] text-white border-none rounded-[2rem] px-16 py-8 font-black text-5xl outline-none focus:ring-8 focus:ring-green-500/10 text-right tabular-nums transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-8 flex flex-col gap-6">
            <div className="h-px bg-slate-100 w-full"></div>
            <button 
              type="submit"
              className="w-full py-6 rounded-[1.75rem] bg-[#10B981] font-black text-white hover:bg-green-600 transition-all shadow-2xl shadow-green-500/20 flex items-center justify-center gap-4 uppercase text-2xl tracking-widest active:scale-[0.98]"
            >
              <Save size={28} /> Save Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
