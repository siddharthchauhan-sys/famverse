/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Sparkles, Navigation } from 'lucide-react';
import { STALLS } from '../game/stallData';

interface ControlsDockProps {
  onTeleport: (stallId: string) => void;
  onOpenCustomizer: () => void;
  isHoverboard: boolean;
  onToggleHoverboard: () => void;
}

export const ControlsDock: React.FC<ControlsDockProps> = ({
  onTeleport,
  onOpenCustomizer,
  isHoverboard,
  onToggleHoverboard,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-transform duration-300 font-['Plus_Jakarta_Sans',sans-serif] ${
        isCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
      }`}
      style={{ maxWidth: 'min(940px, 94vw)', width: '100%' }}
    >
      {/* Collapse / Expand Toggle Button on top edge */}
      <div className="flex justify-center -mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0f1118]/95 border-t border-x border-yellow-400/30 rounded-t-xl text-[11px] font-bold text-zinc-300 hover:text-yellow-400 transition-colors shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-yellow-400" />
              <span>Show Controls & Stalls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Hide Controls (Zen Mode)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Bottom Dock Panel */}
      <div className="bg-[#0f1118]/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick Teleport Stalls Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1 pr-2 shrink-0">
              <Navigation className="w-3.5 h-3.5 text-yellow-400" />
              <span>Teleport</span>
            </div>

            {STALLS.map((s) => (
              <button
                key={s.id}
                onClick={() => onTeleport(s.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer border border-white/5"
                title={`Fast travel to ${s.name} Stall`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.accentColor || s.color }} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions & Navigation Controls Legend */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
            {/* Hoverboard Ride Toggle */}
            <button
              onClick={onToggleHoverboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${
                isHoverboard
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isHoverboard ? 'Hoverboard ON' : 'Ride Hoverboard'}</span>
            </button>

            {/* Avatar Style */}
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Look</span>
            </button>

            {/* Navigation Keys Hint (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 font-mono">
              <span className="text-yellow-400 font-bold">WASD / Tap</span>
              <span>to walk •</span>
              <span className="text-yellow-400 font-bold">Drag</span>
              <span>to turn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
