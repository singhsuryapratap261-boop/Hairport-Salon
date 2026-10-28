import React from 'react';
import { Scissors, Phone, MapPin, Bell, Plus, CalendarClock, Settings as SettingsIcon, Tag, Smartphone } from 'lucide-react';
import { SalonConfig } from '../types';

interface HeaderProps {
  config: SalonConfig;
  todayRemindersCount: number;
  onOpenNewVisit: () => void;
  onOpenNewInquiry: () => void;
  onOpenSettings: () => void;
  onOpenServicesManager: () => void;
  onOpenInstallApp: () => void;
  onNavigateToReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  todayRemindersCount,
  onOpenNewVisit,
  onOpenNewInquiry,
  onOpenSettings,
  onOpenServicesManager,
  onOpenInstallApp,
  onNavigateToReminders,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Salon Brand Title & Details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold shrink-0">
                <Scissors className="w-6 h-6 transform -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    {config.name}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Moradabad
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400 mt-0.5">
                  <a
                    href={`tel:${config.phone}`}
                    className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{config.phone}</span>
                  </a>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-md font-normal text-slate-300" title={config.address}>
                      {config.address}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile notification & action icons */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onOpenInstallApp}
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                title="Android App Install"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigateToReminders}
                className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="Due Reminders Today"
              >
                <Bell className="w-4 h-4" />
                {todayRemindersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                    {todayRemindersCount}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenServicesManager}
                className="p-2 rounded-lg bg-slate-800 text-amber-400 hover:text-white"
                title="Services & Charges"
              >
                <Tag className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                title="Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Android App Button */}
            <button
              onClick={onOpenInstallApp}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition shadow-sm"
              title="Install Hairport Salon on Android phone"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android App</span>
            </button>

            {/* Reminder Alert Badge button on desktop */}
            <button
              onClick={onNavigateToReminders}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                todayRemindersCount > 0
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Due Today:</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                todayRemindersCount > 0 ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {todayRemindersCount}
              </span>
            </button>

            {/* Edit Services & Rates button */}
            <button
              onClick={onOpenServicesManager}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 hover:border-amber-500/60 transition shadow-sm"
              title="Edit Service Names & Prices, Add New Services"
            >
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Services & Charges</span>
            </button>

            {/* 3-Day Inquiry / Follow-up button */}
            <button
              onClick={onOpenNewInquiry}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <CalendarClock className="w-4 h-4" />
              <span>3-Day Reminder</span>
            </button>

            {/* Main New Visit & Bill button */}
            <button
              onClick={onOpenNewVisit}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ New Bill</span>
            </button>

            {/* Desktop Settings Icon */}
            <button
              onClick={onOpenSettings}
              className="hidden md:flex p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-all"
              title="Salon Profile, Backup & Restore"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
