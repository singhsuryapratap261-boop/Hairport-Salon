import React from 'react';
import { IndianRupee, Users, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VisitRecord, InquiryRecord } from '../types';
import { getTodayDateStr } from '../utils/storage';

interface StatsOverviewProps {
  visits: VisitRecord[];
  inquiries: InquiryRecord[];
  onFilterTodayVisits: () => void;
  onFilterDueInquiries: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  visits,
  inquiries,
  onFilterTodayVisits,
  onFilterDueInquiries,
}) => {
  const todayStr = getTodayDateStr(0);

  // Today's visits
  const todayVisits = visits.filter((v) => v.visitDateTime.startsWith(todayStr));
  const todayTotalEarnings = todayVisits.reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const todayCash = todayVisits
    .filter((v) => v.paymentMode === 'cash')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);
  const todayUpi = todayVisits
    .filter((v) => v.paymentMode === 'upi' || v.paymentMode === 'card')
    .reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  // Today's Due Inquiries (Pending follow-ups where followUpDate <= todayStr)
  const dueInquiries = inquiries.filter(
    (inq) => inq.status === 'pending' && inq.followUpDate <= todayStr
  );

  // Service Due Visits (Regular visits whose nextDueDate is today or overdue)
  const dueVisits = visits.filter(
    (v) => v.nextDueDate && v.nextDueDate <= todayStr && !v.reminderSent
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4">
      {/* Today's Earning */}
      <div
        onClick={onFilterTodayVisits}
        className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all cursor-pointer shadow-sm relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Today's Earnings</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ₹{todayTotalEarnings.toLocaleString('en-IN')}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-medium">UPI: ₹{todayUpi}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-300 font-medium">Cash: ₹{todayCash}</span>
        </div>
      </div>

      {/* Today's Customer Footfall */}
      <div
        onClick={onFilterTodayVisits}
        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Today's Footfall</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {todayVisits.length}{' '}
          <span className="text-xs font-normal text-slate-400">Clients</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span>Total Visit Records: {visits.length}</span>
        </div>
      </div>

      {/* 3-Day & Inquiry Follow-ups Due Today */}
      <div
        onClick={onFilterDueInquiries}
        className={`border rounded-2xl p-4 transition-all cursor-pointer shadow-sm relative overflow-hidden ${
          dueInquiries.length > 0
            ? 'bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border-red-500/50 hover:border-red-400'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">
            3-Day Inquiry Reminders
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            dueInquiries.length > 0 ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-800 text-slate-400'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            dueInquiries.length > 0 ? 'text-red-400' : 'text-white'
          }`}>
            {dueInquiries.length}
          </span>
          <span className="text-xs text-slate-400">Due for reminder</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          {dueInquiries.length > 0 ? (
            <span className="text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Send WhatsApp / SMS Reminder →
            </span>
          ) : (
            <span className="text-slate-500">No pending inquiries due</span>
          )}
        </div>
      </div>

      {/* Service Due Reminders */}
      <div
        onClick={onFilterDueInquiries}
        className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Next Service Dues</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {dueVisits.length}{' '}
          <span className="text-xs font-normal text-slate-400">Due</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-400/90 flex items-center gap-1">
          <span>Haircut cycle completed</span>
        </div>
      </div>
    </div>
  );
};
