/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, HelpCircle, Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StallData, Coupon } from '../types';
import { soundEngine } from '../services/audio';

interface StallModalProps {
  stall: StallData;
  onClose: () => void;
  onSaveCoupon: (coupon: Coupon) => void;
  savedCouponIds: string[];
}

export const StallModal: React.FC<StallModalProps> = ({
  stall,
  onClose,
  onSaveCoupon,
  savedCouponIds,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean>(false);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);

  const handleCopyAndClaim = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    onSaveCoupon(coupon);
    soundEngine.playCouponUnlock();

    // Fire festive confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFE600', '#FF2E93', '#00F0FF', '#ffffff'],
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizAnswer === null || !stall.quiz) return;
    setQuizSubmitted(true);
    const isRight = selectedQuizAnswer === stall.quiz.correctIndex;
    setQuizCorrect(isRight);

    if (isRight) {
      soundEngine.playCouponUnlock();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleClaimBonusCoupon = () => {
    if (!stall.quiz) return;
    const bonusCoupon: Coupon = {
      id: `${stall.id}-bonus`,
      brandId: stall.id,
      brandName: stall.name,
      code: stall.quiz.bonusCode,
      discount: stall.quiz.bonusDiscount,
      title: `${stall.name} VIP Quiz Master Reward`,
      description: `Exclusive bonus unlock for acing the ${stall.name} trivia quiz!`,
      category: stall.category,
      validUntil: 'Dec 31, 2026',
      featuredColor: stall.color,
      brandLogoText: stall.name,
      affiliateUrl: stall.coupons[0]?.affiliateUrl || 'https://famapp.in',
    };
    onSaveCoupon(bonusCoupon);
    setBonusClaimed(true);
    navigator.clipboard.writeText(bonusCoupon.code);
    soundEngine.playCouponUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0f1118] border border-yellow-400/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Brand Banner Header */}
        <div
          className="relative px-6 py-6 border-b border-white/10 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${stall.color} 0%, #0f1118 100%)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white text-2xl shadow-xl backdrop-blur-md">
              {stall.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-wide">{stall.name}</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                  {stall.category}
                </span>
              </div>
              <p className="text-sm text-yellow-300 font-semibold mt-0.5">{stall.tagline}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Special Offer Highlight */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
              <div>
                <span className="text-xs uppercase font-extrabold text-yellow-400 tracking-wider">Featured Deal</span>
                <p className="text-base font-black text-white">{stall.specialOffer}</p>
              </div>
            </div>
            <a
              href={stall.coupons[0]?.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-300 transition-colors"
            >
              <span>Visit Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Coupons List */}
          <div>
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-3">
              Available Affiliate Coupons ({stall.coupons.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stall.coupons.map((c) => {
                const isSaved = savedCouponIds.includes(c.id);
                const isCopied = copiedId === c.id;

                return (
                  <div
                    key={c.id}
                    className="bg-[#141724] border border-white/10 hover:border-yellow-400/40 rounded-2xl p-4 flex flex-col justify-between transition-colors relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-yellow-400 font-mono">{c.discount}</span>
                        {c.minSpend && (
                          <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded font-medium">
                            Min: {c.minSpend}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-white text-sm mt-1">{c.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="bg-[#0b0c10] border border-white/15 px-2.5 py-1 rounded-xl text-yellow-300 font-mono font-bold text-xs select-all">
                        {c.code}
                      </div>

                      <button
                        onClick={() => handleCopyAndClaim(c)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-green-500 text-black font-extrabold'
                            : isSaved
                            ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                            : 'bg-yellow-400 text-black hover:bg-yellow-300'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : isSaved ? (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        ) : (
                          <>
                            <Gift className="w-3.5 h-3.5" />
                            <span>Claim</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Brand Quiz Section */}
          {stall.quiz && (
            <div className="bg-[#141724] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <h3 className="font-black text-sm text-white">{stall.name} Brand Trivia</h3>
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                  Bonus VIP Coupon
                </span>
              </div>
              <p className="text-xs text-zinc-300 mb-3">{stall.quiz.question}</p>

              {/* Quiz Options */}
              <div className="space-y-2">
                {stall.quiz.options.map((option, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === stall.quiz?.correctIndex;

                  let optionStyle = 'bg-zinc-800/80 border-white/5 hover:border-yellow-400/40 text-zinc-200';
                  if (quizSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-green-500/20 border-green-400 text-green-300 font-bold';
                    } else if (isSelected) {
                      optionStyle = 'bg-red-500/20 border-red-400 text-red-300';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => setSelectedQuizAnswer(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-green-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Submit Quiz or Reveal Result */}
              {!quizSubmitted ? (
                <button
                  disabled={selectedQuizAnswer === null}
                  onClick={handleQuizSubmit}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs disabled:opacity-50 transition-all hover:brightness-110 cursor-pointer shadow-md"
                >
                  Submit Answer to Unlock VIP Reward
                </button>
              ) : quizCorrect ? (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-green-400">Correct! Bonus Coupon Unlocked</span>
                    <p className="text-sm font-black text-white font-mono">{stall.quiz.bonusCode} ({stall.quiz.bonusDiscount})</p>
                  </div>
                  <button
                    disabled={bonusClaimed}
                    onClick={handleClaimBonusCoupon}
                    className="px-3 py-1.5 rounded-xl bg-green-400 text-black font-extrabold text-xs hover:bg-green-300 transition-colors cursor-pointer"
                  >
                    {bonusClaimed ? 'Added to Wallet' : 'Claim Reward'}
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-red-400 font-medium text-center">
                  Nice try! The correct answer was highlighted in green above.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
