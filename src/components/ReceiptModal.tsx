import React, { useState } from 'react';
import { X, Printer, MessageSquare, Copy, Check, Scissors, Smartphone } from 'lucide-react';
import { VisitRecord, SalonConfig } from '../types';
import { formatFriendlyDate, formatFriendlyDateTime, openWhatsApp, openSMS, createBillWhatsAppMessage, createBillSMSMessage } from '../utils/messaging';

interface ReceiptModalProps {
  visit: VisitRecord | null;
  salonConfig: SalonConfig;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visit,
  salonConfig,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!visit) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const msg = createBillWhatsAppMessage(visit, salonConfig);
    openWhatsApp(visit.phone, msg);
  };

  const handleSMS = () => {
    const msg = createBillSMSMessage(visit, salonConfig);
    openSMS(visit.phone, msg);
  };

  const handleCopy = () => {
    const msg = createBillWhatsAppMessage(visit, salonConfig);
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate UPI QR link if salon has UPI ID
  const upiQrUrl = salonConfig.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
        `upi://pay?pa=${salonConfig.upiId}&pn=${encodeURIComponent(salonConfig.name)}&am=${visit.finalAmount}&cu=INR`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl text-slate-100 overflow-hidden flex flex-col">
        
        {/* Header - Not printed */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between no-print">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Customer Invoice / Digital Bill</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Printable Slip / Receipt Body */}
        <div className="p-6 bg-white text-slate-900 font-sans space-y-4 max-h-[75vh] overflow-y-auto" id="printable-receipt">
          
          {/* Salon Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              {salonConfig.name}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {salonConfig.tagline || 'Premium Hair Styling, Beard Grooming & Skin Care'}
            </p>
            <div className="text-[11px] text-slate-600 mt-1 font-medium">
              📍 {salonConfig.address}
            </div>
            <div className="text-[12px] font-bold text-slate-900 mt-0.5">
              📞 Phone: {salonConfig.phone}
            </div>
          </div>

          {/* Invoice details */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Invoice Number:</span>
              <span className="font-bold font-mono text-slate-900">#{visit.invoiceNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Date & Time:</span>
              <span className="font-semibold text-slate-800">{formatFriendlyDateTime(visit.visitDateTime)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Customer:</span>
              <span className="font-bold text-slate-900">{visit.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Mobile:</span>
              <span className="font-semibold text-slate-800">{visit.phone}</span>
            </div>
            {visit.address && (
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">Address:</span>
                <span className="text-slate-700">{visit.address}</span>
              </div>
            )}
          </div>

          {/* Itemized Services Table */}
          <div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600">
                  <th className="text-left py-1.5 font-bold">Service</th>
                  <th className="text-right py-1.5 font-bold">Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visit.services.map((item, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-1.5">{item.name}</td>
                    <td className="text-right py-1.5 font-semibold">₹{item.price}</td>
                  </tr>
                ))}
                {visit.customServiceDescription && (
                  <tr className="text-slate-800">
                    <td className="py-1.5">{visit.customServiceDescription}</td>
                    <td className="text-right py-1.5">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total & Payment details */}
          <div className="pt-2 border-t-2 border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{visit.totalAmount}</span>
            </div>
            {visit.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>- ₹{visit.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Final Net Amount:</span>
              <span className="text-lg">₹{visit.finalAmount}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase">
                {visit.paymentMode === 'cash'
                  ? 'Cash'
                  : visit.paymentMode === 'upi'
                  ? 'UPI / Online'
                  : visit.paymentMode === 'card'
                  ? 'Card'
                  : 'Pending / Due'}
              </span>
            </div>
            {visit.dueAmount > 0 && (
              <div className="flex justify-between text-xs text-red-600 font-bold">
                <span>Outstanding Balance:</span>
                <span>₹{visit.dueAmount}</span>
              </div>
            )}
          </div>

          {/* Next Due Date Note */}
          {visit.nextDueDate && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
              <span className="text-slate-600 block text-[11px]">Recommended Routine Maintenance:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatFriendlyDate(visit.nextDueDate)}
              </span>
            </div>
          )}

          {/* UPI QR Code for quick scan */}
          {upiQrUrl && (
            <div className="text-center pt-1 no-print">
              <div className="inline-block p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <img src={upiQrUrl} alt="UPI QR" className="w-24 h-24 mx-auto" />
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  Scan to Pay: {salonConfig.upiId}
                </span>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-700">Thank you for visiting Hairport Salon!</p>
            <p>Khushalpur Chauraha, Moradabad • Have a wonderful day! ✨</p>
          </div>

        </div>

        {/* Modal Buttons Footer - Not printed */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 no-print">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleSMS}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
              title="Send mobile text message (SMS)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send SMS</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition"
              title="Send invoice via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
