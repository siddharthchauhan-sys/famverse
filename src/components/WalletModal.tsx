/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Ticket, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Coupon } from '../types';

interface WalletModalProps {
  coupons: Coupon[];
  onClose: () => void;
  onSelectStallById: (stallId: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  coupons,
  onClose,
  onSelectStallById,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Food', 'Tech', 'Fashion', 'Entertainment'];

  const filteredCoupons = coupons.filter((c) => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0f1118] border border-yellow-400/30 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-black shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">FamApp Rewards Wallet</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
                  {coupons.length} Claimed
                </span>
              </div>
              <p className="text-xs text-zinc-400">All your unlocked festival discounts and affiliate partner coupons</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#0c0d14]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-yellow-400 text-black shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Coupon Grid or Empty State */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredCoupons.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400 mb-3">
                <Sparkles className="w-7 h-7 text-yellow-400/60" />
              </div>
              <h3 className="text-base font-bold text-white">No coupons in this category yet!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Walk around the 3D campus and approach brand stalls like Zomato, Nike, boAt, and Domino's to claim exclusive coupons.
              </p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isCopied = copiedId === coupon.id;
              return (
                <div
                  key={coupon.id}
                  className="bg-[#141724] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-yellow-400/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow shrink-0"
                      style={{ backgroundColor: coupon.featuredColor || '#FFE600' }}
                    >
                      {coupon.brandName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{coupon.brandName}</span>
                        <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                          {coupon.discount}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-300 mt-0.5">{coupon.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Expires: {coupon.validUntil}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    <div className="bg-[#0b0c10] border border-white/10 px-3 py-1.5 rounded-xl font-mono text-yellow-300 text-xs font-bold tracking-wider">
                      {coupon.code}
                    </div>

                    <button
                      onClick={() => handleCopy(coupon)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-green-500 text-black'
                          : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <a
                      href={coupon.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Redeem on store"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0c0d14] border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Tip: Tap any brand stall in the bottom dock to fast travel.</span>
          <span className="text-yellow-400 font-bold">100% Verified Affiliate Codes</span>
        </div>
      </div>
    </div>
  );
};
