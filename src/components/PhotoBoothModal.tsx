/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Printer, Sparkles, X, RefreshCw, Users, Heart, Share2 } from 'lucide-react';
import { soundEngine } from '../services/audio';

interface PhotoBoothModalProps {
  initialSnapshot: string;
  playerName: string;
  squadMembers: string[];
  roomCode: string;
  onClose: () => void;
  onRetake: () => string;
}

type FilterType = 'normal' | 'vintage' | 'cyber' | 'golden' | 'monochrome';
type StickerType = 'none' | 'fambird' | 'flex' | 'squad' | 'noscam';

export const PhotoBoothModal: React.FC<PhotoBoothModalProps> = ({
  initialSnapshot,
  playerName,
  squadMembers,
  roomCode,
  onClose,
  onRetake,
}) => {
  const [snapshotUrl, setSnapshotUrl] = useState<string>(initialSnapshot);
  const [filter, setFilter] = useState<FilterType>('vintage');
  const [selectedSticker, setSelectedSticker] = useState<StickerType>('fambird');
  const [caption, setCaption] = useState<string>(`FamFest '26 w/ the squad! 🔥`);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRetake = () => {
    soundEngine.playCameraShutter();
    const newSnap = onRetake();
    if (newSnap) {
      setSnapshotUrl(newSnap);
    }
  };

  const getFilterStyle = (f: FilterType) => {
    switch (f) {
      case 'vintage':
        return 'sepia(45%) contrast(110%) brightness(105%) saturate(125%)';
      case 'cyber':
        return 'contrast(135%) saturate(160%) hue-rotate(25deg)';
      case 'golden':
        return 'brightness(112%) saturate(140%) sepia(25%)';
      case 'monochrome':
        return 'grayscale(100%) contrast(140%) brightness(95%)';
      default:
        return 'none';
    }
  };

  // Render high-res downloadable Polaroid canvas
  const generatePolaroidCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1250;
    const ctx = canvas.getContext('2d')!;

    // 1. Polaroid White Card Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1000, 1250);

    // Subtle paper texture drop-shadow
    ctx.fillStyle = '#F8F8FA';
    ctx.fillRect(40, 40, 920, 920);

    // 2. Draw Snapshot Image
    const img = new Image();
    img.src = snapshotUrl;

    // Apply Filter on offscreen canvas
    ctx.save();
    ctx.filter = getFilterStyle(filter);
    ctx.drawImage(img, 50, 50, 900, 900);
    ctx.restore();

    // 3. Vintage Vignette & Light leak
    const grad = ctx.createRadialGradient(500, 500, 300, 500, 500, 600);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(50, 50, 900, 900);

    // 4. Handwritten Caption & Details in bottom margin
    ctx.fillStyle = '#181A22';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(caption, 60, 1030);

    ctx.fillStyle = '#6E7282';
    ctx.font = '500 24px "JetBrains Mono", monospace';
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    ctx.fillText(`📅 ${dateStr}  •  FAM WORLD #${roomCode}`, 60, 1080);

    // Squad list
    const allMembers = [playerName, ...squadMembers].filter(Boolean);
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8B8F9F';
    ctx.fillText(`👥 Squad: ${allMembers.slice(0, 4).join(', ')}`, 60, 1125);

    // 5. FamFest Gold Stamp in Bottom Right
    ctx.fillStyle = '#FFE600';
    ctx.beginPath();
    ctx.roundRect(740, 1020, 200, 55, 16);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ FAMFEST 3D', 840, 1055);

    // 6. Draw Selected Decorative Sticker
    if (selectedSticker !== 'none') {
      ctx.save();
      ctx.translate(820, 840);
      ctx.rotate(-0.15);

      if (selectedSticker === 'fambird') {
        ctx.fillStyle = '#FFE600';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(-80, -35, 160, 70, 20);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'black 26px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('🐥 FAMBIRD', 0, 8);
      } else if (selectedSticker === 'flex') {
        ctx.fillStyle = '#FFB800';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(-85, -35, 170, 70, 20);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'black 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('👑 FLEX VIP', 0, 8);
      } else if (selectedSticker === 'squad') {
        ctx.fillStyle = '#FF2E93';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(-90, -35, 180, 70, 20);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'black 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('🔥 MAIN SQUAD', 0, 8);
      } else if (selectedSticker === 'noscam') {
        ctx.fillStyle = '#00E676';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(-95, -35, 190, 70, 20);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'black 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('🛡️ NO SCAM', 0, 8);
      }

      ctx.restore();
    }

    return canvas;
  };

  const handleDownload = () => {
    soundEngine.playCoin();
    const canvas = generatePolaroidCanvas();
    const link = document.createElement('a');
    link.download = `FamFest_Polaroid_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    setIsPrinting(true);
    soundEngine.playCameraShutter();
    const canvas = generatePolaroidCanvas();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>FamFest Polaroid Print</title>
            <style>
              body { margin: 0; display: flex; align-items: center; justify-content: center; background: #222; }
              img { max-width: 90vw; max-height: 95vh; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/png')}" onload="window.print();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setIsPrinting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    soundEngine.playCoin();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#181a28] via-[#12141f] to-[#0d0e17] border-2 border-pink-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(255,46,147,0.35)] max-h-[92vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>FamFest Polaroid Studio</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Capture authentic memories with friends across Fam World</p>
          </div>
        </div>

        {/* Polaroid Card Preview */}
        <div className="flex justify-center mb-5">
          <div className="w-full max-w-sm bg-white p-3.5 sm:p-4 rounded-xl shadow-2xl text-black transition-transform duration-200 hover:rotate-1">
            {/* Photo Box */}
            <div className="relative aspect-square w-full bg-black rounded overflow-hidden shadow-inner">
              <img
                src={snapshotUrl}
                alt="FamFest Snapshot"
                className="w-full h-full object-cover transition-all duration-300"
                style={{ filter: getFilterStyle(filter) }}
              />

              {/* Decorative Sticker Overlay */}
              {selectedSticker !== 'none' && (
                <div className="absolute bottom-3 right-3 transform -rotate-6 select-none shadow-lg">
                  {selectedSticker === 'fambird' && (
                    <span className="px-3 py-1.5 rounded-xl bg-yellow-400 text-black font-black text-xs border-2 border-black">
                      🐥 FAMBIRD
                    </span>
                  )}
                  {selectedSticker === 'flex' && (
                    <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs border-2 border-white">
                      👑 FLEX VIP
                    </span>
                  )}
                  {selectedSticker === 'squad' && (
                    <span className="px-3 py-1.5 rounded-xl bg-pink-600 text-white font-black text-xs border-2 border-white">
                      🔥 MAIN SQUAD
                    </span>
                  )}
                  {selectedSticker === 'noscam' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs border-2 border-black">
                      🛡️ NO SCAM
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Polaroid Margin */}
            <div className="pt-3 pb-1">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={45}
                className="w-full text-sm font-bold text-zinc-900 border-b border-zinc-200 focus:border-black outline-none pb-0.5 bg-transparent"
                placeholder="Write handwritten squad caption..."
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1 font-mono">
                <span>FAM WORLD #{roomCode}</span>
                <span>{playerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="space-y-4 mb-6">
          {/* Filter Choices */}
          <div>
            <label className="text-xs font-bold text-zinc-300 mb-2 block uppercase tracking-wider">
              Film Filter
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'vintage', label: 'Vintage 90s' },
                { id: 'cyber', label: 'Cyber Neon' },
                { id: 'golden', label: 'Golden Hour' },
                { id: 'monochrome', label: 'B&W Film' },
                { id: 'normal', label: 'Original' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as FilterType)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filter === f.id
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 border border-pink-400'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sticker Choices */}
          <div>
            <label className="text-xs font-bold text-zinc-300 mb-2 block uppercase tracking-wider">
              Add Photo Sticker
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'fambird', label: '🐥 FamBird' },
                { id: 'flex', label: '👑 Flex VIP' },
                { id: 'squad', label: '🔥 Squad' },
                { id: 'noscam', label: '🛡️ No Scam' },
                { id: 'none', label: 'None' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSticker(s.id as StickerType)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSticker === s.id
                      ? 'bg-yellow-400 text-black font-black border border-black shadow'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Squad Members Present */}
        {squadMembers.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 mb-5 text-xs text-zinc-300">
            <Users className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Friends in booth: <strong className="text-white">{squadMembers.join(', ')}</strong></span>
          </div>
        )}

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={handleRetake}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Photo</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-400/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save Polaroid</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Photo</span>
          </button>

          <button
            onClick={handleShare}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Room'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
