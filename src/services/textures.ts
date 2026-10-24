/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Cache generated canvas textures to avoid redundant allocations
const textureCache = new Map<string, THREE.CanvasTexture>();

function setupTexture(texture: THREE.CanvasTexture, maxAnisotropy: number = 4): THREE.CanvasTexture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// 1. Campus Cyber Pavement Grid Texture
export function createPlazaPavementTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const key = 'plaza_pavement';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark cyber-slate background
  ctx.fillStyle = '#0f1118';
  ctx.fillRect(0, 0, 1024, 1024);

  // Large paver tiles
  const tileSize = 128;
  for (let x = 0; x < 1024; x += tileSize) {
    for (let y = 0; y < 1024; y += tileSize) {
      // Subtle tile variance
      const shade = Math.floor(22 + (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * 4);
      ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 8})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Micro bevel border
      ctx.strokeStyle = '#07080d';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, tileSize, tileSize);

      // Cyber neon corner dots every other tile
      if ((x + y) % (tileSize * 2) === 0) {
        ctx.fillStyle = 'rgba(255, 230, 0, 0.45)'; // FamApp yellow glow dot
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Linear energy cyber conduits running along the ground
  ctx.strokeStyle = 'rgba(255, 230, 0, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 1024);
  ctx.moveTo(768, 0); ctx.lineTo(768, 1024);
  ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.repeat.set(16, 16);
  setupTexture(texture, maxAnisotropy);
  textureCache.set(key, texture);
  return texture;
}

// 2. Festival Arch Banner ("FAMFEST 2026")
export function createFestivalBannerTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const key = 'festival_banner';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // FamApp yellow background with dark border
  const grad = ctx.createLinearGradient(0, 0, 1024, 256);
  grad.addColorStop(0, '#FFE600');
  grad.addColorStop(0.5, '#FFF04B');
  grad.addColorStop(1, '#FFCC00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  // Border accents
  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, 1024, 18);
  ctx.fillRect(0, 238, 1024, 18);

  // Decorative chevron stripes
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let i = 0; i < 1024; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 20, 0);
    ctx.lineTo(i + 40, 256);
    ctx.lineTo(i + 20, 256);
    ctx.fill();
  }

  // Main text
  ctx.fillStyle = '#0f1118';
  ctx.font = '900 76px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ FAMFEST 2026 ⚡', 512, 110);

  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillStyle = '#222';
  ctx.fillText('CAMPUS REWARDS & AFFILIATE EXPO • GET COUPONS', 512, 185);

  const texture = new THREE.CanvasTexture(canvas);
  setupTexture(texture, maxAnisotropy);
  textureCache.set(key, texture);
  return texture;
}

// 3. Brand Stall Banner & Signs
export function createBrandSignTexture(
  brandName: string,
  tagline: string,
  bgColor: string,
  textColor: string,
  accentColor: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const key = `brand_sign_${brandName}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 256);

  // Glowing borders
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 240);

  // Inner subtle pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 512; i += 32) {
    ctx.fillRect(i, 0, 16, 256);
  }

  // Pill badge
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(140, 24, 232, 34, 17);
  ctx.fill();

  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#0F1118';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OFFICIAL PARTNER', 256, 41);

  // Main Brand Name
  ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText(brandName.toUpperCase(), 256, 125);

  // Tagline / Coupon teaser
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.9;
  ctx.fillText(tagline, 256, 195);
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  setupTexture(texture, maxAnisotropy);
  textureCache.set(key, texture);
  return texture;
}

// 4. Stall Front Counter Poster / Menu
export function createStallCounterTexture(
  brandName: string,
  offer: string,
  code: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const key = `stall_counter_${brandName}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark carbon panel
  ctx.fillStyle = '#141721';
  ctx.fillRect(0, 0, 512, 256);

  // Top bar
  ctx.fillStyle = '#FFE600';
  ctx.fillRect(0, 0, 512, 16);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXCLUSIVE FAM OFFER', 256, 65);

  ctx.fillStyle = '#00F0FF';
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(offer, 256, 120);

  // Promo code badge
  ctx.fillStyle = '#1F2433';
  ctx.strokeStyle = '#FFE600';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(86, 155, 340, 60, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFE600';
  ctx.font = '800 28px "JetBrains Mono", monospace';
  ctx.fillText(`CODE: ${code}`, 256, 195);

  const texture = new THREE.CanvasTexture(canvas);
  setupTexture(texture, maxAnisotropy);
  textureCache.set(key, texture);
  return texture;
}

// 5. Stage DJ / LED Screen Visualizer
export function createDJScreenTexture(time: number = 0): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#06070a';
  ctx.fillRect(0, 0, 512, 256);

  // Neon audio visualizer bars
  const numBars = 32;
  const barWidth = 512 / numBars - 4;
  for (let i = 0; i < numBars; i++) {
    const height = Math.abs(Math.sin(time * 3 + i * 0.4)) * 180 + 20;
    const grad = ctx.createLinearGradient(0, 256 - height, 0, 256);
    grad.addColorStop(0, '#00F0FF');
    grad.addColorStop(0.5, '#FFE600');
    grad.addColorStop(1, '#FF2E93');

    ctx.fillStyle = grad;
    ctx.fillRect(i * (barWidth + 4) + 2, 256 - height, barWidth, height);
  }

  // Central FamApp lightning badge
  ctx.fillStyle = '#FFE600';
  ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ LIVE FAM STAGE ⚡', 256, 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 6. Coin Icon Texture for 3D FamCoin face
export function createCoinFaceTexture(): THREE.CanvasTexture {
  const key = 'coin_face';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Golden circular radial gradient
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, '#FFF59D');
  grad.addColorStop(0.5, '#FBC02D');
  grad.addColorStop(1, '#F57F17');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Embossed ring
  ctx.strokeStyle = '#FFEE58';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  // FamApp "F" / Lightning bolt emblem
  ctx.fillStyle = '#0F1118';
  ctx.beginPath();
  ctx.moveTo(135, 45);
  ctx.lineTo(85, 135);
  ctx.lineTo(125, 135);
  ctx.lineTo(115, 215);
  ctx.lineTo(175, 115);
  ctx.lineTo(135, 115);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}
