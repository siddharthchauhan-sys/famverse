/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Dice5, Users, ArrowRight, Shield, Zap } from 'lucide-react';
import { PERSONAS } from '../game/personaData';
import { PersonaType, PlayerCustomization } from '../types';
import { soundEngine } from '../services/audio';

interface RegistrationModalProps {
  initialRoom: string;
  onRegister: (data: {
    name: string;
    persona: PersonaType;
    roomCode: string;
    customization: PlayerCustomization;
  }) => void;
}

const RANDOM_NAMES = ['Aarav', 'Tanvi', 'Kabir', 'Zara', 'Dev', 'Diya', 'Rohan', 'Ananya', 'Yash', 'Isha'];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  initialRoom,
  onRegister,
}) => {
  const [name, setName] = useState(() => {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  });
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('Campus Hustler');
  const [roomCode, setRoomCode] = useState(initialRoom || 'CAMPUS-FAM');

  const handleRandomize = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(random);
    soundEngine.playCoin();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenPersona = PERSONAS.find((p) => p.id === selectedPersona);
    const custom: PlayerCustomization = {
      hoodieColor: chosenPersona?.defaultHoodie || '#FFE600',
      hairColor: '#12141c',
      skinColor: '#f5cba7',
      trailColor: chosenPersona?.defaultTrail || '#FFE600',
      mount: 'shoes',
    };

    soundEngine.playMysteryBox();
    onRegister({
      name: name.trim() || 'Student',
      persona: selectedPersona,
      roomCode: roomCode.trim().toUpperCase() || 'CAMPUS-FAM',
      customization: custom,
    });
  };

  const selectedDef = PERSONAS.find((p) => p.id === selectedPersona)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-black/95 via-[#0c0e17]/95 to-black/95 backdrop-blur-md overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg bg-[#0f111a] border-2 border-yellow-400/40 rounded-3xl shadow-[0_0_60px_rgba(255,230,0,0.25)] overflow-hidden my-auto">
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 p-5 text-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black text-yellow-400 flex items-center justify-center font-black text-2xl shadow-xl">
              ⚡
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest bg-black/15 px-2 py-0.5 rounded">
                FamApp Virtual Campus
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight mt-0.5">
                FAMFEST 3D
              </h1>
            </div>
          </div>
          <span className="text-xs font-black bg-black text-white px-2.5 py-1 rounded-xl uppercase">
            Mobile 3D
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
          <p className="text-xs text-zinc-300">
            Welcome to the 3D festival! Walk around brand stalls to collect real coupons, earn FamCoins, and guard the campus from sneaky robbers!
          </p>

          {/* Student Name */}
          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Your Student Name</span>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-yellow-400 flex items-center gap-1 hover:text-yellow-300 cursor-pointer"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Randomize</span>
              </button>
            </label>
            <input
              type="text"
              required
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your nickname..."
              className="w-full bg-[#161824] border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Persona Selection */}
          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider mb-1.5 block">
              Choose Your Student Persona
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersona(p.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/15 shadow-md shadow-yellow-500/10'
                        : 'border-white/10 bg-[#161824] hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl">{p.icon}</div>
                    <div className="mt-1">
                      <span className="font-black text-xs text-white block truncate">{p.title}</span>
                      <span className="text-[10px] text-zinc-400 block line-clamp-1">{p.tagline}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Persona Highlight */}
            {selectedDef && (
              <div className="mt-2 p-2.5 bg-[#161824] border border-white/10 rounded-xl flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-zinc-300">
                  <span className="font-extrabold text-yellow-400">{selectedDef.title} Perk: </span>
                  {selectedDef.perk}
                </span>
              </div>
            )}
          </div>

          {/* Room Code */}
          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Room Code</span>
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="CAMPUS-FAM"
              className="w-full bg-[#161824] border border-white/10 rounded-2xl px-4 py-2.5 font-mono text-xs font-bold text-yellow-300 focus:outline-none focus:border-yellow-400 uppercase tracking-widest"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 text-black font-black text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>Enter FamFest Campus</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
