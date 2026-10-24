/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Coupon {
  id: string;
  brandId: string;
  brandName: string;
  code: string;
  discount: string;
  title: string;
  description: string;
  category: 'Food' | 'Fashion' | 'Tech' | 'Entertainment' | 'Gaming';
  minSpend?: string;
  validUntil: string;
  unlockedAt?: number;
  featuredColor: string;
  brandLogoText: string;
  affiliateUrl: string;
}

export interface StallData {
  id: string;
  name: string;
  category: 'Food' | 'Fashion' | 'Tech' | 'Entertainment' | 'Gaming';
  tagline: string;
  color: string;
  accentColor: string;
  position: [number, number, number];
  rotationY: number;
  coupons: Coupon[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    bonusDiscount: string;
    bonusCode: string;
  };
  specialOffer: string;
  decorType: 'burger' | 'sneaker' | 'headphones' | 'music' | 'gamepad' | 'pizza';
}

export interface CoinCollectible {
  id: string;
  position: [number, number, number];
  value: number;
  collected: boolean;
  isMysteryBox?: boolean;
}

export interface PlayerCustomization {
  hoodieColor: string;
  hairColor: string;
  skinColor: string;
  trailColor: string;
  mount: 'shoes' | 'hoverboard' | 'scooter';
}

export type PersonaType =
  | 'Campus Hustler'
  | 'Sneakerhead Scout'
  | 'Cyber DJ'
  | 'Foodie Ninja'
  | 'Fintech Whiz'
  | 'Vibe Curator';

export interface PersonaDef {
  id: PersonaType;
  title: string;
  tagline: string;
  perk: string;
  defaultHoodie: string;
  defaultTrail: string;
  icon: string;
}

export interface RemotePlayer {
  id: string;
  name: string;
  persona: PersonaType;
  role: 'saver' | 'scammer';
  position: [number, number, number];
  rotationY: number;
  isMoving: boolean;
  speed: number;
  isHoverboard: boolean;
  customization: PlayerCustomization;
  coins: number;
  tasksCompleted: number;
  votedFor: string | null;
  isAlive: boolean;
  isBot?: boolean;
}

export interface VirtualAsset {
  id: string;
  title: string;
  type: 'card' | 'badge' | 'skin' | 'voucher';
  tier: 'Legendary' | 'Epic' | 'Rare';
  description: string;
  cardNumber?: string;
  rewardValue: string;
  iconEmoji: string;
  unlockedAt: number;
  gradientBg: string;
}

export interface Sabotage {
  id: string;
  type: 'phishing_qr' | 'jammed_soundbox' | 'fake_coupon' | 'coin_siphon';
  stallId: string;
  stallName: string;
  fixed: boolean;
  tamperedBy: string;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  text: string;
  time: string;
  severity: 'info' | 'warning' | 'alert';
}

export interface PlayerTask {
  id: string;
  title: string;
  stallId: string;
  stallName: string;
  category: 'Food' | 'Fashion' | 'Tech' | 'Entertainment' | 'Gaming';
  description: string;
  completed: boolean;
  rewardCoins: number;
}

export interface RobberyAlert {
  id: string;
  stolenCouponsCount: number;
  stolenCoins: number;
  timestamp: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardCoins: number;
}

export interface FlexZoneExperience {
  id: 'zomato_gold' | 'cinepolis';
  title: string;
  brand: string;
  tagline: string;
  vipPerks: string[];
  exclusivePromoCode: string;
  exclusiveDiscount: string;
  validUntil: string;
  coverImageTheme: string;
}

export interface PhotoBoothSnapshot {
  id: string;
  imageUrl: string;
  timestamp: string;
  filter: 'vintage' | 'neon' | 'cyber' | 'bw';
  caption: string;
}
