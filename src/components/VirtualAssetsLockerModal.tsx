/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CreditCard, Award, Shield, Check, Copy, ExternalLink, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VirtualAsset, Coupon } from '../types';
import { soundEngine } from '../services/audio';

interface VirtualAssetsLockerModalProps {
  assets: VirtualAsset[];
  playerName: string;
  onClose: () => void;
  onSimulateCheckout: (merchant: string, discountGranted: Coupon) => void;
}

export const VirtualAssetsLockerModal: React.FC<VirtualAssetsLockerModalProps> = ({
  assets,
  playerName,
  onClose,
  onSimulateCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'badges' | 'checkout'>('cards');
  const [copiedNum, setCopiedNum] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState('Zomato');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCopyCard = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedNum(num);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  const handlePaySimulate = () => {
    soundEngine.playCouponUnlock();
    setCheckoutSuccess(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFE600', '#10B981', '#00F0FF'],
    });

    const mockCoupon: Coupon = {
      id: `checkout-${Date.now()}`,
      brandId: selectedMerchant.toLowerCase(),
      brandName: selectedMerchant,
      code: `FAMPAY${Math.floor(1000 + Math.random() * 9000)}`,
      discount: 'EXTRA 15% CASHBACK',
      title: `${selectedMerchant} FamPay 1-Tap Reward`,
      description: 'Exclusive instant student cashback applied for paying via FamCard!',
      category: selectedMerchant === 'Nike' ? 'Fashion' : selectedMerchant === 'boAt' ? 'Tech' : 'Food',
      validUntil: 'Dec 31, 2026',
      featuredColor: '#FFE600',
      brandLogoText: selectedMerchant,
      affiliateUrl: `https://${selectedMerchant.toLowerCase()}.com`,
    };

    onSimulateCheckout(selectedMerchant, mockCoupon);
    setTimeout(() => setCheckoutSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0f1118] border border-yellow-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-black font-black text-xl shadow">
              💳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">FamApp Virtual Assets</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
                  {assets.length} Assets Unlocked
                </span>
              </div>
              <p className="text-xs text-zinc-400">Your contactless FamCards, badges, and 1-Tap checkout simulator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 bg-[#0c0d14]">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'cards' ? 'bg-yellow-400 text-black shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>FamCards ({assets.filter((a) => a.type === 'card').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'badges' ? 'bg-yellow-400 text-black shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Badges & Mounts</span>
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'bg-yellow-400 text-black shadow'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>FamPay 1-Tap Simulator</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets
                .filter((a) => a.type === 'card')
                .map((card) => (
                  <div
                    key={card.id}
                    className="relative rounded-2xl p-5 border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[200px]"
                    style={{ background: card.gradientBg }}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <span className="font-black text-sm tracking-widest text-white">FAMAPP</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {card.tier}
                      </span>
                    </div>

                    {/* Chip & Contactless wave */}
                    <div className="my-3 flex items-center gap-3">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 border border-yellow-600/40" />
                      <span className="text-xs text-white/70">(( · )) Contactless</span>
                    </div>

                    {/* Card Number & Name */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base md:text-lg font-black tracking-widest text-white">
                          {card.cardNumber || '4852 •••• •••• 1024'}
                        </span>
                        <button
                          onClick={() => handleCopyCard(card.cardNumber || '48521024')}
                          className="p-1 rounded hover:bg-white/10 text-white/80 cursor-pointer"
                          title="Copy Card Number"
                        >
                          {copiedNum === card.cardNumber ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[11px]">
                        <span className="font-bold text-white/90 uppercase tracking-wider">{playerName}</span>
                        <span className="text-yellow-400 font-extrabold">{card.rewardValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assets
                .filter((a) => a.type !== 'card')
                .map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-[#141724] border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-yellow-400/40 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow">
                      {asset.iconEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white">{asset.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-300">
                          {asset.tier}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{asset.description}</p>
                      <span className="text-xs font-mono font-bold text-green-400 mt-1 block">
                        Perk: {asset.rewardValue}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-[#141724] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-black text-base text-white">Simulate FamCard 1-Tap Checkout</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Experience how FamApp gives student cashbacks and generates revenue through affiliate partner purchases!
                </p>

                {/* Merchant Selector */}
                <div className="mb-4">
                  <label className="text-xs font-extrabold uppercase text-zinc-400 block mb-1.5">
                    Select Affiliate Merchant
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Zomato', 'Nike', 'boAt', "Domino's", 'Spotify', 'Myntra'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMerchant(m)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedMerchant === m
                            ? 'bg-yellow-400 text-black shadow'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Order Summary */}
                <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 space-y-1.5 text-xs text-zinc-300 mb-4">
                  <div className="flex justify-between">
                    <span>Order Total:</span>
                    <span className="font-mono font-bold text-white">₹799.00</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>FamApp Student Cashback (15%):</span>
                    <span className="font-mono font-bold">-₹119.85</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-white">
                    <span>Final Amount:</span>
                    <span className="font-mono text-yellow-400">₹679.15</span>
                  </div>
                </div>

                <button
                  disabled={checkoutSuccess}
                  onClick={handlePaySimulate}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-extrabold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{checkoutSuccess ? 'Paid with FamCard!' : '1-Tap Pay with FamCard'}</span>
                </button>

                {checkoutSuccess && (
                  <p className="mt-3 text-xs text-green-400 font-bold text-center animate-in fade-in">
                    🎉 Payment Successful! Cashback credited to FamCoins + Exclusive coupon saved to wallet!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0c0d14] border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Catching scammers in the Fraud Tribunal unlocks Legendary FamCards!</span>
          <span className="text-yellow-400 font-bold">100% Secure FamApp Ecosystem</span>
        </div>
      </div>
    </div>
  );
};
