/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, Shield, Zap, Skull, Bell, Sparkles } from 'lucide-react';
import { StallData, Sabotage } from '../types';
import { soundEngine } from '../services/audio';

interface FraudActionDockProps {
  myRole: 'saver' | 'scammer';
  nearStall: StallData | null;
  activeSabotages: Sabotage[];
  isNearEmergencyBuzzer: boolean;
  onCommitSabotage: (stallId: string, stallName: string, type: string) => void;
  onFixSabotage: (stallId: string, stallName: string) => void;
  onTriggerEmergency: () => void;
}

export const FraudActionDock: React.FC<FraudActionDockProps> = ({
  myRole,
  nearStall,
  activeSabotages,
  isNearEmergencyBuzzer,
  onCommitSabotage,
  onFixSabotage,
  onTriggerEmergency,
}) => {
  const [sabotageCooldown, setSabotageCooldown] = useState(0);

  const isCurrentStallSabotaged = nearStall
    ? activeSabotages.some((s) => s.stallId === nearStall.id && !s.fixed)
    : false;

  const handleSabotage = (type: string) => {
    if (!nearStall || sabotageCooldown > 0) return;
    onCommitSabotage(nearStall.id, nearStall.name, type);
    soundEngine.playStallInteract();
    setSabotageCooldown(15);
    const interval = setInterval(() => {
      setSabotageCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFix = () => {
    if (!nearStall) return;
    onFixSabotage(nearStall.id, nearStall.name);
    soundEngine.playCouponUnlock();
  };

  return (
    <div className="fixed top-24 right-4 z-20 pointer-events-auto flex flex-col items-end gap-2.5 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Emergency Fraud Audit Call Button (When near the Central Buzzer) */}
      {isNearEmergencyBuzzer && (
        <div className="animate-bounce">
          <button
            onClick={() => {
              soundEngine.playMysteryBox();
              onTriggerEmergency();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs md:text-sm shadow-[0_0_30px_rgba(255,23,68,0.7)] border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Bell className="w-5 h-5 animate-pulse" />
            <span>HIT EMERGENCY AUDIT BUZZER!</span>
          </button>
        </div>
      )}

      {/* 2. Campus Saver: Kiosk Security Audit Action when near a sabotaged kiosk */}
      {isCurrentStallSabotaged && nearStall && (
        <div className="bg-[#0f1118]/95 border-2 border-yellow-400 p-3 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-red-400">Tampered Terminal</span>
            <p className="text-xs font-black text-white">{nearStall.name} Kiosk Spoofed!</p>
          </div>
          <button
            onClick={handleFix}
            className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs shadow transition-all cursor-pointer flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Fix & Earn 150₹</span>
          </button>
        </div>
      )}

      {/* 3. Scammer Fraud Stealth Dock (Only shown if myRole is scammer) */}
      {myRole === 'scammer' && (
        <div className="bg-[#0f1118]/95 border-2 border-red-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2 max-w-[260px]">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
            <div className="flex items-center gap-1.5 text-red-400 font-black text-xs uppercase tracking-wider">
              <Skull className="w-4 h-4" />
              <span>Scammer Actions</span>
            </div>
            {sabotageCooldown > 0 && (
              <span className="text-[10px] font-mono text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded">
                CD: {sabotageCooldown}s
              </span>
            )}
          </div>

          {nearStall ? (
            <button
              disabled={sabotageCooldown > 0 || isCurrentStallSabotaged}
              onClick={() => handleSabotage('phishing_qr')}
              className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Plant Phishing QR at {nearStall.name}</span>
            </button>
          ) : (
            <p className="text-[11px] text-zinc-400 italic">
              Walk near a brand stall to tamper with its payment terminal!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
