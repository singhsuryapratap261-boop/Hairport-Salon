import React, { useState } from 'react';
import { X, Clock, User, Phone, MapPin, Bell } from 'lucide-react';
import { InquiryRecord, SalonConfig } from '../types';
import { getTodayDateStr } from '../utils/storage';
import { formatFriendlyDate, openWhatsApp, openSMS } from '../utils/messaging';
import { playSuccessChime } from '../utils/sound';

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inquiry: InquiryRecord, sendInstantMode?: 'none' | 'whatsapp' | 'sms') => void;
  salonConfig: SalonConfig;
  existingCustomers: { name: string; phone: string; address: string }[];
}

export const NewInquiryModal: React.FC<NewInquiryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  salonConfig,
  existingCustomers,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Khushalpur, Moradabad');
  const [serviceRequired, setServiceRequired] = useState('Hair Cut & Grooming');
  const [presetDays, setPresetDays] = useState(3); // 3 days default as requested
  const [followUpDate, setFollowUpDate] = useState(getTodayDateStr(3));
  const [notes, setNotes] = useState('Customer asked for a reminder after 3 days');

  const POPULAR_INQUIRY_SERVICES = [
    'Hair Cut & Grooming',
    'Keratin Treatment',
    'Royal Groom Package',
    'Hair Spa & D-Tan Face Pack',
    'Gold / Diamond Facial',
    'Hair Color & Highlights',
    'Hair Smoothening / Straightening',
    'Beard Styling & Shave',
  ];

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

  const handlePresetSelect = (days: number) => {
    setPresetDays(days);
    setFollowUpDate(getTodayDateStr(days));
    if (days === 3) {
      setNotes('Customer asked for a reminder after 3 days');
    } else if (days === 1) {
      setNotes('Customer asked for a reminder tomorrow');
    } else {
      setNotes(`Customer asked for a reminder after ${days} days`);
    }
  };

  const handleCustomDateChange = (val: string) => {
    setFollowUpDate(val);
    setPresetDays(0);
  };

  const handleSubmit = (sendInstantMode: 'none' | 'whatsapp' | 'sms' = 'none') => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const newInquiry: InquiryRecord = {
      id: `inq-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Khushalpur, Moradabad',
      serviceRequired: serviceRequired.trim(),
      inquiryDate: getTodayDateStr(0),
      followUpDate: followUpDate,
      presetDays: presetDays,
      notes: notes.trim(),
      status: 'pending',
      createdAt: Date.now(),
    };

    playSuccessChime();
    onSave(newInquiry, sendInstantMode);

    if (sendInstantMode === 'whatsapp') {
      const msg = `*✂️ ${salonConfig.name.toUpperCase()} ✂️*\nHello *${newInquiry.customerName}*! 👋\nThank you for inquiring about ${newInquiry.serviceRequired}. We have noted your request and will remind you on *${formatFriendlyDate(newInquiry.followUpDate)}*.\n📞 Call: ${salonConfig.phone}\n📍 ${salonConfig.address}`;
      openWhatsApp(newInquiry.phone, msg);
    } else if (sendInstantMode === 'sms') {
      const smsMsg = `${salonConfig.name.toUpperCase()}: Hello ${newInquiry.customerName}, your inquiry for ${newInquiry.serviceRequired} is recorded. We will remind you on ${formatFriendlyDate(newInquiry.followUpDate)}. Ph: ${salonConfig.phone}`;
      openSMS(newInquiry.phone, smsMsg);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <span>Customer Inquiry & 3-Day Reminder</span>
              </h2>
              <p className="text-xs text-slate-400">
                Log customer requests to receive automated reminder alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Mobile Number *
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Address / Locality (Moradabad)
              </label>
              <input
                type="text"
                placeholder="e.g. Khushalpur / Civil Lines"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Service Inquired */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Service Inquired About
            </label>
            <input
              type="text"
              value={serviceRequired}
              onChange={(e) => setServiceRequired(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs mb-2 outline-none focus:border-emerald-400"
              placeholder="Enter service..."
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_INQUIRY_SERVICES.map((srv, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setServiceRequired(srv)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    serviceRequired === srv
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {srv}
                </button>
              ))}
            </div>
          </div>

          {/* When to remind (User Requirement: 3 days reminder) */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                When did the customer ask to be reminded?
              </label>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect(3)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                  presetDays === 3
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>⭐ 3 Days Later</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect(1)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border ${
                  presetDays === 1
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Tomorrow (1 Day)
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect(2)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border ${
                  presetDays === 2
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                2 Days Later
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect(5)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border ${
                  presetDays === 5
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                5 Days Later
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect(7)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border ${
                  presetDays === 7
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                1 Week Later
              </button>

              <div className="relative">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => handleCustomDateChange(e.target.value)}
                  className="w-full py-2 px-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-400"
                  title="Pick custom date"
                />
              </div>
            </div>

            {/* Clear date info confirmation */}
            <div className="text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
              <span>📅 Scheduled Reminder Date:</span>
              <strong className="text-emerald-400 font-bold">
                {formatFriendlyDate(followUpDate)}
              </strong>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Note / Special Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Free on Sunday afternoon, call or WhatsApp to confirm timing..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs outline-none focus:border-emerald-400"
            />
          </div>

        </div>

        {/* Footer Actions with WhatsApp / SMS confirmation */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => handleSubmit('none')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Save Inquiry</span>
          </button>
        </div>

      </div>
    </div>
  );
};
