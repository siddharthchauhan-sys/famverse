/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Sparkles, Utensils, Film, ShieldCheck, Zap, X, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/audio';

interface FlexWallModalProps {
  gateType: 'zomato_gold' | 'cinepolis' | 'barrier' | null;
  onClose: () => void;
  onUnlockFlex: () => void;
}

export const FlexWallModal: React.FC<FlexWallModalProps> = ({
  gateType,
  onClose,
  onUnlockFlex,
}) => {
  const handleUpgrade = () => {
    soundEngine.playGateUnlock();
    onUnlockFlex();
    onClose();
  };

  const isZomato = gateType === 'zomato_gold';
  const isCinepolis = gateType === 'cinepolis';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#181a26] via-[#12141e] to-[#0c0d14] border-2 border-yellow-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(255,230,0,0.35)] overflow-hidden">
        {/* Golden ambient glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-md">
            <Crown className="w-3.5 h-3.5 fill-black" />
            <span>Fam Flex Exclusive</span>
          </div>
          <span className="text-xs text-yellow-400/80 font-mono font-semibold">VIP ACCESS ONLY</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
          {isZomato
            ? 'Unlock the Zomato Gold Lounge'
            : isCinepolis
            ? 'Unlock the Cinépolis VIP Cinema'
            : 'Access the Fam Flex VIP Zone'}
        </h2>

        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          {isZomato
            ? 'Enjoy 50% flat discount on dining, zero delivery fees on midnight cravings, and complimentary chef treats!'
            : isCinepolis
            ? 'Score Buy-1-Get-1 free movie tickets every weekend, luxury recliner pass, and free gourmet popcorn!'
            : 'The Flex Wall protects ultra-exclusive zones created for FamApp Flex members. Upgrade your student card today to enter!'}
        </p>

        {/* Experience Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Zomato Gold Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isZomato
              ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-500/10'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-red-600 text-white">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Zomato Gold Lounge</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>50% Flat Campus Dining</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Free Express Delivery</span>
              </li>
            </ul>
          </div>

          {/* Cinépolis VIP Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isCinepolis
              ? 'bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/10'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Film className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Cinépolis VIP Cinema</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>1+1 Movie Tickets</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Free Gourmet Tub Popcorn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Perks Row */}
        <div className="flex items-center justify-around py-3 px-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 mb-6 text-xs text-yellow-300 font-semibold">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>2x FamCoin Rewards</span>
          </div>
          <div className="w-px h-4 bg-yellow-400/30" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Robber Immunity Shield</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleUpgrade}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black text-base shadow-[0_0_30px_rgba(255,230,0,0.6)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span>Start Free 7-Day Flex Pass (Instant Access)</span>
          </button>

          <p className="text-center text-[11px] text-zinc-400">
            Special student offer: ₹0 for 7 days, then ₹149/quarter. Cancel anytime in FamApp.
          </p>
        </div>
      </div>
    </div>
  );
};
