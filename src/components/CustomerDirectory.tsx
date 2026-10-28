import React, { useState } from 'react';
import { Users, Phone, MapPin, Search, Plus, MessageSquare, Smartphone } from 'lucide-react';
import { VisitRecord, CustomerSummary, SalonConfig } from '../types';
import { formatFriendlyDate, openWhatsApp, openSMS } from '../utils/messaging';

interface CustomerDirectoryProps {
  visits: VisitRecord[];
  salonConfig: SalonConfig;
  onSelectCustomerForNewVisit: (customer: { name: string; phone: string; address: string }) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  visits,
  salonConfig,
  onSelectCustomerForNewVisit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate customers by phone number
  const customerMap = new Map<string, CustomerSummary>();

  visits.forEach((v) => {
    const phone = v.phone.trim();
    if (!phone) return;

    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        phone: phone,
        customerName: v.customerName,
        address: v.address || 'Khushalpur, Moradabad',
        totalVisits: 1,
        totalSpent: v.paidAmount || v.finalAmount,
        lastVisitDate: v.visitDateTime,
        nextDueDate: v.nextDueDate,
        preferredServices: v.services.map((s) => s.name),
      });
    } else {
      const existing = customerMap.get(phone)!;
      existing.totalVisits += 1;
      existing.totalSpent += v.paidAmount || v.finalAmount;
      if (new Date(v.visitDateTime) > new Date(existing.lastVisitDate)) {
        existing.lastVisitDate = v.visitDateTime;
        existing.customerName = v.customerName; // update latest name
        existing.address = v.address || existing.address;
        existing.nextDueDate = v.nextDueDate;
      }
      v.services.forEach((s) => {
        if (!existing.preferredServices.includes(s.name)) {
          existing.preferredServices.push(s.name);
        }
      });
    }
  });

  const customersList = Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime()
  );

  const filteredCustomers = customersList.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsAppChat = (cust: CustomerSummary) => {
    const msg = `*✂️ ${salonConfig.name.toUpperCase()} ✂️*\nHello *${cust.customerName}*! 👋\nGreetings from Hairport Salon Moradabad. We hope you are having a wonderful week! Feel free to reach out anytime to reserve your grooming slot.\n📍 ${salonConfig.address}\n📞 Call / WhatsApp: ${salonConfig.phone}`;
    openWhatsApp(cust.phone, msg);
  };

  const handleSMSChat = (cust: CustomerSummary) => {
    const msg = `${salonConfig.name.toUpperCase()}: Hello ${cust.customerName}, book your grooming appointment today at ${salonConfig.address}. Ph: ${salonConfig.phone}`;
    openSMS(cust.phone, msg);
  };

  return (
    <div className="space-y-4">
      {/* Search & Stats Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, mobile number, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
            Total Clients: <strong className="text-amber-400 font-bold">{customersList.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
            Repeat Clients:{' '}
            <strong className="text-emerald-400 font-bold">
              {customersList.filter((c) => c.totalVisits > 1).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto text-slate-600 stroke-1 mb-2" />
          <h3 className="text-base font-semibold text-slate-200">No customers found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.phone}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>{cust.customerName}</span>
                      {cust.totalVisits > 1 && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          {cust.totalVisits} Visits
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-400 mt-1">
                      <a
                        href={`tel:${cust.phone}`}
                        className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 font-medium"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{cust.phone}</span>
                      </a>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{cust.address}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Spent:</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      ₹{cust.totalSpent}
                    </span>
                  </div>
                </div>

                {/* Preferred services */}
                {cust.preferredServices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {cust.preferredServices.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                    {cust.preferredServices.length > 3 && (
                      <span className="text-[10px] px-1 text-slate-500">
                        +{cust.preferredServices.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Last Visit: {formatFriendlyDate(cust.lastVisitDate)}</span>
                  {cust.nextDueDate && (
                    <span className="text-amber-300 font-medium">
                      Next Due: {formatFriendlyDate(cust.nextDueDate)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    onClick={() => handleWhatsAppChat(cust)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleSMSChat(cust)}
                    className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                    title="Send SMS"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>

                  <button
                    onClick={() =>
                      onSelectCustomerForNewVisit({
                        name: cust.customerName,
                        phone: cust.phone,
                        address: cust.address,
                      })
                    }
                    className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Bill</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
