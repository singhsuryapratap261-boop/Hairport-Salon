/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Scissors,
  CalendarCheck,
  Clock,
  Users,
  Settings,
  Plus,
  Bell,
  Search,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import {
  SalonConfig,
  SalonService,
  VisitRecord,
  InquiryRecord,
} from './types';
import {
  loadSalonConfig,
  saveSalonConfig,
  loadServices,
  saveServices,
  loadVisits,
  saveVisits,
  loadInquiries,
  saveInquiries,
  generateNextInvoiceNo,
  getTodayDateStr,
} from './utils/storage';
import {
  openWhatsApp,
  openSMS,
  createBillWhatsAppMessage,
  createBillSMSMessage,
} from './utils/messaging';
import { playReminderChime } from './utils/sound';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { VisitsList } from './components/VisitsList';
import { InquiriesList } from './components/InquiriesList';
import { CustomerDirectory } from './components/CustomerDirectory';
import { NewVisitModal } from './components/NewVisitModal';
import { NewInquiryModal } from './components/NewInquiryModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SettingsModal } from './components/SettingsModal';
import { ServicesManagerModal } from './components/ServicesManagerModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MonthlyRevenueChart } from './components/MonthlyRevenueChart';

export default function App() {
  const [config, setConfig] = useState<SalonConfig>(loadSalonConfig);
  const [services, setServices] = useState<SalonService[]>(loadServices);
  const [visits, setVisits] = useState<VisitRecord[]>(loadVisits);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(loadInquiries);

  // Active navigation tab: 'visits' | 'inquiries' | 'customers'
  const [activeTab, setActiveTab] = useState<'visits' | 'inquiries' | 'customers'>('visits');
  const [visitsDateFilter, setVisitsDateFilter] = useState<'all' | 'today'>('all');

  // Modals
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [selectedReceiptVisit, setSelectedReceiptVisit] = useState<VisitRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isServicesManagerOpen, setIsServicesManagerOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);

  // Prefill visit modal from inquiry conversion or returning customer
  const [visitInitialData, setVisitInitialData] = useState<Partial<VisitRecord> | undefined>(undefined);

  const todayStr = getTodayDateStr(0);

  // Calculate due reminders
  const dueInquiriesCount = useMemo(() => {
    return inquiries.filter(
      (inq) => inq.status === 'pending' && inq.followUpDate <= todayStr
    ).length;
  }, [inquiries, todayStr]);

  const dueVisitsCount = useMemo(() => {
    return visits.filter(
      (v) => v.nextDueDate && v.nextDueDate <= todayStr && !v.reminderSent
    ).length;
  }, [visits, todayStr]);

  const totalDueReminders = dueInquiriesCount + dueVisitsCount;

  // Sound chime once if reminders are due
  useEffect(() => {
    if (dueInquiriesCount > 0) {
      const timer = setTimeout(() => {
        playReminderChime();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dueInquiriesCount]);

  // Existing customer list for instant autocomplete
  const existingCustomers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; address: string }>();
    visits.forEach((v) => {
      if (v.phone && !map.has(v.phone)) {
        map.set(v.phone, {
          name: v.customerName,
          phone: v.phone,
          address: v.address || 'Khushalpur, Moradabad',
        });
      }
    });
    inquiries.forEach((inq) => {
      if (inq.phone && !map.has(inq.phone)) {
        map.set(inq.phone, {
          name: inq.customerName,
          phone: inq.phone,
          address: inq.address || 'Khushalpur, Moradabad',
        });
      }
    });
    return Array.from(map.values());
  }, [visits, inquiries]);

  // Handlers for Visits
  const handleSaveVisit = (visit: VisitRecord, sendMode: 'none' | 'whatsapp' | 'sms' | 'both') => {
    let updatedVisits: VisitRecord[];

    if (editingVisit) {
      updatedVisits = visits.map((v) => (v.id === visit.id ? visit : v));
      setEditingVisit(null);
    } else {
      const invoiceNo = generateNextInvoiceNo(visits);
      const newRecord = { ...visit, invoiceNo };
      updatedVisits = [newRecord, ...visits];

      // If this visit was created from an inquiry, mark the inquiry as converted
      if (visitInitialData?.customerName) {
        setInquiries((prevInq) => {
          const updated = prevInq.map((inq) => {
            if (inq.phone === visit.phone && inq.status === 'pending') {
              return { ...inq, status: 'converted' as const, convertedVisitId: newRecord.id };
            }
            return inq;
          });
          saveInquiries(updated);
          return updated;
        });
      }

      // Handle delivery: WhatsApp and/or SMS
      if (sendMode === 'whatsapp' || sendMode === 'both') {
        const msg = createBillWhatsAppMessage(newRecord, config);
        openWhatsApp(newRecord.phone, msg);
      }
      if (sendMode === 'sms' || sendMode === 'both') {
        const smsMsg = createBillSMSMessage(newRecord, config);
        openSMS(newRecord.phone, smsMsg);
      }
    }

    setVisits(updatedVisits);
    saveVisits(updatedVisits);
    setVisitInitialData(undefined);
  };

  const handleDeleteVisit = (id: string) => {
    const updated = visits.filter((v) => v.id !== id);
    setVisits(updated);
    saveVisits(updated);
  };

  const handleEditVisit = (visit: VisitRecord) => {
    setEditingVisit(visit);
    setVisitInitialData(visit);
    setIsNewVisitOpen(true);
  };

  // Handlers for Inquiries
  const handleSaveInquiry = (inquiry: InquiryRecord) => {
    const updated = [inquiry, ...inquiries];
    setInquiries(updated);
    saveInquiries(updated);
  };

  const handleUpdateInquiry = (updatedInq: InquiryRecord) => {
    const updated = inquiries.map((inq) => (inq.id === updatedInq.id ? updatedInq : inq));
    setInquiries(updated);
    saveInquiries(updated);
  };

  const handleDeleteInquiry = (id: string) => {
    const updated = inquiries.filter((inq) => inq.id !== id);
    setInquiries(updated);
    saveInquiries(updated);
  };

  const handleConvertInquiryToVisit = (inq: InquiryRecord) => {
    setVisitInitialData({
      customerName: inq.customerName,
      phone: inq.phone,
      address: inq.address || 'Khushalpur, Moradabad',
      notes: `From Inquiry: ${inq.serviceRequired} (${inq.notes || ''})`,
    });
    setEditingVisit(null);
    setIsNewVisitOpen(true);
  };

  const handleCustomerSelectForVisit = (cust: { name: string; phone: string; address: string }) => {
    setVisitInitialData({
      customerName: cust.name,
      phone: cust.phone,
      address: cust.address,
    });
    setEditingVisit(null);
    setIsNewVisitOpen(true);
  };

  // Handlers for Settings & Services
  const handleSaveConfig = (updated: SalonConfig) => {
    setConfig(updated);
    saveSalonConfig(updated);
  };

  const handleSaveServices = (updated: SalonService[]) => {
    setServices(updated);
    saveServices(updated);
  };

  const handleRestoreAllData = (data: {
    config: SalonConfig;
    services: SalonService[];
    visits: VisitRecord[];
    inquiries: InquiryRecord[];
  }) => {
    setConfig(data.config);
    saveSalonConfig(data.config);
    setServices(data.services);
    saveServices(data.services);
    setVisits(data.visits);
    saveVisits(data.visits);
    setInquiries(data.inquiries);
    saveInquiries(data.inquiries);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Main Header */}
      <Header
        config={config}
        todayRemindersCount={totalDueReminders}
        onOpenNewVisit={() => {
          setVisitInitialData(undefined);
          setEditingVisit(null);
          setIsNewVisitOpen(true);
        }}
        onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenServicesManager={() => setIsServicesManagerOpen(true)}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
        onNavigateToReminders={() => setActiveTab('inquiries')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Top Stats Overview */}
        <StatsOverview
          visits={visits}
          inquiries={inquiries}
          onFilterTodayVisits={() => {
            setActiveTab('visits');
            setVisitsDateFilter('today');
          }}
          onFilterDueInquiries={() => {
            setActiveTab('inquiries');
          }}
        />

        {/* Monthly Revenue Overview Chart */}
        <MonthlyRevenueChart visits={visits} />

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 my-5 gap-1 sm:gap-4 overflow-x-auto">
          {/* Tab 1: Visits Register */}
          <button
            onClick={() => setActiveTab('visits')}
            className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'visits'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Daily Visits & Billing Register</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-800 text-slate-300">
              {visits.length}
            </span>
          </button>

          {/* Tab 2: 3-Day Reminders & Inquiries */}
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap relative ${
              activeTab === 'inquiries'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3-Day Reminders & Inquiries</span>
            {dueInquiriesCount > 0 ? (
              <span className="px-2 py-0.2 rounded-full text-[11px] font-extrabold bg-red-500 text-white animate-pulse">
                {dueInquiriesCount} Due
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-800 text-slate-300">
                {inquiries.length}
              </span>
            )}
          </button>

          {/* Tab 3: Customer Directory */}
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'customers'
                ? 'border-blue-400 text-blue-400 bg-blue-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Directory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-800 text-slate-300">
              {existingCustomers.length}
            </span>
          </button>
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === 'visits' && (
            <VisitsList
              visits={visits}
              salonConfig={config}
              onEditVisit={handleEditVisit}
              onDeleteVisit={handleDeleteVisit}
              onViewReceipt={(visit) => setSelectedReceiptVisit(visit)}
              onOpenNewVisit={() => {
                setVisitInitialData(undefined);
                setEditingVisit(null);
                setIsNewVisitOpen(true);
              }}
              initialDateFilter={visitsDateFilter}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesList
              inquiries={inquiries}
              salonConfig={config}
              onUpdateInquiry={handleUpdateInquiry}
              onDeleteInquiry={handleDeleteInquiry}
              onConvertToVisit={handleConvertInquiryToVisit}
              onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerDirectory
              visits={visits}
              salonConfig={config}
              onSelectCustomerForNewVisit={handleCustomerSelectForVisit}
            />
          )}
        </div>

      </main>

      {/* Floating Quick Action Buttons on Mobile */}
      <div className="fixed bottom-5 right-5 z-20 sm:hidden flex flex-col gap-2">
        <button
          onClick={() => setIsServicesManagerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center shadow-lg active:scale-90 transition"
          title="Edit Services & Charges"
        >
          <Tag className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsNewInquiryOpen(true)}
          className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition"
          title="3-Day Reminder"
        >
          <Clock className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setVisitInitialData(undefined);
            setEditingVisit(null);
            setIsNewVisitOpen(true);
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xl shadow-amber-500/30 active:scale-90 transition"
          title="New Bill"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Footer Branding with Updated Address */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="font-bold text-slate-200">{config.name}</span>
            <span>•</span>
            <span className="text-slate-300">{config.address}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Call / WhatsApp: <a href={`tel:${config.phone}`} className="text-amber-400 hover:underline">{config.phone}</a></span>
            <span>•</span>
            <button
              onClick={() => setIsServicesManagerOpen(true)}
              className="text-amber-400/90 hover:text-amber-300 transition underline"
            >
              Services & Rates
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white transition"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewVisitModal
        isOpen={isNewVisitOpen}
        onClose={() => {
          setIsNewVisitOpen(false);
          setEditingVisit(null);
          setVisitInitialData(undefined);
        }}
        onSave={handleSaveVisit}
        servicesCatalog={services}
        salonConfig={config}
        existingCustomers={existingCustomers}
        initialData={visitInitialData}
        onOpenServicesManager={() => setIsServicesManagerOpen(true)}
      />

      <NewInquiryModal
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
        onSave={handleSaveInquiry}
        salonConfig={config}
        existingCustomers={existingCustomers}
      />

      <ReceiptModal
        visit={selectedReceiptVisit}
        salonConfig={config}
        onClose={() => setSelectedReceiptVisit(null)}
      />

      <ServicesManagerModal
        isOpen={isServicesManagerOpen}
        onClose={() => setIsServicesManagerOpen(false)}
        services={services}
        onSaveServices={handleSaveServices}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        services={services}
        onSaveServices={handleSaveServices}
        visits={visits}
        inquiries={inquiries}
        onRestoreAllData={handleRestoreAllData}
      />

      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
        appUrl={typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-zq3gfoj4prhxsnryigmmqw-507913161539.asia-northeast1.run.app'}
      />

    </div>
  );
}
