/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Ticket, Compass, Sparkles, MapPin, Users, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { StallData, Coupon } from '../types';
import { STALLS } from '../game/stallData';

interface HUDProps {
  famCoins: number;
  visitedStalls: string[];
  savedCoupons: Coupon[];
  isNightMode: boolean;
  isMuted: boolean;
  isBgMusicPlaying: boolean;
  nearStall: StallData | null;
  playerPos: { x: number; z: number; rotY: number };
  playerCount: number;
  sabotageCount: number;
  myRole: 'saver' | 'scammer';
  onToggleNight: () => void;
  onToggleMute: () => void;
  onToggleBgMusic: () => void;
  onOpenWallet: () => void;
  onOpenStall: (stall: StallData) => void;
  onOpenCustomizer: () => void;
  onOpenAssets: () => void;
  onOpenPersona: () => void;
  onOpenMap: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  famCoins,
  visitedStalls,
  savedCoupons,
  isNightMode,
  isMuted,
  isBgMusicPlaying,
  nearStall,
  playerPos,
  playerCount,
  sabotageCount,
  myRole,
  onToggleNight,
  onToggleMute,
  onToggleBgMusic,
  onOpenWallet,
  onOpenStall,
  onOpenCustomizer,
  onOpenAssets,
  onOpenPersona,
  onOpenMap,
}) => {
  // Minimap coordinate mapping: campus is -65 to 65 -> 0 to 100%
  const mapPlayerX = ((playerPos.x + 65) / 130) * 100;
  const mapPlayerY = ((playerPos.z + 65) / 130) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar */}
      <header className="p-3 md:p-5 flex items-start justify-between w-full">
        {/* Left: Brand Identity & Currency Badges */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-[#0f1118]/90 border border-yellow-400/30 rounded-2xl px-3.5 py-2 shadow-2xl backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFE600] to-[#FFCC00] flex items-center justify-center font-black text-black text-lg shadow-md shadow-yellow-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm md:text-base text-white tracking-wide">FAMFEST 3D</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-400 text-black uppercase tracking-wider">
                  Campus
                </span>
                {myRole === 'scammer' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                    🕵️ Scammer
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30 uppercase tracking-wider">
                    🛡️ Saver
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">Explore & Collect Brand Coupons</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2">
            {/* FamCoins Counter */}
            <div className="flex items-center gap-2 bg-[#141724]/90 border border-yellow-400/40 rounded-xl px-3 py-1.5 shadow-lg">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 flex items-center justify-center text-[11px] font-black text-zinc-900 shadow">
                ₹
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase leading-none">FamCoins</span>
                <span className="text-sm font-black text-yellow-400 font-mono leading-none mt-0.5">{famCoins}</span>
              </div>
            </div>

            {/* Stalls Visited */}
            <div className="flex items-center gap-1.5 bg-[#141724]/90 border border-white/10 rounded-xl px-3 py-1.5 shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase leading-none">Stalls</span>
                <span className="text-sm font-black text-white font-mono leading-none mt-0.5">
                  {visitedStalls.length}/{STALLS.length}
                </span>
              </div>
            </div>

            {/* Students Online */}
            <button
              onClick={onOpenPersona}
              className="flex items-center gap-1.5 bg-[#141724]/90 hover:bg-[#1f2438] border border-white/10 rounded-xl px-3 py-1.5 shadow-lg transition-colors cursor-pointer"
              title="Campus Players & Invite Access"
            >
              <Users className="w-3.5 h-3.5 text-green-400" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase leading-none">Online</span>
                <span className="text-sm font-black text-white font-mono leading-none mt-0.5">{playerCount}</span>
              </div>
            </button>

            {/* Tampered Kiosks Warning */}
            {sabotageCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500 rounded-xl px-3 py-1.5 shadow-lg animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-red-300 font-semibold uppercase leading-none">Alert</span>
                  <span className="text-xs font-black text-red-200 leading-none mt-0.5">{sabotageCount} Spoofed</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Radar Mini-map & Control Toggles */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Top Quick Action Buttons */}
          <div className="flex items-center gap-1.5 bg-[#0f1118]/90 border border-white/10 p-1.5 rounded-2xl shadow-xl">
            {/* Campus Map Button */}
            <button
              onClick={onOpenMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Open Campus Festival Map"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            {/* FamCards Virtual Assets Button */}
            <button
              onClick={onOpenAssets}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-yellow-300 font-extrabold text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer border border-yellow-400/20"
              title="FamApp Virtual Cards & Badges"
            >
              <CreditCard className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">FamCards</span>
            </button>

            {/* Wallet Button */}
            <button
              onClick={onOpenWallet}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-extrabold text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="My Coupon Wallet"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Wallet</span>
              {savedCoupons.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-yellow-300 text-[10px] font-black flex items-center justify-center">
                  {savedCoupons.length}
                </span>
              )}
            </button>

            {/* Persona & Invite Modal */}
            <button
              onClick={onOpenPersona}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-all hover:scale-105 cursor-pointer"
              title="Change Persona / Invite Friends"
            >
              <Users className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Avatar Customizer */}
            <button
              onClick={onOpenCustomizer}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-all hover:scale-105 cursor-pointer"
              title="Customize Avatar / Mount"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-all hover:scale-105 cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            </button>

            {/* Festival Synth Beat Toggle */}
            <button
              onClick={onToggleBgMusic}
              className={`p-2 rounded-xl transition-all hover:scale-105 cursor-pointer ${
                isBgMusicPlaying ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-zinc-800/80 text-zinc-400'
              }`}
              title="Festival DJ Synth Beats"
            >
              <span className="text-xs font-mono font-bold">DJ</span>
            </button>

            {/* Day / Night Mode */}
            <button
              onClick={onToggleNight}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-all hover:scale-105 cursor-pointer"
              title={isNightMode ? 'Switch to Day Light' : 'Switch to Neon Night'}
            >
              {isNightMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          {/* Radar / Mini-map (Click to expand full map) */}
          <div
            onClick={onOpenMap}
            className="w-28 h-28 md:w-32 md:h-32 bg-[#0c0e15]/95 border-2 border-yellow-400/30 hover:border-yellow-400 rounded-2xl p-1.5 shadow-2xl relative overflow-hidden hidden sm:block cursor-pointer transition-colors"
            title="Click to Open Full Campus Map"
          >
            <div className="w-full h-full rounded-xl bg-[#141722] relative overflow-hidden border border-white/5">
              {/* Radar Grid Circles */}
              <div className="absolute inset-2 border border-white/10 rounded-full" />
              <div className="absolute inset-6 border border-white/10 rounded-full" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />

              {/* Central Monument Marker */}
              <div
                className="absolute w-2 h-2 rounded-full bg-yellow-400 -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-yellow-400"
                style={{ left: '50%', top: '50%' }}
                title="Central Fam Monument"
              />

              {/* Stage Marker */}
              <div
                className="absolute w-3 h-1.5 rounded-sm bg-cyan-400 -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-cyan-400"
                style={{ left: '50%', top: `${(( -32 + 65 ) / 130) * 100}%` }}
                title="Live Fam Stage"
              />

              {/* Stall Markers */}
              {STALLS.map((s) => {
                const sx = ((s.position[0] + 65) / 130) * 100;
                const sy = ((s.position[2] + 65) / 130) * 100;
                const isVisited = visitedStalls.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150 cursor-pointer shadow"
                    style={{
                      left: `${sx}%`,
                      top: `${sy}%`,
                      backgroundColor: s.accentColor || s.color,
                      border: isVisited ? '1px solid #10B981' : '1px solid #fff',
                    }}
                    title={`${s.name} Stall`}
                  />
                );
              })}

              {/* Player Arrow */}
              <div
                className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                style={{
                  left: `${mapPlayerX}%`,
                  top: `${mapPlayerY}%`,
                  transform: `translate(-50%, -50%) rotate(${playerPos.rotY}rad)`,
                }}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[9px] border-b-yellow-400 mx-auto filter drop-shadow(0 0 4px #ffe600)" />
              </div>

              {/* Radar Compass Badge */}
              <div className="absolute bottom-1 right-1 flex items-center gap-0.5 text-[8px] font-bold text-zinc-400 font-mono">
                <Compass className="w-2.5 h-2.5 text-yellow-400" />
                <span>N</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Near Stall Proximity Alert Banner */}
      {nearStall && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-[#0f1118]/95 border-2 border-yellow-400 rounded-2xl px-5 py-3 shadow-[0_0_30px_rgba(255,230,0,0.35)] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow"
              style={{ backgroundColor: nearStall.color }}
            >
              {nearStall.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm md:text-base text-white">{nearStall.name} Stall</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-yellow-400 uppercase">
                  {nearStall.category}
                </span>
              </div>
              <p className="text-xs text-yellow-300 font-bold">{nearStall.specialOffer}</p>
            </div>
            <button
              onClick={() => onOpenStall(nearStall)}
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Visit Stall</span>
              <span className="text-[10px] bg-black/15 px-1.5 py-0.5 rounded font-mono hidden md:inline">[E]</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
