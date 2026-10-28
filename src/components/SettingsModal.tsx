import React, { useState } from 'react';
import { X, Settings, Scissors, Download, Upload, Plus, Trash2, Check, RefreshCw, FileSpreadsheet, Tag } from 'lucide-react';
import { SalonConfig, SalonService, VisitRecord, InquiryRecord } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SalonConfig;
  onSaveConfig: (updated: SalonConfig) => void;
  services: SalonService[];
  onSaveServices: (updated: SalonService[]) => void;
  visits: VisitRecord[];
  inquiries: InquiryRecord[];
  onRestoreAllData: (data: { config: SalonConfig; services: SalonService[]; visits: VisitRecord[]; inquiries: InquiryRecord[] }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  services,
  onSaveServices,
  visits,
  inquiries,
  onRestoreAllData,
}) => {
  const [tab, setTab] = useState<'salon' | 'services' | 'backup'>('salon');

  // Salon form state
  const [salonName, setSalonName] = useState(config.name);
  const [phone, setPhone] = useState(config.phone);
  const [address, setAddress] = useState(config.address);
  const [tagline, setTagline] = useState(config.tagline);
  const [upiId, setUpiId] = useState(config.upiId);
  const [defaultDays, setDefaultDays] = useState(config.defaultNextDueDays || 25);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New service state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<SalonService['category']>('hair');

  if (!isOpen) return null;

  const handleSaveSalonConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      name: salonName.trim() || 'Hairport Salon Moradabad',
      phone: phone.trim() || '9068505502',
      address: address.trim() || 'Khushalpur Chauraha, Near Bread Factory, Moradabad - 244001',
      tagline: tagline.trim(),
      upiId: upiId.trim(),
      defaultNextDueDays: Number(defaultDays) || 25,
      reminderBeforeDays: 1,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const price = parseFloat(newServicePrice) || 100;
    const newSrv: SalonService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      price: price,
      category: newServiceCategory,
    };
    onSaveServices([...services, newSrv]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleDeleteService = (id: string) => {
    onSaveServices(services.filter((s) => s.id !== id));
  };

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      config,
      services,
      visits,
      inquiries,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hairport_Salon_Moradabad_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['InvoiceNo', 'CustomerName', 'Phone', 'Address', 'VisitDateTime', 'Services', 'TotalAmount', 'Discount', 'FinalAmount', 'PaymentMode', 'NextDueDate', 'Notes'];
    const rows = visits.map((v) => [
      `"${v.invoiceNo}"`,
      `"${v.customerName.replace(/"/g, '""')}"`,
      `"${v.phone}"`,
      `"${(v.address || '').replace(/"/g, '""')}"`,
      `"${v.visitDateTime}"`,
      `"${v.services.map((s) => s.name).join('; ')}"`,
      v.totalAmount,
      v.discount,
      v.finalAmount,
      v.paymentMode,
      `"${v.nextDueDate || ''}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hairport_Salon_Visits_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.visits && parsed.config) {
          onRestoreAllData({
            config: parsed.config,
            services: parsed.services || services,
            visits: parsed.visits || [],
            inquiries: parsed.inquiries || [],
          });
          alert('Data restored successfully!');
          onClose();
        } else {
          alert('Invalid backup file');
        }
      } catch (err) {
        alert('Error reading backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Salon Settings & Data Backup</h3>
              <p className="text-xs text-slate-400">{config.name} • Moradabad</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setTab('salon')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              tab === 'salon'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Salon Profile
          </button>
          <button
            onClick={() => setTab('services')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              tab === 'services'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Services & Charges ({services.length})
          </button>
          <button
            onClick={() => setTab('backup')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              tab === 'backup'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Excel (CSV)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: Salon Profile */}
          {tab === 'salon' && (
            <form onSubmit={handleSaveSalonConfig} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Salon Name
                </label>
                <input
                  type="text"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    UPI ID (For bill QR payment)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9068505502@upi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Default Haircut Cycle (Days)
                </label>
                <input
                  type="number"
                  value={defaultDays}
                  onChange={(e) => setDefaultDays(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Settings Saved!
                  </span>
                ) : <span />}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Services Catalog */}
          {tab === 'services' && (
            <div className="space-y-4">
              {/* Add New Service Form */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  + Add New Service
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Service Name (e.g. Beard Dye)"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Charge (₹)"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition"
                >
                  + Add to Service Catalog
                </button>
              </div>

              {/* Service list items */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs"
                  >
                    <span className="font-medium text-slate-200">{srv.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400">₹{srv.price}</span>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                        title="Delete service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Backup & CSV Export */}
          {tab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase">
                  Secure Data Backup & Export
                </h4>
                <p className="text-xs text-slate-400">
                  Export all client visit diaries, bills, and inquiries to your phone or computer.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Backup (JSON)</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export Excel Sheet (CSV)</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase">
                  Restore Previous Backup
                </h4>
                <p className="text-xs text-slate-400">
                  Restore all salon data if switching devices.
                </p>
                <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span>Select Backup File (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
