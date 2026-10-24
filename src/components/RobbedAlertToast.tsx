/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Bell, X, ShieldAlert } from 'lucide-react';

interface RobbedAlertToastProps {
  stolenCoins: number;
  stolenCouponsCount: number;
  onCallEmergency: () => void;
  onDismiss: () => void;
}

export const RobbedAlertToast: React.FC<RobbedAlertToastProps> = ({
  stolenCoins,
  stolenCouponsCount,
  onCallEmergency,
  onDismiss,
}) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-top-6 duration-300">
      <div className="bg-[#12080a] border-2 border-red-500 rounded-3xl p-4 shadow-[0_0_50px_rgba(255,23,68,0.7)] text-white relative overflow-hidden">
        {/* Animated warning stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 shrink-0 shadow-lg">
            <ShieldAlert className="w-7 h-7 animate-bounce" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Stealth Robbery Alert
              </span>
            </div>

            <h3 className="text-base font-black text-white mt-1">
              YOU WERE JUST PICKPOCKETED!
            </h3>

            <p className="text-xs text-red-200 mt-1 leading-relaxed">
              Someone silently stole <span className="font-bold text-yellow-300">₹{stolenCoins} FamCoins</span> and coupons from your pocket!
              <span className="block text-[11px] text-zinc-400 mt-1">
                🕵️ You do not know who robbed you! Notice who was standing near you and call an emergency audit to vote them out!
              </span>
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onCallEmergency}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 uppercase"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Call Emergency Audit</span>
              </button>

              <button
                onClick={onDismiss}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-zinc-500 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
