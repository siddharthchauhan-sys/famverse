/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PersonaDef, VirtualAsset } from '../types';

export const PERSONAS: PersonaDef[] = [
  {
    id: 'Campus Hustler',
    title: 'Campus Hustler',
    tagline: 'First in line for exclusive drops and coupon streaks',
    perk: 'Speed Boost: +15% movement and hoverboard agility',
    defaultHoodie: '#FFE600',
    defaultTrail: '#FFE600',
    icon: '⚡',
  },
  {
    id: 'Sneakerhead Scout',
    title: 'Sneakerhead Scout',
    tagline: 'Always rocking fresh kicks and hunting Nike dunks',
    perk: 'Sneakerhead: Extra 100 FamCoins on Nike & Myntra stalls',
    defaultHoodie: '#FF5722',
    defaultTrail: '#FF5722',
    icon: '👟',
  },
  {
    id: 'Cyber DJ',
    title: 'Cyber DJ',
    tagline: 'Curating the festival soundwaves and live stage energy',
    perk: 'Bass Drop: Unlocks live stage remix tunes & boAt perks',
    defaultHoodie: '#00F0FF',
    defaultTrail: '#00F0FF',
    icon: '🎧',
  },
  {
    id: 'Foodie Ninja',
    title: 'Foodie Ninja',
    tagline: 'Midnight cravings, biryani runs, and pizza deals',
    perk: 'Munchies Pass: 20% extra discount coupons at Zomato & Domino\'s',
    defaultHoodie: '#E23744',
    defaultTrail: '#FFE600',
    icon: '🍔',
  },
  {
    id: 'Fintech Whiz',
    title: 'Fintech Whiz',
    tagline: 'FamApp security expert, audits QR codes and catches scammers',
    perk: 'Fraud Radar: Instant alert when a kiosk terminal is tampered',
    defaultHoodie: '#10B981',
    defaultTrail: '#10B981',
    icon: '💳',
  },
  {
    id: 'Vibe Curator',
    title: 'Vibe Curator',
    tagline: 'Streetwear fashion, Spotify playlists, and chill campus vibes',
    perk: 'Aesthetic Glow: Unlocks custom neon trails and Spotify VIP',
    defaultHoodie: '#FF2E93',
    defaultTrail: '#7C3AED',
    icon: '🕶️',
  },
];

export const INITIAL_VIRTUAL_ASSETS: VirtualAsset[] = [
  {
    id: 'asset-famcard-standard',
    title: 'FamCard Gen-Z Edition',
    type: 'card',
    tier: 'Rare',
    description: 'Numberless teen debit card for contactless campus payments.',
    cardNumber: '4852 •••• •••• 9012',
    rewardValue: '5% FamCash',
    iconEmoji: '💳',
    unlockedAt: Date.now() - 86400000,
    gradientBg: 'linear-gradient(135deg, #1f2438 0%, #0d0f17 100%)',
  },
];

export const UNLOCKABLE_VIRTUAL_ASSETS: Record<string, VirtualAsset> = {
  black_card: {
    id: 'asset-famcard-black',
    title: 'Black FamCard Titanium Edition',
    type: 'card',
    tier: 'Legendary',
    description: 'Ultra-exclusive laser-etched black titanium contactless card. Unlocked by identifying the Payment Scammer!',
    cardNumber: '4999 •••• •••• 8888',
    rewardValue: '2x Unlimited FamCash + Free Delivery Pass',
    iconEmoji: '🖤',
    unlockedAt: 0,
    gradientBg: 'linear-gradient(135deg, #1a1a24 0%, #000000 100%)',
  },
  gold_card: {
    id: 'asset-famcard-gold',
    title: '24K Gold FamCard VIP',
    type: 'card',
    tier: 'Legendary',
    description: 'Awarded to supreme campus auditors. Unlocks VIP access across all stalls.',
    cardNumber: '4777 •••• •••• 7777',
    rewardValue: '24K Gold Finish + VIP Concierge',
    iconEmoji: '💛',
    unlockedAt: 0,
    gradientBg: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
  },
  glider_skin: {
    id: 'asset-neon-hoverboard',
    title: 'Cyber Neon Glider Mount',
    type: 'skin',
    tier: 'Epic',
    description: 'Aerodynamic floating cyber hoverboard with dual electric lightning exhausts.',
    rewardValue: '+25% Glide Speed & Neon Light Trails',
    iconEmoji: '⚡',
    unlockedAt: 0,
    gradientBg: 'linear-gradient(135deg, #00F0FF 0%, #0044FF 100%)',
  },
  fraud_hunter_badge: {
    id: 'asset-badge-scambuster',
    title: 'Chief Fraud Buster Badge',
    type: 'badge',
    tier: 'Epic',
    description: 'Recognized by FamApp Security for protecting the campus from phishing impostors.',
    rewardValue: 'Auditor Title + 500 Bonus FamCoins',
    iconEmoji: '🛡️',
    unlockedAt: 0,
    gradientBg: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)',
  },
  mega_voucher: {
    id: 'asset-mega-voucher',
    title: 'FamApp VIP 70% Off Universal Coupon',
    type: 'voucher',
    tier: 'Legendary',
    description: 'Valid across Zomato, Nike, boAt, Spotify, and Domino\'s for supreme savings.',
    rewardValue: 'Flat 70% Off up to ₹500',
    iconEmoji: '🎟️',
    unlockedAt: 0,
    gradientBg: 'linear-gradient(135deg, #FF2E93 0%, #7C3AED 100%)',
  },
};
