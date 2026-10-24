/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Hand } from 'lucide-react';

interface TapliToastProps {
  friendName: string;
  onDismiss: () => void;
}

export const TapliToast: React.FC<TapliToastProps> = ({ friendName, onDismiss }) => {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
      setTimeout(onDismiss, 300);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 font-['Plus_Jakarta_Sans',sans-serif] ${
      animating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4'
    }`}>
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black font-black text-sm shadow-[0_0_35px_rgba(255,230,0,0.7)] border-2 border-black animate-bounce">
        <span className="text-xl">👋</span>
        <div className="flex items-center gap-1.5">
          <span className="tracking-wide">TAPLI!</span>
          <span className="font-normal text-xs text-black/80">Bumped into <strong>{friendName}</strong></span>
        </div>
        <Sparkles className="w-4 h-4 fill-black shrink-0" />
      </div>
    </div>
  );
};
