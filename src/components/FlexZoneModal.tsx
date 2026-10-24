/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Crown, Copy, Check, ExternalLink, X, Utensils, Film, Sparkles, Gift } from 'lucide-react';
import { soundEngine } from '../services/audio';

interface FlexZoneModalProps {
  zone: 'zomato_gold' | 'cinepolis';
  onClose: () => void;
  onClaimCoins: (amount: number) => void;
}

export const FlexZoneModal: React.FC<FlexZoneModalProps> = ({
  zone,
  onClose,
  onClaimCoins,
}) => {
  const [copied, setCopied] = useState(false);
  const [claimedBonus, setClaimedBonus] = useState(false);

  const isZomato = zone === 'zomato_gold';
  const promoCode = isZomato ? 'FAMGOLD50' : 'CINÉFLEXVIP';
  const brandName = isZomato ? 'Zomato Gold Lounge' : 'Cinépolis VIP Cinema Dome';

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    soundEngine.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimBonus = () => {
    if (claimedBonus) return;
    setClaimedBonus(true);
    soundEngine.playCouponUnlock();
    onClaimCoins(250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#181a26] via-[#12141e] to-[#0c0d14] border-2 border-yellow-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(255,230,0,0.4)] overflow-hidden">
        {/* Glow */}
        <div className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none ${
          isZomato ? 'bg-red-500/25' : 'bg-blue-500/25'
        }`} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIP Status Chip */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs uppercase shadow-md">
            <Crown className="w-4 h-4 fill-black" />
            <span>Flex VIP Lounge Active</span>
          </div>
          <span className="text-xs text-yellow-400 font-mono">UNLOCKED</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-3 rounded-2xl ${isZomato ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-xl`}>
            {isZomato ? <Utensils className="w-7 h-7" /> : <Film className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{brandName}</h2>
            <p className="text-xs text-zinc-300">Exclusive experiential zone inside Fam World</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-5">
          {isZomato
            ? 'Welcome to the VIP dining booth! As a Fam Flex cardholder, your 50% discount applies across 25,000+ top restaurants near your campus.'
            : 'Welcome to the luxury cinema dome! Recline back and enjoy 1+1 on IMAX & 4DX tickets plus complimentary cinema concessions.'}
        </p>

        {/* Promo Voucher Box */}
        <div className="p-4 rounded-2xl bg-black/50 border border-yellow-400/40 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Secret Flex Voucher</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Active
            </span>
          </div>
          <div className="flex items-center justify-between bg-zinc-900/90 rounded-xl p-3 border border-white/10">
            <div className="font-mono text-xl font-black text-yellow-400 tracking-wider">
              {promoCode}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-extrabold text-xs hover:bg-yellow-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* VIP Perks */}
        <div className="space-y-2 mb-6 text-xs text-zinc-200">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
            <Gift className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{isZomato ? 'Zero delivery charges + Free On-Time Guarantee' : 'Complimentary Caramel Popcorn Tub with every booking'}</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isZomato ? 'No blackout days — valid on weekends & festivals' : 'VIP lounge waiting area access with free wifi'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClaimBonus}
            disabled={claimedBonus}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              claimedBonus
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 active:scale-95'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{claimedBonus ? 'Bonus +250₹ Claimed!' : 'Claim VIP +250₹ FamCoins'}</span>
          </button>

          <a
            href={isZomato ? 'https://www.zomato.com' : 'https://www.cinepolisindia.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Open {isZomato ? 'Zomato' : 'Cinépolis'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
