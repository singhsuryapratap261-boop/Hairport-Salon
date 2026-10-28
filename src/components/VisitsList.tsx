import React, { useState } from 'react';
import { Search, Filter, MessageSquare, Receipt, Edit2, Trash2, Calendar, Phone, MapPin, IndianRupee, Clock, Smartphone, Plus } from 'lucide-react';
import { VisitRecord, SalonConfig } from '../types';
import { formatFriendlyDate, formatFriendlyDateTime, openWhatsApp, openSMS, createBillWhatsAppMessage, createBillSMSMessage, createVisitDueReminderMessage, createVisitDueSMSMessage } from '../utils/messaging';
import { getTodayDateStr } from '../utils/storage';

interface VisitsListProps {
  visits: VisitRecord[];
  salonConfig: SalonConfig;
  onEditVisit: (visit: VisitRecord) => void;
  onDeleteVisit: (visitId: string) => void;
  onViewReceipt: (visit: VisitRecord) => void;
  onOpenNewVisit: () => void;
  initialDateFilter?: string;
}

export const VisitsList: React.FC<VisitsListProps> = ({
  visits,
  salonConfig,
  onEditVisit,
  onDeleteVisit,
  onViewReceipt,
  onOpenNewVisit,
  initialDateFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'yesterday' | 'month'>(
    initialDateFilter === 'today' ? 'today' : 'all'
  );
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'upi' | 'cash'>('all');

  const todayStr = getTodayDateStr(0);
  const yesterdayStr = getTodayDateStr(-1);
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  // Filter records
  const filteredVisits = visits.filter((visit) => {
    // Search query
    const searchMatch =
      visit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.phone.includes(searchTerm) ||
      (visit.address && visit.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      visit.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Period filter
    if (periodFilter === 'today' && !visit.visitDateTime.startsWith(todayStr)) return false;
    if (periodFilter === 'yesterday' && !visit.visitDateTime.startsWith(yesterdayStr)) return false;
    if (periodFilter === 'month' && !visit.visitDateTime.startsWith(currentMonthPrefix)) return false;

    // Payment mode filter
    if (paymentFilter === 'pending' && visit.paymentMode !== 'pending' && visit.dueAmount <= 0) return false;
    if (paymentFilter === 'upi' && visit.paymentMode !== 'upi') return false;
    if (paymentFilter === 'cash' && visit.paymentMode !== 'cash') return false;

    return true;
  });

  const handleSendWhatsAppBill = (visit: VisitRecord) => {
    const msg = createBillWhatsAppMessage(visit, salonConfig);
    openWhatsApp(visit.phone, msg);
  };

  const handleSendSMSBill = (visit: VisitRecord) => {
    const msg = createBillSMSMessage(visit, salonConfig);
    openSMS(visit.phone, msg);
  };

  const handleSendDueReminderWhatsApp = (visit: VisitRecord) => {
    const msg = createVisitDueReminderMessage(visit, salonConfig);
    openWhatsApp(visit.phone, msg);
  };

  const handleSendDueReminderSMS = (visit: VisitRecord) => {
    const msg = createVisitDueSMSMessage(visit, salonConfig);
    openSMS(visit.phone, msg);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, mobile, address, or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-amber-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                periodFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                periodFilter === 'today'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriodFilter('yesterday')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                periodFilter === 'yesterday'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                periodFilter === 'month'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Payment filter dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs outline-none focus:border-amber-400"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI / Online</option>
            <option value="pending">Pending / Due</option>
          </select>
        </div>
      </div>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
          <h3 className="text-base font-semibold text-slate-200">No visit records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log visits and generate bills using the New Customer Bill button.
          </p>
          <button
            onClick={onOpenNewVisit}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            + Create New Bill
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVisits.map((visit) => {
            const isDueToday = visit.nextDueDate && visit.nextDueDate <= todayStr;
            const isOverdue = visit.nextDueDate && visit.nextDueDate < todayStr;

            return (
              <div
                key={visit.id}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-sm space-y-3"
              >
                {/* Header row: Customer info + bill badges */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        #{visit.invoiceNo}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {visit.customerName}
                      </h3>
                      {visit.paymentMode === 'pending' || visit.dueAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          Due ₹{visit.dueAmount || visit.finalAmount}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Paid ({visit.paymentMode.toUpperCase()})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <a
                        href={`tel:${visit.phone}`}
                        className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{visit.phone}</span>
                      </a>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{visit.address || 'Khushalpur, Moradabad'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Visit Time: {formatFriendlyDateTime(visit.visitDateTime)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="sm:text-right">
                    <div className="text-xl sm:text-2xl font-black text-amber-400">
                      ₹{visit.finalAmount}
                    </div>
                    {visit.discount > 0 && (
                      <div className="text-[11px] text-slate-400 line-through">
                        Total: ₹{visit.totalAmount} (Disc: ₹{visit.discount})
                      </div>
                    )}
                  </div>
                </div>

                {/* Services Taken */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {visit.services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700/60"
                    >
                      <span>{srv.name}</span>
                      <span className="text-amber-400 font-semibold">₹{srv.price}</span>
                    </span>
                  ))}
                  {visit.customServiceDescription && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs border border-slate-700/60">
                      Other: {visit.customServiceDescription}
                    </span>
                  )}
                </div>

                {/* Next Due Date Banner & Notes */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📅 Recommended Next Due:</span>
                    <strong className={`font-semibold ${
                      isDueToday ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {formatFriendlyDate(visit.nextDueDate) || 'Not Scheduled'}
                    </strong>
                    {isDueToday && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {isOverdue ? 'Overdue' : 'Due Today'}
                      </span>
                    )}
                  </div>

                  {visit.notes && (
                    <div className="text-slate-400 italic truncate max-w-xs">
                      Note: {visit.notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons Row with WhatsApp & SMS buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Send WhatsApp Bill button */}
                    <button
                      onClick={() => handleSendWhatsAppBill(visit)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-900/20 transition active:scale-95"
                      title="Send complete invoice on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Bill</span>
                    </button>

                    {/* Send SMS Bill button */}
                    <button
                      onClick={() => handleSendSMSBill(visit)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-900/20 transition active:scale-95"
                      title="Send text message SMS to customer phone"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Send SMS</span>
                    </button>

                    {/* View / Print Receipt */}
                    <button
                      onClick={() => onViewReceipt(visit)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-400" />
                      <span>Receipt / Print</span>
                    </button>

                    {/* Due reminder button if due */}
                    {isDueToday && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSendDueReminderWhatsApp(visit)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                          title="Send reminder via WhatsApp"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Remind WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleSendDueReminderSMS(visit)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition"
                          title="Send reminder via SMS"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>SMS</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditVisit(visit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete visit record for ${visit.customerName}?`)) {
                          onDeleteVisit(visit.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
