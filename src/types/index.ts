export interface SalonConfig {
  name: string;
  phone: string;
  address: string;
  tagline: string;
  upiId: string;
  defaultNextDueDays: number; // e.g. 25 days for haircut
  reminderBeforeDays: number; // e.g. 1 day before due date
}

export interface SalonService {
  id: string;
  name: string;
  category: 'hair' | 'beard' | 'face' | 'spa' | 'color' | 'package' | 'other';
  price: number;
}

export interface SelectedServiceItem {
  id: string;
  name: string;
  price: number;
  qty?: number;
}

export interface VisitRecord {
  id: string;
  invoiceNo: string;
  customerName: string;
  phone: string;
  address: string;
  visitDateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  services: SelectedServiceItem[];
  customServiceDescription?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'pending';
  paidAmount: number;
  dueAmount: number;
  nextDueDate: string; // YYYY-MM-DD
  reminderDate: string; // YYYY-MM-DD
  reminderSent: boolean;
  notes?: string;
  createdAt: number;
}

export interface InquiryRecord {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  serviceRequired: string;
  inquiryDate: string; // YYYY-MM-DD
  followUpDate: string; // YYYY-MM-DD (e.g. 3 days after inquiry)
  followUpTime?: string; // HH:mm
  presetDays: number; // e.g. 3
  notes: string;
  status: 'pending' | 'reminded' | 'converted' | 'cancelled';
  reminderSentAt?: string;
  convertedVisitId?: string;
  createdAt: number;
}

export interface CustomerSummary {
  phone: string;
  customerName: string;
  address: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate: string;
  nextDueDate?: string;
  preferredServices: string[];
}
