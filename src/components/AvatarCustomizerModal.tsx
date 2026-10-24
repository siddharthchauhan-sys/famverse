/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, Sparkles, Zap, User } from 'lucide-react';
import { PlayerCustomization } from '../types';

interface AvatarCustomizerModalProps {
  customization: PlayerCustomization;
  onUpdate: (custom: PlayerCustomization) => void;
  onClose: () => void;
}

const HOODIE_COLORS = [
  { name: 'FamApp Yellow', hex: '#FFE600' },
  { name: 'Cyber Cyan', hex: '#00F0FF' },
  { name: 'Neon Magenta', hex: '#FF2E93' },
  { name: 'Ultra Violet', hex: '#7C3AED' },
  { name: 'Stealth Black', hex: '#161922' },
  { name: 'Emerald', hex: '#10B981' },
];

const HAIR_COLORS = [
  { name: 'Midnight', hex: '#12141c' },
  { name: 'Platinum White', hex: '#e2e8f0' },
  { name: 'Cyber Neon', hex: '#00F0FF' },
  { name: 'Golden Blonde', hex: '#F59E0B' },
];

const TRAIL_COLORS = [
  { name: 'Lightning Gold', hex: '#FFE600' },
  { name: 'Laser Cyan', hex: '#00F0FF' },
  { name: 'Hot Pink', hex: '#FF2E93' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  customization,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0f1118] border border-yellow-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-black shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Avatar & Mount Style</h2>
              <p className="text-xs text-zinc-400">Customize your 3D campus walker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customization Options */}
        <div className="p-6 space-y-5">
          {/* Mount Mode Toggle */}
          <div>
            <label className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Travel Mount</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onUpdate({ ...customization, mount: 'shoes' })}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  customization.mount === 'shoes'
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow'
                    : 'bg-[#141724] text-zinc-300 border-white/10 hover:border-white/20'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Sneaker Walker</span>
              </button>

              <button
                onClick={() => onUpdate({ ...customization, mount: 'hoverboard' })}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  customization.mount === 'hoverboard'
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow'
                    : 'bg-[#141724] text-zinc-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Cyber Hoverboard</span>
              </button>
            </div>
          </div>

          {/* Hoodie Color Swatches */}
          <div>
            <label className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2 block">
              Hoodie Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HOODIE_COLORS.map((c) => {
                const isSelected = customization.hoodieColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => onUpdate({ ...customization, hoodieColor: c.hex })}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/10 text-white'
                        : 'border-white/10 bg-[#141724] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2 block">
              Beanie / Hair Tint
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HAIR_COLORS.map((c) => {
                const isSelected = customization.hairColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => onUpdate({ ...customization, hairColor: c.hex })}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/10 text-white'
                        : 'border-white/10 bg-[#141724] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thruster Trail Color (when hoverboard is active) */}
          {customization.mount === 'hoverboard' && (
            <div>
              <label className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2 block">
                Hoverboard Neon Core
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TRAIL_COLORS.map((c) => {
                  const isSelected = customization.trailColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => onUpdate({ ...customization, trailColor: c.hex })}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-400/10 text-white'
                          : 'border-white/10 bg-[#141724] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="p-4 bg-[#0c0d14] border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Keep Exploring</span>
          </button>
        </div>
      </div>
    </div>
  );
};
