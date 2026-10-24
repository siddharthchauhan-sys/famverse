/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Users, Share2, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { PERSONAS } from '../game/personaData';
import { PersonaType, PlayerCustomization } from '../types';

interface PersonaSelectorModalProps {
  currentName: string;
  currentPersona: PersonaType;
  myRole: 'saver' | 'scammer';
  roomCode: string;
  onSave: (name: string, persona: PersonaType, custom: PlayerCustomization) => void;
  onClose: () => void;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  currentName,
  currentPersona,
  myRole,
  roomCode,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(currentName);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(currentPersona);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleApply = () => {
    const pDef = PERSONAS.find((p) => p.id === selectedPersona);
    const custom: PlayerCustomization = {
      hoodieColor: pDef?.defaultHoodie || '#FFE600',
      hairColor: '#12141c',
      skinColor: '#f5cba7',
      trailColor: pDef?.defaultTrail || '#FFE600',
      mount: 'shoes',
    };
    onSave(name.trim() || 'FamStudent', selectedPersona, custom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0f1118] border border-yellow-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-black text-xl shadow">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Student Persona & Access</h2>
              <p className="text-xs text-zinc-400">Choose your campus avatar and invite friends</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Room Code & Invite Friends Access Banner */}
          <div className="bg-[#141724] border border-yellow-400/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase text-white tracking-wider">Multiplayer Campus Room</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Room Code: <span className="font-mono text-yellow-300 font-extrabold">{roomCode}</span>
              </p>
            </div>

            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>

          {/* Secret Role Status Indicator */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {myRole === 'scammer' ? (
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Your Secret Role</span>
                <p className="text-xs font-black text-white">
                  {myRole === 'scammer'
                    ? '🕵️ The Phishing Scammer (Sabotage kiosks, do not get caught!)'
                    : '🛡️ Campus Saver (Collect coupons & audit suspicious kiosks)'}
                </p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2 block">
              Student Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Yash, Ananya, Kabir"
              className="w-full bg-[#141724] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 font-semibold"
            />
          </div>

          {/* Personas Grid */}
          <div>
            <label className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2 block">
              Choose Persona & Trait ({PERSONAS.length})
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/10'
                        : 'border-white/10 bg-[#141724] hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{p.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <h4 className="font-extrabold text-sm text-white mt-2">{p.title}</h4>
                      <p className="text-xs text-zinc-300 mt-0.5">{p.tagline}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <span className="text-[11px] font-mono font-bold text-yellow-400">{p.perk}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c0d14] border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save & Enter Campus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
