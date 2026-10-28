import React, { useState } from 'react';
import { X, Smartphone, Download, QrCode, Check, Copy, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    appUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Install on Android Mobile
              </h3>
              <p className="text-xs text-slate-400">
                Hairport Salon Moradabad Android App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Method 1: Instant 1-Tap Install / WebAPK (Recommended by Google) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4" />
                Recommended: 1-Tap Direct Install
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                Official Google WebAPK
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Android supports installing this app directly to your phone screen as a native application with an app icon. It works offline, opens full-screen, and requires no APK warning screens!
            </p>

            {isInstallable ? (
              <button
                onClick={install}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Tap Here to Install App on Phone</span>
              </button>
            ) : (
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                <div className="font-semibold text-amber-400">
                  How to install on Android Chrome:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Open this link on your phone in Google Chrome.</li>
                  <li>Tap the <strong>3 dots (⋮)</strong> menu at the top right of Chrome.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>The <strong>Hairport Salon</strong> icon will appear on your phone apps list!</li>
                </ol>
              </div>
            )}
          </div>

          {/* QR Code & Share Link */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wide text-xs flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                Scan to Open on Android Phone
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <img src={qrCodeUrl} alt="App QR Code" className="w-28 h-28" />
              </div>
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <p className="text-slate-400 text-xs">
                  Scan this QR code with your Android camera or phone scanner to open the app on your mobile, then tap <strong>"Add to Home Screen"</strong>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy App Link'}</span>
                  </button>
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Raw .APK File Builder Info */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <span>Need a standalone downloadable .apk package file?</span>
            </div>
            <p>
              You can also generate an offline <code>.apk</code> file in 1 minute using official <strong>PWABuilder</strong> (powered by Microsoft & Google):
            </p>
            <div className="pt-1">
              <a
                href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Generate .apk on PWABuilder →</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
