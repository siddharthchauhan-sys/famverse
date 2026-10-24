/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, CheckCircle2, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RemotePlayer, AuditLog, VirtualAsset } from '../types';
import { UNLOCKABLE_VIRTUAL_ASSETS } from '../game/personaData';
import { soundEngine } from '../services/audio';

interface EmergencyTribunalModalProps {
  callerName: string;
  myPlayerId: string;
  players: RemotePlayer[];
  auditLogs: AuditLog[];
  chatMessages: { id: string; senderName: string; text: string; time: string }[];
  onCastVote: (targetId: string | null) => void;
  onSendChat: (text: string) => void;
  voteResult: {
    ejectedId: string | null;
    ejectedName: string;
    wasScammer: boolean;
    winner: 'savers' | 'scammer' | null;
  } | null;
  onCloseResult: () => void;
  onClaimAsset: (asset: VirtualAsset) => void;
}

const QUICK_CHAT_OPTIONS = [
  'I was collecting coupons at boAt!',
  'Saw someone acting sus near Zomato QR!',
  'I was auditing the UPI Soundbox terminal.',
  'Terminals are safe, lets vote Skip.',
  'Vote out the suspect near the stage!',
];

export const EmergencyTribunalModal: React.FC<EmergencyTribunalModalProps> = ({
  callerName,
  myPlayerId,
  players,
  auditLogs,
  chatMessages,
  onCastVote,
  onSendChat,
  voteResult,
  onCloseResult,
  onClaimAsset,
}) => {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [customChat, setCustomChat] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(35);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When vote result comes in and it's a win for Savers, fire celebratory confetti
  useEffect(() => {
    if (voteResult && voteResult.wasScammer) {
      soundEngine.playCouponUnlock();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FFE600', '#10B981', '#00F0FF', '#ffffff'],
      });
    }
  }, [voteResult]);

  const handleVote = (targetId: string | null) => {
    setSelectedVote(targetId);
    setHasVoted(true);
    onCastVote(targetId);
    soundEngine.playStallInteract();
  };

  const handleSendCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChat.trim()) return;
    onSendChat(customChat.trim());
    setCustomChat('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d0f17] border-2 border-red-500/70 rounded-3xl shadow-[0_0_80px_rgba(255,23,68,0.45)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-900/90 via-[#181a26] to-red-900/90 px-6 py-4 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/90 flex items-center justify-center shadow-lg shadow-red-600/50">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-white tracking-wider">
                  FAMAPP FRAUD TRIBUNAL
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                  Emergency Audit
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Summoned by <span className="font-extrabold text-yellow-400">{callerName}</span> • Unmask the Payment Phishing Impostor!
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <span className="text-xs text-zinc-400 uppercase font-bold font-mono">Time:</span>
            <span
              className={`text-base font-black font-mono ${
                timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Player Suspect Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                Students on Campus ({players.length})
              </h3>
              <span className="text-xs text-zinc-400">
                {hasVoted ? '✅ Your Vote Cast' : 'Select a student to vote out'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p) => {
                const isMe = p.id === myPlayerId;
                const isSelected = selectedVote === p.id;
                const voteCount = players.filter((pl) => pl.votedFor === p.id).length;

                return (
                  <div
                    key={p.id}
                    className={`bg-[#141724] border rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow"
                        style={{ backgroundColor: p.customization?.hoodieColor || '#FFE600' }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-white truncate">
                            {p.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-bold bg-yellow-400 text-black px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 block truncate">
                          {p.persona}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {p.votedFor ? 'Voted' : 'Thinking...'}
                        {voteCount > 0 && (
                          <span className="ml-1 text-red-400 font-bold">({voteCount} votes)</span>
                        )}
                      </div>

                      <button
                        disabled={hasVoted}
                        onClick={() => handleVote(p.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          hasVoted
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                        }`}
                      >
                        Vote Suspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Skip Vote Button */}
            <div className="pt-2">
              <button
                disabled={hasVoted}
                onClick={() => handleVote(null)}
                className={`w-full py-2.5 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                  selectedVote === null && hasVoted
                    ? 'bg-zinc-700 border-yellow-400 text-yellow-300'
                    : 'bg-[#141724] border-white/10 hover:border-white/30 text-zinc-300'
                }`}
              >
                Skip Vote (Insufficient Evidence)
              </button>
            </div>
          </div>

          {/* Right Column: Evidence Log & Campus Discussion (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Audit Evidence Log */}
            <div className="bg-[#141724] border border-white/10 rounded-2xl p-4">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-2">
                Campus Security Incident Logs
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs text-zinc-300">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded-xl border text-[11px] leading-relaxed ${
                      log.severity === 'alert'
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-black/30 border-white/5 text-zinc-300'
                    }`}
                  >
                    <span className="font-mono text-zinc-500 mr-1.5">{log.time}</span>
                    <span>{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion Chat */}
            <div className="bg-[#141724] border border-white/10 rounded-2xl p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-2">
                  Campus Tribunal Chat
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
                  {chatMessages.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2">
                      Share your alibi or who you saw near the tampered kiosks!
                    </p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="text-xs bg-black/40 p-2 rounded-xl border border-white/5">
                        <span className="font-extrabold text-yellow-400">{msg.senderName}: </span>
                        <span className="text-zinc-200">{msg.text}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Chat Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_CHAT_OPTIONS.slice(0, 3).map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendChat(chip)}
                      className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-lg border border-white/5 transition-colors cursor-pointer truncate max-w-full"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendCustomChat} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Type alibi or suspicion..."
                  value={customChat}
                  onChange={(e) => setCustomChat(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Ejection / Vote Result Overlay Screen */}
        {voteResult && (
          <div className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            {voteResult.wasScammer ? (
              <div className="max-w-md w-full space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-white">FRAUDSTER UNMASKED!</h3>
                <p className="text-sm text-green-300 font-bold">
                  {voteResult.ejectedName} was The Payment Phishing Scammer!
                </p>
                <p className="text-xs text-zinc-300">
                  Campus security is restored! All participating students are awarded the legendary{' '}
                  <span className="font-extrabold text-yellow-400">Titanium Black FamCard</span> & bonus FamCoins!
                </p>

                {/* Reward Claim Banner */}
                <div className="bg-[#141724] border border-yellow-400/40 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="text-3xl">🖤</div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-yellow-400">Virtual Asset Unlocked</span>
                      <h4 className="font-black text-sm text-white">Black FamCard Titanium Edition</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClaimAsset(UNLOCKABLE_VIRTUAL_ASSETS.black_card);
                      onCloseResult();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-extrabold text-xs shadow-md hover:brightness-110 cursor-pointer"
                  >
                    Claim Asset
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md w-full space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-2xl font-black text-white">INNOCENT EJECTED</h3>
                <p className="text-sm text-red-300 font-bold">
                  {voteResult.ejectedName} was NOT The Scammer!
                </p>
                <p className="text-xs text-zinc-400">
                  The financial scammer is still loose in the campus. Be vigilant of tampered kiosks!
                </p>
                <button
                  onClick={onCloseResult}
                  className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Return to Campus
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
