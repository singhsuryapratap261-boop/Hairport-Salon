import React, { useState } from 'react';
import { Clock, Bell, Phone, MapPin, Send, CheckCircle2, AlertCircle, Calendar, Plus, Trash2, Smartphone, MessageSquare } from 'lucide-react';
import { InquiryRecord, SalonConfig } from '../types';
import { formatFriendlyDate, openWhatsApp, openSMS, createInquiryWhatsAppMessage, createInquirySMSMessage } from '../utils/messaging';
import { getTodayDateStr } from '../utils/storage';
import { playReminderChime } from '../utils/sound';

interface InquiriesListProps {
  inquiries: InquiryRecord[];
  salonConfig: SalonConfig;
  onUpdateInquiry: (updated: InquiryRecord) => void;
  onDeleteInquiry: (id: string) => void;
  onConvertToVisit: (inquiry: InquiryRecord) => void;
  onOpenNewInquiry: () => void;
}

export const InquiriesList: React.FC<InquiriesListProps> = ({
  inquiries,
  salonConfig,
  onUpdateInquiry,
  onDeleteInquiry,
  onConvertToVisit,
  onOpenNewInquiry,
}) => {
  const [filter, setFilter] = useState<'due' | 'all' | 'upcoming' | 'completed'>('due');
  const todayStr = getTodayDateStr(0);

  // Categorize
  const dueTodayInquiries = inquiries.filter(
    (inq) => inq.status === 'pending' && inq.followUpDate <= todayStr
  );
  const upcomingInquiries = inquiries.filter(
    (inq) => inq.status === 'pending' && inq.followUpDate > todayStr
  );
  const completedInquiries = inquiries.filter(
    (inq) => inq.status === 'reminded' || inq.status === 'converted'
  );

  let displayedInquiries = inquiries;
  if (filter === 'due') {
    displayedInquiries = dueTodayInquiries;
  } else if (filter === 'upcoming') {
    displayedInquiries = upcomingInquiries;
  } else if (filter === 'completed') {
    displayedInquiries = completedInquiries;
  }

  const handleSendWhatsAppReminder = (inquiry: InquiryRecord) => {
    const msg = createInquiryWhatsAppMessage(inquiry, salonConfig);
    openWhatsApp(inquiry.phone, msg);

    // Update status to reminded
    onUpdateInquiry({
      ...inquiry,
      status: 'reminded',
      reminderSentAt: new Date().toISOString(),
    });
  };

  const handleSendSMSReminder = (inquiry: InquiryRecord) => {
    const msg = createInquirySMSMessage(inquiry, salonConfig);
    openSMS(inquiry.phone, msg);

    // Update status to reminded
    onUpdateInquiry({
      ...inquiry,
      status: 'reminded',
      reminderSentAt: new Date().toISOString(),
    });
  };

  const handleSnooze = (inquiry: InquiryRecord, days: number) => {
    const updated = {
      ...inquiry,
      followUpDate: getTodayDateStr(days),
      status: 'pending' as const,
      notes: `${inquiry.notes ? inquiry.notes + ' • ' : ''}Snoozed for ${days} days`,
    };
    onUpdateInquiry(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Alert if any reminders due */}
      {dueTodayInquiries.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/60 via-red-900/40 to-slate-900 border border-red-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>🚨 {dueTodayInquiries.length} Customer Reminders Due Today!</span>
              </h3>
              <p className="text-xs text-red-300/80">
                Customers requested a 3-day reminder for salon grooming. Send a WhatsApp or SMS reminder with one click below.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playReminderChime();
              setFilter('due');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-md transition"
          >
            View Due List
          </button>
        </div>
      )}

      {/* Tab filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setFilter('due')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
              filter === 'due'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>🚨 Due Today ({dueTodayInquiries.length})</span>
          </button>

          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition shrink-0 ${
              filter === 'upcoming'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>📅 Upcoming ({upcomingInquiries.length})</span>
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition shrink-0 ${
              filter === 'completed'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>✅ Contacted ({completedInquiries.length})</span>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
              filter === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All ({inquiries.length})</span>
          </button>
        </div>

        <button
          onClick={onOpenNewInquiry}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Inquiry / Reminder</span>
        </button>
      </div>

      {/* Inquiry cards list */}
      {displayedInquiries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
          <h3 className="text-base font-semibold text-slate-200">
            {filter === 'due' ? 'No reminders due today' : 'No inquiries found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When a customer asks to be reminded after 3 days, tap the "+ New Inquiry / Reminder" button to schedule.
          </p>
          <button
            onClick={onOpenNewInquiry}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            + Add 3-Day Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedInquiries.map((inquiry) => {
            const isDueToday = inquiry.followUpDate <= todayStr && inquiry.status === 'pending';
            const isCompleted = inquiry.status === 'reminded' || inquiry.status === 'converted';

            return (
              <div
                key={inquiry.id}
                className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition shadow-sm ${
                  isDueToday
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 border-red-500/40 hover:border-red-500/60'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Name, Mobile, Status Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{inquiry.customerName}</span>
                        {inquiry.presetDays ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-medium">
                            {inquiry.presetDays}-Day Reminder
                          </span>
                        ) : null}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-emerald-400"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{inquiry.phone}</span>
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{inquiry.address || 'Khushalpur, Moradabad'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isDueToday ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                          🚨 Due Today!
                        </span>
                      ) : inquiry.status === 'reminded' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ✓ Reminded
                        </span>
                      ) : inquiry.status === 'converted' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                          🏆 Visited Salon
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          📅 {formatFriendlyDate(inquiry.followUpDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Inquired */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="text-slate-400 text-[11px]">Requested Service:</div>
                    <div className="font-semibold text-amber-300 mt-0.5">
                      {inquiry.serviceRequired || 'Hair Styling / Grooming'}
                    </div>
                    {inquiry.notes && (
                      <div className="text-slate-400 text-[11px] mt-1 italic">
                        "{inquiry.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Timeline & Actions */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Inquiry Date: {formatFriendlyDate(inquiry.inquiryDate)}</span>
                    <span>Reminder Due: {formatFriendlyDate(inquiry.followUpDate)}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* WhatsApp Reminder Button */}
                      <button
                        onClick={() => handleSendWhatsAppReminder(inquiry)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                        title="Send reminder via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* SMS Text Message Reminder Button */}
                      <button
                        onClick={() => handleSendSMSReminder(inquiry)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                        title="Send SMS text message"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </button>

                      {/* Convert into Visit */}
                      <button
                        onClick={() => onConvertToVisit(inquiry)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition"
                        title="Customer arrived, create bill now"
                      >
                        <span>✂️ Create Bill</span>
                      </button>
                    </div>

                    {/* Snooze & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSnooze(inquiry, 3)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                        title="Snooze for 3 more days"
                      >
                        +3 Days
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete inquiry for ${inquiry.customerName}?`)) {
                            onDeleteInquiry(inquiry.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
