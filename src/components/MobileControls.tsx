/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Map, Zap, AlertTriangle, Shield, Bell, Skull, Camera, Crown, Compass } from 'lucide-react';
import { StallData, RemotePlayer } from '../types';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onAim: (x: number, y: number) => void;
  myRole: 'saver' | 'scammer';
  nearStall: StallData | null;
  nearPlayer: RemotePlayer | null;
  isNearEmergencyBuzzer: boolean;
  isNearPhotoBooth: boolean;
  isNearFlexGate: boolean;
  isFlexMember: boolean;
  isCurrentStallSabotaged: boolean;
  isHoverboard: boolean;
  onOpenStall: (stall: StallData) => void;
  onOpenPhotoBooth: () => void;
  onOpenFlexGate: () => void;
  onRobNearPlayer: (victimId: string) => void;
  onFixSabotage: () => void;
  onTriggerEmergency: () => void;
  onToggleHoverboard: () => void;
  onOpenMap: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onAim,
  myRole,
  nearStall,
  nearPlayer,
  isNearEmergencyBuzzer,
  isNearPhotoBooth,
  isNearFlexGate,
  isFlexMember,
  isCurrentStallSabotaged,
  isHoverboard,
  onOpenStall,
  onOpenPhotoBooth,
  onOpenFlexGate,
  onRobNearPlayer,
  onFixSabotage,
  onTriggerEmergency,
  onToggleHoverboard,
  onOpenMap,
}) => {
  // 1. Move Joystick State (Left)
  const moveRef = useRef<HTMLDivElement>(null);
  const [moveKnob, setMoveKnob] = useState({ x: 0, y: 0 });
  const moveTouchId = useRef<number | null>(null);

  // 2. Aim Joystick State (Right)
  const aimRef = useRef<HTMLDivElement>(null);
  const [aimKnob, setAimKnob] = useState({ x: 0, y: 0 });
  const aimTouchId = useRef<number | null>(null);

  const radius = 42;

  // Move Joystick Handlers
  const handleMoveTouchStart = (e: React.TouchEvent) => {
    if (moveTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    moveTouchId.current = touch.identifier;
    updateMoveKnob(touch.clientX, touch.clientY);
  };

  const handleMoveTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId.current) {
        updateMoveKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleMoveTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId.current) {
        moveTouchId.current = null;
        setMoveKnob({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  const updateMoveKnob = (clientX: number, clientY: number) => {
    if (!moveRef.current) return;
    const rect = moveRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(dist, radius);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setMoveKnob({ x: kx, y: ky });
    onMove(kx / radius, ky / radius);
  };

  // Aim Joystick Handlers
  const handleAimTouchStart = (e: React.TouchEvent) => {
    if (aimTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    aimTouchId.current = touch.identifier;
    updateAimKnob(touch.clientX, touch.clientY);
  };

  const handleAimTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === aimTouchId.current) {
        updateAimKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleAimTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === aimTouchId.current) {
        aimTouchId.current = null;
        setAimKnob({ x: 0, y: 0 });
        onAim(0, 0);
        break;
      }
    }
  };

  const updateAimKnob = (clientX: number, clientY: number) => {
    if (!aimRef.current) return;
    const rect = aimRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(dist, radius);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setAimKnob({ x: kx, y: ky });
    onAim(kx / radius, ky / radius);
  };

  useEffect(() => {
    return () => {
      onMove(0, 0);
      onAim(0, 0);
    };
  }, [onMove, onAim]);

  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none z-20 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Proximity Action Pill Stack (Centered above joysticks with zero overlap) */}
      <div className="absolute bottom-32 inset-x-0 flex flex-col items-center gap-2 pointer-events-auto px-4 max-w-sm mx-auto">
        {/* Photo Booth Snapshot Button */}
        {isNearPhotoBooth && (
          <button
            onClick={onOpenPhotoBooth}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs shadow-[0_0_25px_rgba(255,46,147,0.6)] border-2 border-white animate-bounce cursor-pointer active:scale-95 transition-transform"
          >
            <Camera className="w-4 h-4" />
            <span>📸 SNAP POLAROID WITH FRIENDS</span>
          </button>
        )}

        {/* Flex Wall VIP Zone Button */}
        {isNearFlexGate && (
          <button
            onClick={onOpenFlexGate}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black text-xs shadow-[0_0_25px_rgba(255,230,0,0.7)] border-2 border-black animate-pulse cursor-pointer active:scale-95 transition-transform"
          >
            <Crown className="w-4 h-4 fill-black" />
            <span>{isFlexMember ? '👑 ENTER FLEX VIP ZONE' : '🔒 UNLOCK FAM FLEX ACCESS'}</span>
          </button>
        )}

        {/* Emergency Buzzer Button */}
        {isNearEmergencyBuzzer && (
          <button
            onClick={onTriggerEmergency}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-red-600 border-2 border-white text-white font-black text-xs shadow-2xl animate-bounce cursor-pointer active:scale-95 transition-transform"
          >
            <Bell className="w-4 h-4 animate-pulse" />
            <span>🚨 EMERGENCY TRIBUNAL BUZZER</span>
          </button>
        )}

        {/* Robber Stealth Action */}
        {myRole === 'scammer' && nearPlayer && (
          <button
            onClick={() => onRobNearPlayer(nearPlayer.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-2 border-yellow-400 text-white font-black text-xs shadow-2xl animate-pulse cursor-pointer active:scale-95 transition-transform"
          >
            <Skull className="w-4 h-4" />
            <span>🥷 STEAL FROM {nearPlayer.name.toUpperCase()}!</span>
          </button>
        )}

        {/* Fix Sabotaged Kiosk */}
        {isCurrentStallSabotaged && nearStall && (
          <button
            onClick={onFixSabotage}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-yellow-400 border border-black text-black font-black text-xs shadow-lg cursor-pointer active:scale-95 transition-transform"
          >
            <Shield className="w-4 h-4" />
            <span>Fix {nearStall.name} Kiosk (+150₹)</span>
          </button>
        )}

        {/* Primary Stall Visit Button */}
        {nearStall && (
          <button
            onClick={() => onOpenStall(nearStall)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 border-2 border-black text-black font-black text-xs shadow-[0_0_25px_rgba(255,230,0,0.5)] active:scale-95 transition-transform cursor-pointer"
          >
            <span>Visit {nearStall.name} Stall</span>
          </button>
        )}
      </div>

      {/* Dual Virtual Joysticks & Center Utility Bar */}
      <div className="absolute bottom-5 inset-x-0 px-4 flex items-end justify-between pointer-events-auto">
        {/* 1. LEFT JOYSTICK: MOVE */}
        <div className="flex flex-col items-center gap-1">
          <div
            ref={moveRef}
            onTouchStart={handleMoveTouchStart}
            onTouchMove={handleMoveTouchMove}
            onTouchEnd={handleMoveTouchEnd}
            onTouchCancel={handleMoveTouchEnd}
            className="w-28 h-28 rounded-full bg-black/65 border-2 border-yellow-400/35 backdrop-blur-md flex items-center justify-center touch-none shadow-2xl relative"
          >
            <div className="absolute inset-2.5 rounded-full border border-white/10" />
            <div className="absolute inset-6 rounded-full border border-white/5" />

            {/* Center Move Knob */}
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 shadow-[0_0_15px_rgba(255,230,0,0.6)] border-2 border-white/60 flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `translate(${moveKnob.x}px, ${moveKnob.y}px)`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-black/30" />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400/90 font-mono">
            MOVE
          </span>
        </div>

        {/* 2. CENTER UTILITY BAR (Map & Hoverboard) */}
        <div className="flex items-center gap-2 mb-2 p-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-xl">
          <button
            onClick={onOpenMap}
            className="p-2.5 rounded-xl bg-white/10 text-yellow-400 active:scale-90 transition-transform cursor-pointer"
            title="Campus Map"
          >
            <Map className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleHoverboard}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isHoverboard
                ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(255,230,0,0.5)]'
                : 'bg-white/10 text-zinc-300 hover:text-white'
            }`}
            title="Hoverboard"
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        {/* 3. RIGHT JOYSTICK: AIM / DIRECTION */}
        <div className="flex flex-col items-center gap-1">
          <div
            ref={aimRef}
            onTouchStart={handleAimTouchStart}
            onTouchMove={handleAimTouchMove}
            onTouchEnd={handleAimTouchEnd}
            onTouchCancel={handleAimTouchEnd}
            className="w-28 h-28 rounded-full bg-black/65 border-2 border-cyan-400/35 backdrop-blur-md flex items-center justify-center touch-none shadow-2xl relative"
          >
            <div className="absolute inset-2.5 rounded-full border border-white/10" />
            <div className="absolute inset-6 rounded-full border border-white/5" />

            {/* Center Aim Knob */}
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 shadow-[0_0_15px_rgba(0,240,255,0.6)] border-2 border-white/60 flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `translate(${aimKnob.x}px, ${aimKnob.y}px)`,
              }}
            >
              <Compass className="w-5 h-5 text-black/70" />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400/90 font-mono">
            AIM / LOOK
          </span>
        </div>
      </div>
    </div>
  );
};
