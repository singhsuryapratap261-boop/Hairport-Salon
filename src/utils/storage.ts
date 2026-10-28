import { SalonConfig, SalonService, VisitRecord, InquiryRecord } from '../types';

export const DEFAULT_SALON_CONFIG: SalonConfig = {
  name: 'Hairport Salon Moradabad',
  phone: '9068505502',
  address: 'Khushalpur Chauraha, Near Bread Factory, Moradabad - 244001',
  tagline: 'Premium Hair Styling, Beard Grooming & Skin Care',
  upiId: '9068505502@upi',
  defaultNextDueDays: 25,
  reminderBeforeDays: 1,
};

export const DEFAULT_SERVICES: SalonService[] = [
  { id: 'srv-1', name: 'Classic Hair Cut', category: 'hair', price: 200 },
  { id: 'srv-2', name: 'Beard Trim & Styling', category: 'beard', price: 100 },
  { id: 'srv-3', name: 'Haircut + Beard Styling Combo', category: 'hair', price: 280 },
  { id: 'srv-4', name: 'D-Tan Face Pack', category: 'face', price: 350 },
  { id: 'srv-5', name: 'Charcoal Face Clean-Up', category: 'face', price: 450 },
  { id: 'srv-6', name: 'Diamond / Gold Facial', category: 'face', price: 850 },
  { id: 'srv-7', name: 'Hair Spa with Steam', category: 'spa', price: 650 },
  { id: 'srv-8', name: 'Herbal Oil Head Massage', category: 'spa', price: 150 },
  { id: 'srv-9', name: 'Hair Color / Highlights', category: 'color', price: 450 },
  { id: 'srv-10', name: 'Keratin Treatment', category: 'hair', price: 2200 },
  { id: 'srv-11', name: 'Hair Smoothening / Straightening', category: 'hair', price: 2500 },
  { id: 'srv-12', name: 'Royal Groom Package', category: 'package', price: 3000 },
];

// Helper to format date as YYYY-MM-DD
export function getTodayDateStr(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNowDateTimeStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

// Initial Realistic Sample Records for Hairport Salon Moradabad in English
const SAMPLE_VISITS: VisitRecord[] = [
  {
    id: 'vis-101',
    invoiceNo: 'HP-1001',
    customerName: 'Rohit Sharma',
    phone: '9897123456',
    address: 'Civil Lines, Moradabad',
    visitDateTime: `${getTodayDateStr(0)}T11:30`,
    services: [
      { id: 'srv-1', name: 'Classic Hair Cut', price: 200 },
      { id: 'srv-2', name: 'Beard Trim & Styling', price: 100 },
      { id: 'srv-4', name: 'D-Tan Face Pack', price: 350 },
    ],
    totalAmount: 650,
    discount: 50,
    finalAmount: 600,
    paymentMode: 'upi',
    paidAmount: 600,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(25),
    reminderDate: getTodayDateStr(24),
    reminderSent: false,
    notes: 'Requested hair spa during next visit',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'vis-102',
    invoiceNo: 'HP-1002',
    customerName: 'Amit Kumar Rastogi',
    phone: '9412345678',
    address: 'Ram Ganga Vihar, Kanth Road, Moradabad',
    visitDateTime: `${getTodayDateStr(0)}T14:15`,
    services: [
      { id: 'srv-7', name: 'Hair Spa with Steam', price: 650 },
      { id: 'srv-1', name: 'Classic Hair Cut', price: 200 },
    ],
    totalAmount: 850,
    discount: 0,
    finalAmount: 850,
    paymentMode: 'cash',
    paidAmount: 850,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(30),
    reminderDate: getTodayDateStr(29),
    reminderSent: false,
    notes: 'Prefers mild warm water for hair wash',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'vis-103',
    invoiceNo: 'HP-1003',
    customerName: 'Mohit Varshney',
    phone: '9758112233',
    address: 'Khushalpur, Moradabad',
    visitDateTime: `${getTodayDateStr(-20)}T16:00`,
    services: [
      { id: 'srv-3', name: 'Haircut + Beard Styling Combo', price: 280 },
    ],
    totalAmount: 280,
    discount: 0,
    finalAmount: 280,
    paymentMode: 'upi',
    paidAmount: 280,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(0), // Due today!
    reminderDate: getTodayDateStr(0),
    reminderSent: false,
    notes: '20-day grooming cycle',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'vis-099',
    invoiceNo: 'HP-0998',
    customerName: 'Deepak Mehrotra',
    phone: '9837554433',
    address: 'Civil Lines, Moradabad',
    visitDateTime: `${getTodayDateStr(-40)}T15:30`,
    services: [
      { id: 'srv-10', name: 'Keratin Treatment', price: 2200 },
      { id: 'srv-1', name: 'Classic Hair Cut', price: 200 },
    ],
    totalAmount: 2400,
    discount: 200,
    finalAmount: 2200,
    paymentMode: 'upi',
    paidAmount: 2200,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(-10),
    reminderDate: getTodayDateStr(-11),
    reminderSent: true,
    notes: 'Festival grooming package',
    createdAt: Date.now() - 86400000 * 40,
  },
  {
    id: 'vis-098',
    invoiceNo: 'HP-0985',
    customerName: 'Vivek Singhal',
    phone: '9837119988',
    address: 'Kanth Road, Moradabad',
    visitDateTime: `${getTodayDateStr(-75)}T17:00`,
    services: [
      { id: 'srv-6', name: 'Diamond / Gold Facial', price: 850 },
      { id: 'srv-7', name: 'Hair Spa with Steam', price: 650 },
    ],
    totalAmount: 1500,
    discount: 100,
    finalAmount: 1400,
    paymentMode: 'cash',
    paidAmount: 1400,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(-45),
    reminderDate: getTodayDateStr(-46),
    reminderSent: true,
    notes: 'Skin care routine',
    createdAt: Date.now() - 86400000 * 75,
  },
  {
    id: 'vis-097',
    invoiceNo: 'HP-0970',
    customerName: 'Sachin Bansal',
    phone: '9837223344',
    address: 'Khushalpur, Moradabad',
    visitDateTime: `${getTodayDateStr(-105)}T12:00`,
    services: [
      { id: 'srv-12', name: 'Royal Groom Package', price: 3000 },
    ],
    totalAmount: 3000,
    discount: 200,
    finalAmount: 2800,
    paymentMode: 'upi',
    paidAmount: 2800,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(-75),
    reminderDate: getTodayDateStr(-76),
    reminderSent: true,
    notes: 'Pre-wedding grooming',
    createdAt: Date.now() - 86400000 * 105,
  },
  {
    id: 'vis-096',
    invoiceNo: 'HP-0952',
    customerName: 'Aditya Chauhan',
    phone: '9897887766',
    address: 'Budh Bazaar, Moradabad',
    visitDateTime: `${getTodayDateStr(-135)}T14:30`,
    services: [
      { id: 'srv-11', name: 'Hair Smoothening / Straightening', price: 2500 },
    ],
    totalAmount: 2500,
    discount: 150,
    finalAmount: 2350,
    paymentMode: 'upi',
    paidAmount: 2350,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(-90),
    reminderDate: getTodayDateStr(-91),
    reminderSent: true,
    notes: 'Smoothening consultation',
    createdAt: Date.now() - 86400000 * 135,
  },
  {
    id: 'vis-095',
    invoiceNo: 'HP-0930',
    customerName: 'Nitin Agarwal',
    phone: '9412998811',
    address: 'Majhola, Moradabad',
    visitDateTime: `${getTodayDateStr(-165)}T18:00`,
    services: [
      { id: 'srv-3', name: 'Haircut + Beard Styling Combo', price: 280 },
      { id: 'srv-4', name: 'D-Tan Face Pack', price: 350 },
    ],
    totalAmount: 630,
    discount: 30,
    finalAmount: 600,
    paymentMode: 'cash',
    paidAmount: 600,
    dueAmount: 0,
    nextDueDate: getTodayDateStr(-140),
    reminderDate: getTodayDateStr(-141),
    reminderSent: true,
    notes: 'Regular customer',
    createdAt: Date.now() - 86400000 * 165,
  },
];

const SAMPLE_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq-201',
    customerName: 'Gaurav Gupta',
    phone: '9837098765',
    address: 'Khushalpur, Moradabad',
    serviceRequired: 'Keratin Treatment & Hair Spa',
    inquiryDate: getTodayDateStr(-3),
    followUpDate: getTodayDateStr(0), // Due today (3 days later)
    presetDays: 3,
    notes: 'Customer asked to remind after 3 days for Sunday slot',
    status: 'pending',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'inq-202',
    customerName: 'Sameer Khan',
    phone: '9837123999',
    address: 'Near Bread Factory, Moradabad',
    serviceRequired: 'Royal Groom Package (Wedding)',
    inquiryDate: getTodayDateStr(-1),
    followUpDate: getTodayDateStr(2),
    presetDays: 3,
    notes: 'Brother wedding on 15th, asked for bridal/groom package quote',
    status: 'pending',
    createdAt: Date.now() - 86400000 * 1,
  },
];

const STORAGE_KEYS = {
  CONFIG: 'hairport_salon_config_v2',
  SERVICES: 'hairport_salon_services_v2',
  VISITS: 'hairport_salon_visits_v2',
  INQUIRIES: 'hairport_salon_inquiries_v2',
};

export function loadSalonConfig(): SalonConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (data) {
      const cfg = JSON.parse(data);
      // Ensure the updated address is reflected if it has the older one
      if (!cfg.address || cfg.address.includes('सिविल लाइंस') || !cfg.address.includes('Khushalpur')) {
        cfg.address = DEFAULT_SALON_CONFIG.address;
        cfg.name = DEFAULT_SALON_CONFIG.name;
        cfg.tagline = DEFAULT_SALON_CONFIG.tagline;
        saveSalonConfig(cfg);
      }
      return cfg;
    }
  } catch (e) {
    console.error('Failed to load salon config:', e);
  }
  return DEFAULT_SALON_CONFIG;
}

export function saveSalonConfig(config: SalonConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save salon config:', e);
  }
}

export function loadServices(): SalonService[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load services:', e);
  }
  return DEFAULT_SERVICES;
}

export function saveServices(services: SalonService[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  } catch (e) {
    console.error('Failed to save services:', e);
  }
}

export function loadVisits(): VisitRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VISITS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load visits:', e);
  }
  return SAMPLE_VISITS;
}

export function saveVisits(visits: VisitRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  } catch (e) {
    console.error('Failed to save visits:', e);
  }
}

export function loadInquiries(): InquiryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load inquiries:', e);
  }
  return SAMPLE_INQUIRIES;
}

export function saveInquiries(inquiries: InquiryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  } catch (e) {
    console.error('Failed to save inquiries:', e);
  }
}

export function generateNextInvoiceNo(visits: VisitRecord[]): string {
  if (visits.length === 0) return 'HP-1001';
  const numbers = visits
    .map((v) => {
      const match = v.invoiceNo?.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
  return `HP-${max + 1}`;
}
