/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, MapPin, Navigation, Compass, Sparkles, ExternalLink } from 'lucide-react';
import { STALLS } from '../game/stallData';
import { soundEngine } from '../services/audio';

interface CampusMapModalProps {
  playerPos: { x: number; z: number; rotY: number };
  onNavigateToStall: (stallId: string) => void;
  onClose: () => void;
}

export const CampusMapModal: React.FC<CampusMapModalProps> = ({
  playerPos,
  onNavigateToStall,
  onClose,
}) => {
  // Map dimensions are -65 to 65 -> normalized 0 to 100%
  const playerMapX = ((playerPos.x + 65) / 130) * 100;
  const playerMapY = ((playerPos.z + 65) / 130) * 100;

  const handleTeleport = (stallId: string) => {
    soundEngine.playStallInteract();
    onNavigateToStall(stallId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0d0f18] border-2 border-yellow-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-white">Campus Festival Map</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
                  Interactive Radar
                </span>
              </div>
              <p className="text-xs text-zinc-400">Tap any brand stall to view perks and fast-travel directly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Map View & Stalls List */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5">
          {/* 2D Interactive Radar Blueprint */}
          <div className="w-full h-56 sm:h-72 bg-[#121420] border border-yellow-400/30 rounded-2xl relative overflow-hidden shadow-inner">
            {/* Grid Conduits */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-4 border border-white/10 rounded-full" />
            <div className="absolute inset-16 border border-white/5 rounded-full" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />

            {/* Central Monument */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: '50%', top: '50%' }}
            >
              <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-white shadow-[0_0_15px_#ffe600] animate-pulse" />
              <span className="text-[9px] font-mono font-black text-yellow-300 mt-1 whitespace-nowrap bg-black/70 px-1 rounded">
                ⚡ Monument & Buzzer
              </span>
            </div>

            {/* Live Stage */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: '50%', top: `${(( -32 + 65 ) / 130) * 100}%` }}
            >
              <div className="w-6 h-3 rounded-sm bg-cyan-400 border border-white shadow-[0_0_15px_#00f0ff]" />
              <span className="text-[9px] font-mono font-black text-cyan-300 mt-1 whitespace-nowrap bg-black/70 px-1 rounded">
                🎵 Live Fam Stage
              </span>
            </div>

            {/* Stalls Pins */}
            {STALLS.map((s) => {
              const sx = ((s.position[0] + 65) / 130) * 100;
              const sy = ((s.position[2] + 65) / 130) * 100;
              return (
                <button
                  key={s.id}
                  onClick={() => handleTeleport(s.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform hover:scale-125 cursor-pointer z-10"
                  style={{ left: `${sx}%`, top: `${sy}%` }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-black text-white"
                    style={{ backgroundColor: s.accentColor || s.color }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <span className="text-[9px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap group-hover:text-yellow-400 transition-colors">
                    {s.name}
                  </span>
                </button>
              );
            })}

            {/* Current Player Pin */}
            <div
              className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 z-20"
              style={{
                left: `${playerMapX}%`,
                top: `${playerMapY}%`,
                transform: `translate(-50%, -50%) rotate(${playerPos.rotY}rad)`,
              }}
            >
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-yellow-400 mx-auto filter drop-shadow(0 0 8px #ffe600)" />
              <div className="w-2 h-2 rounded-full bg-white mx-auto -mt-1 shadow" />
            </div>

            <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-lg text-[10px] text-zinc-300 font-mono">
              You are here: <span className="text-yellow-400 font-bold">X:{Math.round(playerPos.x)} Z:{Math.round(playerPos.z)}</span>
            </div>
          </div>

          {/* Stalls Directory Grid with 1-Tap Travel */}
          <div>
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-2.5">
              Brand Stalls Directory ({STALLS.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {STALLS.map((s) => {
                const dist = Math.round(
                  Math.hypot(playerPos.x - s.position[0], playerPos.z - s.position[2])
                );

                return (
                  <div
                    key={s.id}
                    className="bg-[#141724] border border-white/10 hover:border-yellow-400/40 rounded-2xl p-3 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs shadow"
                            style={{ backgroundColor: s.color }}
                          >
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white group-hover:text-yellow-400 transition-colors">
                              {s.name}
                            </h4>
                            <span className="text-[10px] text-zinc-400">{s.category}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                          {dist}m away
                        </span>
                      </div>
                      <p className="text-xs text-yellow-300/90 font-medium mt-2 line-clamp-1">
                        {s.specialOffer}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTeleport(s.id)}
                      className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-yellow-400 hover:text-black text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Walk / Travel Here</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0c0d14] border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Tap any stall to travel directly or follow the map.</span>
          <span className="text-yellow-400 font-bold">FamFest GPS Active</span>
        </div>
      </div>
    </div>
  );
};
