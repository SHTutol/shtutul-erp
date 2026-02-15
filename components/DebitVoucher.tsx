
import React, { useState, useRef, useEffect } from 'react';
import { DebitVoucherData, UnitRecord, PayeeRecord, SisterRecord } from '../types';
import { numberToWords } from '../utils/numberToWords';
import { 
  Save, 
  X, 
  Check, 
  Printer, 
  Building, 
  Layers, 
  Calendar, 
  Hash, 
  ChevronDown,
  User,
  ArrowLeft,
  ArrowRightCircle,
  Briefcase
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

const FOR_PREFIX = "The amount paid in cash / for cheque against ";
const LOGO_SRC = "https://cdn-icons-png.flaticon.com/512/5606/5606117.png";

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
    paymentType: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
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
      const formattedFor = editingData.for.startsWith(FOR_PREFIX) ? editingData.for : FOR_PREFIX + editingData.for;
      setData({ ...editingData, for: formattedFor });
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
    if (name === 'for') {
      const newVal = value.startsWith(FOR_PREFIX) ? value : FOR_PREFIX;
      setData(prev => ({ ...prev, [name]: newVal }));
    } else {
      setData(prev => ({ ...prev, [name]: name === 'amountTk' ? parseFloat(value) || 0 : value }));
    }
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

  if (readOnly) {
    const previewDate = new Date(data.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    return (
      <div className="w-full flex flex-col items-center pt-0">
        <div className="no-print mb-4 w-full max-w-[7.0in] flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-xl">
           <button onClick={() => onViewChange?.('DV_LIST')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><ArrowLeft size={18} /></button>
           <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs hover:bg-slate-800 transition-all shadow-2xl active:scale-95 uppercase">
             <Printer size={16} /> Print Voucher
           </button>
        </div>
        
        <div className="bg-white p-4 shadow-2xl overflow-hidden rounded-xl mb-20">
          <div className="debit-voucher-paper font-serif text-black bg-white">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src={LOGO_SRC} alt="SIM Logo" className="w-14 h-14 object-contain" />
              <div className="text-center">
                <h1 className="text-[22px] font-black leading-none uppercase mb-1">{data.sisterConcern || 'SIM FABRICS LIMITED'}</h1>
                <h2 className="text-[14px] font-bold tracking-[0.05em] mb-1">{data.unit || 'KNIT DYEING UNIT'}</h2>
                <p className="text-[9px] font-medium">Head Office: House # 315, Road # 04, Baridhara DOHS, Dhaka</p>
              </div>
            </div>

            <div className="flex justify-between items-start mt-2 px-1">
              <div className="flex items-center gap-2 mt-4"><span className="text-[11px] font-bold">No.</span><div className="w-32 border border-black px-2 py-0.5 text-center font-bold text-[14px]">{data.no.split('-').pop()}</div></div>
              <div className="border border-black flex flex-col">
                <div className="flex border-b border-black"><div className="w-14 px-2 py-0.5 text-[10px] font-bold border-r border-black flex items-center justify-center bg-gray-50">Date</div><div className="w-32 px-2 py-0.5 text-[12px] font-bold text-center">{previewDate}</div></div>
                <div className="flex"><div className="w-14 px-2 py-0.5 text-[10px] font-bold border-r border-black flex items-center justify-center bg-gray-50">Tk.</div><div className="w-32 px-2 py-0.5 text-[12px] font-black text-right">{data.amountTk.toLocaleString()} /-</div></div>
              </div>
            </div>

            <div className="text-center my-4"><h3 className="text-[15px] font-black tracking-tight border-b-2 border-black inline-block px-4">Debit Voucher (Cash/Cheque)</h3></div>

            <div className="space-y-3 px-1 mt-4">
              <div className="flex items-end gap-2"><span className="text-[11px] font-bold whitespace-nowrap">Paid to Mr/Messrs:</span><div className="flex-grow border-b border-black font-bold italic text-[12px] px-2 h-5 flex items-end">{data.paidTo}</div></div>
              <div className="flex items-end gap-2"><span className="text-[11px] font-bold whitespace-nowrap">Taka (in words):</span><div className="flex-grow border-b border-black font-bold italic text-[10px] px-2 h-5 flex items-end">{numberToWords(data.amountTk)}</div></div>
              <div className="flex items-end gap-2"><span className="text-[11px] font-medium">Cash/Cheque/P.O No:</span><div className="flex-grow border-b border-black h-5"></div><span className="text-[11px] font-medium">Date:</span><div className="w-24 border-b border-black h-5"></div></div>
              <div className="flex items-start gap-2"><span className="text-[11px] font-medium mt-1">For:</span><div className="flex flex-col flex-grow"><div className="border-b border-black font-bold italic text-[10px] px-2 h-5 flex items-end">{data.for}</div><div className="border-b border-black h-5"></div></div></div>
            </div>

            <div className="mt-6 px-1">
              <table className="w-full border-collapse border border-black text-center text-[10px]">
                <thead>
                  <tr className="font-bold bg-gray-50"><th className="border border-black p-1 w-[45%]">Account Head & Particulars</th><th className="border border-black p-1">Control</th><th className="border border-black p-1">Subsidiary</th><th className="border border-black p-1 w-20">Amount Tk.</th><th className="border border-black p-1 w-20">Recipient</th></tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} className="h-6">
                      <td className="border border-black text-left px-2 font-bold">{i === 0 ? data.accountHead : ''}</td>
                      <td className="border border-black"></td><td className="border border-black"></td>
                      <td className="border border-black text-right px-2 font-black">{i === 0 ? data.amountTk.toLocaleString() : ''}</td>
                      <td className="border border-black"></td>
                    </tr>
                  ))}
                  <tr className="h-6 font-black bg-gray-50"><td className="border border-black text-right px-4" colSpan={3}>Total TK.</td><td className="border border-black text-right px-2">{data.amountTk.toLocaleString()}</td><td className="border border-black"></td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-2 px-1 text-[10px]"><span className="font-medium mr-2">Enclosed No. Papers :</span><span className="border-b border-black inline-block w-40 text-center font-bold">{data.enclosedNoPapers || '0'}</span></div>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-[9px] font-bold">
              <div className="flex flex-col items-center"><div className="w-24 border-t border-black mb-1"></div><span>Prepared by</span></div>
              <div className="flex flex-col items-center"><div className="w-24 border-t border-black mb-1"></div><span>Checked by</span></div>
              <div className="flex flex-col items-center"><div className="w-24 border-t border-black mb-1"></div><span>Head of Accounts</span></div>
              <div className="flex flex-col items-center"><div className="w-24 border-t border-black mb-1"></div><span>Director</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="no-print w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 mb-10">
      <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => onViewChange?.('DV_LIST')} className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"><ArrowLeft size={20} /></button>
          <h1 className="text-white text-2xl font-black uppercase italic flex items-center gap-3"><ArrowRightCircle className="text-green-400" /> Debit Voucher Entry</h1>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Sister Concern</label><select name="sisterConcern" value={data.sisterConcern} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-green-600 uppercase">{availableSisters.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
          <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Unit</label><select name="unit" value={data.unit} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-green-600 uppercase">{availableUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}</select></div>
          <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Voucher No</label><input type="text" value={data.no} readOnly className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl px-4 py-4 font-black text-slate-400" /></div>
          <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Date</label><input type="date" name="date" value={data.date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-black text-slate-800" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2" ref={payeeRef}><label className="text-[11px] font-black text-slate-500 uppercase">Paid To</label><input type="text" placeholder="SEARCH PAYEE..." value={payeeSearch} onFocus={() => setShowPayeeList(true)} onChange={(e) => setPayeeSearch(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-green-600 uppercase" />{showPayeeList && <div className="absolute z-[100] mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto w-full max-w-[400px]">{filteredPayees.map((payee, idx) => <button key={idx} type="button" onClick={() => handlePayeeSelect(payee.name)} className="w-full text-left px-6 py-4 hover:bg-green-50 font-black text-slate-700 uppercase text-sm">{payee.name}</button>)}</div>}</div>
           <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Account Head</label><input type="text" name="accountHead" value={data.accountHead} onChange={handleChange} placeholder="OFFICE EXPENSE" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 font-black text-slate-800 outline-none focus:border-green-600 text-lg uppercase" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Particulars (For)</label><textarea name="for" value={data.for} onChange={handleChange} className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 outline-none focus:border-green-600 resize-none text-base uppercase" /></div>
          <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Amount TK</label><div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-white/50 text-2xl">৳</div><input type="number" name="amountTk" value={data.amountTk || ''} onChange={handleChange} className="w-full h-32 bg-slate-900 text-white border-none rounded-3xl px-12 py-4 font-black text-5xl outline-none text-right tabular-nums shadow-2xl" /></div></div>
        </div>
        <div className="pt-10 flex gap-4 border-t border-slate-100"><button type="submit" className="flex-grow px-10 py-5 rounded-2xl bg-green-600 font-black text-white hover:bg-green-700 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase text-xl tracking-wider active:scale-[0.98]"><Save size={24} /> Save Voucher</button></div>
      </form>
    </div>
  );
};
