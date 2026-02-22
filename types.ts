
export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  avatar?: string;
  lastLogin?: string;
  permissions: string[]; // List of view IDs the user can access
  lastSeen?: any;
}
   

export interface RequisitionData {
  id: string;
  date: string;
  requisitionNo: string;
  nameOfPayee: string;
  sisterConcern: string;
  unit: string;
  through: string;
  purpose: string;
  typeOfRequisition: string;
  amountTk: number;
  indentedBy: string;
  status?: 'Pending' | 'Approved';
}

export interface UnitRecord {
  id: string;
  sl: number;
  name: string;
}

export interface PayeeRecord {
  id: string;
  sl: number;
  name: string;
  phone: string;
  particulars?: string;
}

export interface SisterRecord {
  id: string;
  sl: number;
  name: string;
  phone: string;
}

export interface VoucherRow {
  accountHead: string;
  control: string;
  subsidiary: string;
  amountTk: number;
  amountPs: string;
  signature: string;
}

export interface DebitVoucherData {
  id: string;
  no: string; 
  date: string;
  paidTo: string;
  sisterConcern: string;
  unit: string;
  paymentType: string;
  paymentNo: string;      // এটি যোগ করুন (চেক নম্বর বা পেমেন্ট রেফারেন্সের জন্য)
  chequeDate: string;     // এটি যোগ করুন
  bankName: string;       // এটি যোগ করুন
  paymentDate: string;
  bankAccountNo: string;
  for: string;
  enclosedNoPapers: string;
  accountHead: string;
  amountTk: number;
  status?: 'Pending' | 'Approved';
  rows: VoucherRow[];
}
