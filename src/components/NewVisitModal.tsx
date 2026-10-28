import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Phone, User, MapPin, Send, Check, Sparkles, MessageSquare, Smartphone, Tag, Edit3 } from 'lucide-react';
import { SalonService, SelectedServiceItem, VisitRecord, SalonConfig } from '../types';
import { getTodayDateStr, getNowDateTimeStr } from '../utils/storage';
import { openWhatsApp, openSMS, createBillWhatsAppMessage, createBillSMSMessage } from '../utils/messaging';
import { playSuccessChime } from '../utils/sound';
import confetti from 'canvas-confetti';

interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: VisitRecord, sendMode: 'none' | 'whatsapp' | 'sms' | 'both') => void;
  servicesCatalog: SalonService[];
  salonConfig: SalonConfig;
  existingCustomers: { name: string; phone: string; address: string }[];
  initialData?: Partial<VisitRecord>;
  onOpenServicesManager: () => void;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  servicesCatalog,
  salonConfig,
  existingCustomers,
  initialData,
  onOpenServicesManager,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Khushalpur, Moradabad');
  const [visitDateTime, setVisitDateTime] = useState(getNowDateTimeStr());
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'pending'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [nextDueDate, setNextDueDate] = useState(getTodayDateStr(salonConfig.defaultNextDueDays || 25));
  const [reminderDate, setReminderDate] = useState(getTodayDateStr((salonConfig.defaultNextDueDays || 25) - 1));
  const [notes, setNotes] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<{ name: string; phone: string; address: string }[]>([]);

  // Calculate totals
  const subTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const finalAmount = Math.max(0, subTotal - (discount || 0));
  const dueAmount = Math.max(0, finalAmount - (paidAmount || 0));

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCustomerName(initialData.customerName || '');
        setPhone(initialData.phone || '');
        setAddress(initialData.address || 'Khushalpur, Moradabad');
        setVisitDateTime(initialData.visitDateTime || getNowDateTimeStr());
        setSelectedServices(initialData.services || []);
        setDiscount(initialData.discount || 0);
        setPaymentMode(initialData.paymentMode || 'cash');
        setPaidAmount(initialData.paidAmount ?? 0);
        setNextDueDate(initialData.nextDueDate || getTodayDateStr(salonConfig.defaultNextDueDays || 25));
        setReminderDate(initialData.reminderDate || getTodayDateStr((salonConfig.defaultNextDueDays || 25) - 1));
        setNotes(initialData.notes || '');
      } else {
        setCustomerName('');
        setPhone('');
        setAddress('Khushalpur, Moradabad');
        setVisitDateTime(getNowDateTimeStr());
        setSelectedServices([]);
        setCustomServiceName('');
        setCustomServicePrice('');
        setDiscount(0);
        setPaymentMode('cash');
        setPaidAmount(0);
        setNextDueDate(getTodayDateStr(salonConfig.defaultNextDueDays || 25));
        setReminderDate(getTodayDateStr((salonConfig.defaultNextDueDays || 25) - 1));
        setNotes('');
      }
    }
  }, [isOpen, initialData, salonConfig]);

  // Keep paid amount updated with final amount by default unless paymentMode is pending
  useEffect(() => {
    if (paymentMode === 'pending') {
      setPaidAmount(0);
    } else {
      setPaidAmount(finalAmount);
    }
  }, [finalAmount, paymentMode]);

  // Handle phone auto-lookup
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      const match = existingCustomers.find((c) => c.phone.includes(cleaned));
      if (match && !customerName) {
        setCustomerName(match.name);
        if (match.address) setAddress(match.address);
      }
    }
  };

  // Handle customer name change and suggestions
  const handleNameChange = (val: string) => {
    setCustomerName(val);
    if (val.trim().length >= 2) {
      const matches = existingCustomers.filter((c) =>
        c.name.toLowerCase().includes(val.toLowerCase())
      );
      setNameSuggestions(matches.slice(0, 3));
    } else {
      setNameSuggestions([]);
    }
  };

  const applyCustomer = (cust: { name: string; phone: string; address: string }) => {
    setCustomerName(cust.name);
    setPhone(cust.phone);
    if (cust.address) setAddress(cust.address);
    setNameSuggestions([]);
  };

  const toggleCatalogService = (srv: SalonService) => {
    const existingIndex = selectedServices.findIndex((s) => s.id === srv.id);
    if (existingIndex >= 0) {
      setSelectedServices(selectedServices.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedServices([...selectedServices, { id: srv.id, name: srv.name, price: srv.price }]);
    }
  };

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    const updated = [...selectedServices];
    updated[index].price = Math.max(0, newPrice);
    setSelectedServices(updated);
  };

  const handleAddCustomService = () => {
    if (!customServiceName.trim()) return;
    const price = parseFloat(customServicePrice) || 0;
    const customItem: SelectedServiceItem = {
      id: `custom-${Date.now()}`,
      name: customServiceName.trim(),
      price: price,
    };
    setSelectedServices([...selectedServices, customItem]);
    setCustomServiceName('');
    setCustomServicePrice('');
  };

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const setDuePreset = (days: number) => {
    const nextDate = getTodayDateStr(days);
    setNextDueDate(nextDate);
    setReminderDate(getTodayDateStr(Math.max(0, days - 1)));
  };

  const handleSubmit = (sendMode: 'none' | 'whatsapp' | 'sms' | 'both') => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number for WhatsApp / SMS');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Please select at least one salon service');
      return;
    }

    const newVisit: VisitRecord = {
      id: initialData?.id || `vis-${Date.now()}`,
      invoiceNo: initialData?.invoiceNo || '',
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Khushalpur, Moradabad',
      visitDateTime: visitDateTime,
      services: selectedServices,
      totalAmount: subTotal,
      discount: discount || 0,
      finalAmount: finalAmount,
      paymentMode: paymentMode,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      nextDueDate: nextDueDate,
      reminderDate: reminderDate,
      reminderSent: false,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
    };

    playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    onSave(newVisit, sendMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Customer Visit & Bill' : 'New Customer Visit & Bill'}
              </h2>
              <p className="text-xs text-slate-400">
                {salonConfig.name} • {salonConfig.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          
          {/* Customer Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Name */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rohit Sharma"
                value={customerName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white placeholder-slate-500 text-sm outline-none transition"
              />
              {/* Autocomplete suggestion drop */}
              {nameSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-1.5 text-[11px] text-amber-400 font-semibold bg-slate-900/60">
                    Existing Customer Auto-Fill:
                  </div>
                  {nameSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => applyCustomer(sug)}
                      className="px-3 py-2 text-xs hover:bg-slate-700 cursor-pointer flex justify-between items-center text-slate-200"
                    >
                      <span className="font-medium">{sug.name}</span>
                      <span className="text-slate-400">{sug.phone} • {sug.address}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Mobile Number (WhatsApp & SMS) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit number (e.g. 9876543210)"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500 text-sm outline-none transition"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Customer Address / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Khushalpur, Civil Lines, Kanth Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-amber-400 text-white placeholder-slate-500 text-sm outline-none transition"
              />
            </div>

            {/* Visit Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Visit Date & Arrival Time
              </label>
              <input
                type="datetime-local"
                value={visitDateTime}
                onChange={(e) => setVisitDateTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-blue-400 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Services Selection with editable charges */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 tracking-wide uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Select Services & Charges
              </span>
              <button
                type="button"
                onClick={onOpenServicesManager}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit Rates / Add Service
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {servicesCatalog.map((srv) => {
                const isSelected = selectedServices.some((s) => s.id === srv.id);
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => toggleCatalogService(srv)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <span>{srv.name}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700/60 text-amber-300'
                    }`}>
                      ₹{srv.price}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom service addition input */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <input
                type="text"
                placeholder="+ Add custom service (e.g. Special Hair Wax, Beard Dye)"
                value={customServiceName}
                onChange={(e) => setCustomServiceName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none"
              />
              <div className="w-28 relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="Charge"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomService}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition shrink-0"
              >
                + Add
              </button>
            </div>

            {/* Selected items list with editable charge input */}
            {selectedServices.length > 0 && (
              <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                  <span>Selected for Bill (Charges can be adjusted for this visit):</span>
                  <span>{selectedServices.length} items</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedServices.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <span className="text-slate-200 font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-amber-400 font-bold text-xs outline-none focus:border-amber-400 text-right"
                          title="Modify charge for this customer"
                        />
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Payment Section */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3.5">
            <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
              Bill Calculation & Payment Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Subtotal */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400">Subtotal</div>
                <div className="text-xl font-bold text-white mt-1">₹{subTotal}</div>
              </div>

              {/* Discount */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-[11px] text-slate-400 block">Discount (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-semibold outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Final Net Amount */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30">
                <div className="text-[11px] text-amber-300 font-semibold">Net Final Bill</div>
                <div className="text-2xl font-black text-amber-400 mt-1">₹{finalAmount}</div>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: '💵 Cash' },
                  { id: 'upi', label: '📱 UPI / GPay' },
                  { id: 'card', label: '💳 Card' },
                  { id: 'pending', label: '⏳ Pending / Due' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                      paymentMode === mode.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If pending */}
            {paymentMode === 'pending' && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-300 flex justify-between items-center">
                <span>Recorded as Outstanding Due:</span>
                <span className="font-bold text-red-400 text-sm">₹{finalAmount} (Pending)</span>
              </div>
            )}
          </div>

          {/* Next Due Date & Reminder Settings */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                Next Visit Due Date & Grooming Reminder
              </span>
              <span className="text-[11px] text-slate-400">
                Timely follow-up for next hair cut
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400">Schedule:</span>
              {[
                { days: 15, label: '15 Days' },
                { days: 20, label: '20 Days' },
                { days: 25, label: '25 Days (Standard)' },
                { days: 30, label: '1 Month (30 Days)' },
                { days: 45, label: '45 Days' },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setDuePreset(preset.days)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  📅 Recommended Next Due Date
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  🔔 Reminder Notification Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Notes / Special Request
            </label>
            <input
              type="text"
              placeholder="e.g. Hair color shade 4.0, recommend hair spa next month..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-amber-400 text-white placeholder-slate-500 text-xs outline-none transition"
            />
          </div>

        </div>

        {/* Footer Actions with WhatsApp & SMS options */}
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 sticky bottom-0 z-10">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Total Payable: <strong className="text-amber-400 font-bold text-sm">₹{finalAmount}</strong>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('none')}
              className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
            >
              Save Only
            </button>

            {/* Direct Instant SMS option */}
            <button
              type="button"
              onClick={() => handleSubmit('sms')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/20 active:scale-95 transition"
              title="Send mobile text message (SMS)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Save & Send SMS</span>
            </button>

            {/* Direct WhatsApp option */}
            <button
              type="button"
              onClick={() => handleSubmit('whatsapp')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 active:scale-95 transition"
              title="Send WhatsApp Bill"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Bill</span>
            </button>

            {/* Send Both */}
            <button
              type="button"
              onClick={() => handleSubmit('both')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md active:scale-95 transition"
              title="Send both WhatsApp and Text Message"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp + SMS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
