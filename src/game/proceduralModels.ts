/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  createBrandSignTexture,
  createStallCounterTexture,
  createCoinFaceTexture,
  createDJScreenTexture,
  createFestivalBannerTexture,
} from '../services/textures';
import { StallData, PlayerCustomization } from '../types';

// Shared materials and geometries where possible for efficiency
const shadowTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
})();

export function createGroundShadow(radius: number = 0.8, opacity: number = 0.45): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.015; // slightly above ground to prevent z-fighting
  mesh.renderOrder = 1;
  return mesh;
}

// 1. Procedural 3D Player Character (8 distinct parts + shadow + optional hoverboard)
export interface CharacterController {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Group;
  hoverboard: THREE.Group;
  updateAnimation: (isMoving: boolean, speed: number, delta: number) => void;
  updateCustomization: (custom: PlayerCustomization) => void;
}

export function createPlayerCharacter(custom: PlayerCustomization): CharacterController {
  const group = new THREE.Group();
  group.name = 'player';

  // Ground shadow
  const shadow = createGroundShadow(0.65, 0.5);
  group.add(shadow);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: custom.skinColor || '#f5cba7',
    roughness: 0.8,
    metalness: 0.1,
  });

  const hoodieMat = new THREE.MeshStandardMaterial({
    color: custom.hoodieColor || '#FFE600',
    roughness: 0.45,
    metalness: 0.2,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: '#1a1c24',
    roughness: 0.7,
    metalness: 0.1,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.3,
    metalness: 0.1,
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: '#00F0FF',
    emissive: '#00F0FF',
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0,
  });

  const headphoneMat = new THREE.MeshStandardMaterial({
    color: '#111319',
    roughness: 0.2,
    metalness: 0.8,
  });

  // Torso / Hoodie
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.32);
  const body = new THREE.Mesh(torsoGeo, hoodieMat);
  body.position.y = 0.95;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Chest emblem stripe
  const emblemGeo = new THREE.PlaneGeometry(0.25, 0.25);
  const emblemMat = new THREE.MeshBasicMaterial({
    color: '#111319',
    transparent: true,
    opacity: 0.9,
  });
  const emblem = new THREE.Mesh(emblemGeo, emblemMat);
  emblem.position.set(0, 0.05, 0.165);
  body.add(emblem);

  // Head Group
  const head = new THREE.Group();
  head.position.set(0, 1.48, 0);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Hair / Beanie
  const hairMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.18, 0.4),
    new THREE.MeshStandardMaterial({ color: custom.hairColor || '#1c1c24', roughness: 0.9 })
  );
  hairMesh.position.y = 0.14;
  head.add(hairMesh);

  // Cyber Visor / Glasses
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.1), visorMat);
  visor.position.set(0, 0.04, 0.18);
  head.add(visor);

  // Headphones
  const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 8, 16, Math.PI), headphoneMat);
  hpBand.rotation.x = Math.PI / 2;
  hpBand.position.y = 0.12;
  head.add(hpBand);

  const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), headphoneMat);
  earL.rotation.z = Math.PI / 2;
  earL.position.set(-0.21, 0.02, 0);
  head.add(earL);

  const earR = earL.clone();
  earR.position.x = 0.21;
  head.add(earR);

  group.add(head);

  // Left & Right Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.5, 0.14);
  armGeo.translate(0, -0.22, 0); // pivot at shoulder

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 1.2, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, hoodieMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 1.2, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, hoodieMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  group.add(rightArm);

  // Legs with joint pivot at hip
  const legGeo = new THREE.BoxGeometry(0.18, 0.55, 0.18);
  legGeo.translate(0, -0.27, 0);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.62, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Left shoe
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.28), shoeMat);
  shoeL.position.set(0, -0.55, 0.04);
  shoeL.castShadow = true;
  leftLeg.add(shoeL);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.62, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  // Right shoe
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.28), shoeMat);
  shoeR.position.set(0, -0.55, 0.04);
  shoeR.castShadow = true;
  rightLeg.add(shoeR);
  group.add(rightLeg);

  // Hoverboard Mount (optional activation)
  const hoverboard = new THREE.Group();
  hoverboard.position.set(0, 0.08, 0);
  const boardDeck = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 1.1),
    new THREE.MeshStandardMaterial({ color: '#161922', roughness: 0.3, metalness: 0.8 })
  );
  boardDeck.castShadow = true;
  hoverboard.add(boardDeck);

  // Neon thrusters on hoverboard
  const thrusterL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12),
    new THREE.MeshBasicMaterial({ color: custom.trailColor || '#FFE600' })
  );
  thrusterL.position.set(-0.2, -0.04, 0.35);
  hoverboard.add(thrusterL);

  const thrusterR = thrusterL.clone();
  thrusterR.position.x = 0.2;
  hoverboard.add(thrusterR);

  hoverboard.visible = custom.mount === 'hoverboard';
  group.add(hoverboard);

  let walkCycle = 0;

  const updateAnimation = (isMoving: boolean, speed: number, delta: number) => {
    if (custom.mount === 'hoverboard') {
      // Hoverboard hovering float
      walkCycle += delta * 4;
      hoverboard.position.y = 0.1 + Math.sin(walkCycle) * 0.03;
      group.position.y = hoverboard.position.y;
      leftLeg.rotation.x = -0.15;
      rightLeg.rotation.x = 0.15;
      leftArm.rotation.x = 0.2;
      rightArm.rotation.x = -0.2;
      return;
    }

    group.position.y = 0;
    if (isMoving) {
      walkCycle += delta * (speed > 6 ? 14 : 9);
      const angle = Math.sin(walkCycle) * 0.75;
      leftLeg.rotation.x = angle;
      rightLeg.rotation.x = -angle;
      leftArm.rotation.x = -angle * 0.85;
      rightArm.rotation.x = angle * 0.85;
      body.position.y = 0.95 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
      head.position.y = 1.48 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
    } else {
      // Idle breathing
      walkCycle += delta * 2;
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, delta);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, delta);
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 10, delta);
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 10, delta);
      body.position.y = 0.95 + Math.sin(walkCycle) * 0.015;
      head.position.y = 1.48 + Math.sin(walkCycle) * 0.015;
    }
  };

  const updateCustomization = (newCustom: PlayerCustomization) => {
    hoodieMat.color.set(newCustom.hoodieColor);
    hairMesh.material = new THREE.MeshStandardMaterial({ color: newCustom.hairColor, roughness: 0.9 });
    hoverboard.visible = newCustom.mount === 'hoverboard';
    thrusterL.material = new THREE.MeshBasicMaterial({ color: newCustom.trailColor });
    thrusterR.material = new THREE.MeshBasicMaterial({ color: newCustom.trailColor });
  };

  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    body,
    head,
    hoverboard,
    updateAnimation,
    updateCustomization,
  };
}

// 2. Procedural Brand Stall (Composite 10-part structure)
export function createBrandStall(stall: StallData, maxAnisotropy: number): THREE.Group {
  const stallGroup = new THREE.Group();
  stallGroup.name = `stall_${stall.id}`;
  stallGroup.position.set(...stall.position);
  stallGroup.rotation.y = stall.rotationY;

  // Contact shadow
  const shadow = createGroundShadow(4.2, 0.55);
  stallGroup.add(shadow);

  // 1. Base Platform
  const baseGeo = new THREE.BoxGeometry(6.4, 0.35, 5.2);
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#161922',
    roughness: 0.6,
    metalness: 0.3,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.175;
  base.receiveShadow = true;
  stallGroup.add(base);

  // Base glowing trim
  const trimGeo = new THREE.BoxGeometry(6.5, 0.06, 5.3);
  const trimMat = new THREE.MeshBasicMaterial({ color: stall.accentColor });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.y = 0.35;
  stallGroup.add(trim);

  // 2. Back Wall
  const backGeo = new THREE.BoxGeometry(6.0, 3.8, 0.3);
  const backMat = new THREE.MeshStandardMaterial({
    color: '#0d0f15',
    roughness: 0.7,
    metalness: 0.2,
  });
  const backWall = new THREE.Mesh(backGeo, backMat);
  backWall.position.set(0, 2.05, -2.1);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  stallGroup.add(backWall);

  // Back Wall Accent Panel
  const panelGeo = new THREE.BoxGeometry(5.4, 3.2, 0.08);
  const panelMat = new THREE.MeshStandardMaterial({
    color: stall.color,
    roughness: 0.4,
    metalness: 0.4,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 2.1, -1.92);
  stallGroup.add(panel);

  // 3. Four Metal Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: '#2a2e3d',
    roughness: 0.2,
    metalness: 0.85,
  });

  const p1 = new THREE.Mesh(pillarGeo, pillarMat);
  p1.position.set(-2.8, 2.05, 2.0);
  p1.castShadow = true;
  stallGroup.add(p1);

  const p2 = p1.clone();
  p2.position.x = 2.8;
  stallGroup.add(p2);

  const p3 = p1.clone();
  p3.position.set(-2.8, 2.05, -2.0);
  stallGroup.add(p3);

  const p4 = p1.clone();
  p4.position.set(2.8, 2.05, -2.0);
  stallGroup.add(p4);

  // 4. Canopy / Roof
  const roofGeo = new THREE.BoxGeometry(6.8, 0.4, 5.6);
  const roofMat = new THREE.MeshStandardMaterial({
    color: '#1a1d27',
    roughness: 0.5,
    metalness: 0.4,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 4.0, 0);
  roof.castShadow = true;
  stallGroup.add(roof);

  // Glowing canopy front edge
  const roofTrimGeo = new THREE.BoxGeometry(6.85, 0.08, 0.1);
  const roofTrim = new THREE.Mesh(roofTrimGeo, trimMat);
  roofTrim.position.set(0, 3.9, 2.82);
  stallGroup.add(roofTrim);

  // 5. Front Counter
  const counterGeo = new THREE.BoxGeometry(4.6, 1.1, 0.8);
  const counterTexture = createStallCounterTexture(
    stall.name,
    stall.specialOffer,
    stall.coupons[0]?.code || 'FAMFEST',
    maxAnisotropy
  );
  const counterMat = new THREE.MeshStandardMaterial({
    map: counterTexture,
    roughness: 0.3,
    metalness: 0.2,
  });
  const counter = new THREE.Mesh(counterGeo, counterMat);
  counter.position.set(0, 0.9, 1.2);
  counter.castShadow = true;
  counter.receiveShadow = true;
  stallGroup.add(counter);

  // Countertop slab
  const slabGeo = new THREE.BoxGeometry(5.0, 0.12, 1.1);
  const slabMat = new THREE.MeshStandardMaterial({
    color: '#07080b',
    roughness: 0.2,
    metalness: 0.9,
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(0, 1.5, 1.2);
  slab.castShadow = true;
  stallGroup.add(slab);

  // 6. Top Overhead Brand Sign Billboard
  const signGeo = new THREE.BoxGeometry(4.8, 1.6, 0.15);
  const signTex = createBrandSignTexture(
    stall.name,
    stall.tagline,
    stall.color,
    '#FFFFFF',
    stall.accentColor,
    maxAnisotropy
  );
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    roughness: 0.2,
    metalness: 0.3,
  });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 5.0, 1.6);
  sign.castShadow = true;
  stallGroup.add(sign);

  // 7. Interactive Floating 3D Mascot / Prop above roof
  const mascotGroup = createStallMascot(stall.decorType, stall.color, stall.accentColor);
  mascotGroup.position.set(0, 5.2, -0.2);
  mascotGroup.name = 'mascot';
  stallGroup.add(mascotGroup);

  // 8. Interactive Visit Trigger Ring on ground in front
  const ringGeo = new THREE.RingGeometry(1.6, 1.9, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: stall.accentColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.03, 2.8);
  ring.name = 'triggerRing';
  stallGroup.add(ring);

  // Inner pulsing interaction disc
  const discGeo = new THREE.CircleGeometry(1.5, 32);
  const discMat = new THREE.MeshBasicMaterial({
    color: stall.color,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(0, 0.025, 2.8);
  stallGroup.add(disc);

  return stallGroup;
}

// 3. Floating 3D Brand Mascot Models (Burger, Sneaker, Headphones, Music Disc, Pizza)
function createStallMascot(type: StallData['decorType'], color: string, accent: string): THREE.Group {
  const g = new THREE.Group();

  if (type === 'burger') {
    // 3D Procedural Burger
    const bunBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.65, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: '#D29054', roughness: 0.5 })
    );
    bunBottom.position.y = -0.2;
    g.add(bunBottom);

    const patty = new THREE.Mesh(
      new THREE.CylinderGeometry(0.74, 0.74, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: '#5A2A18', roughness: 0.7 })
    );
    patty.position.y = -0.02;
    g.add(patty);

    const cheese = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.04, 0.9),
      new THREE.MeshStandardMaterial({ color: '#FFC107', roughness: 0.3 })
    );
    cheese.rotation.y = Math.PI * 0.25;
    cheese.position.y = 0.09;
    g.add(cheese);

    const lettuce = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.76, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: '#4CAF50', roughness: 0.6 })
    );
    lettuce.position.y = 0.16;
    g.add(lettuce);

    const bunTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: '#D29054', roughness: 0.5 })
    );
    bunTop.position.y = 0.2;
    g.add(bunTop);
  } else if (type === 'sneaker') {
    // 3D Procedural Sneaker
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.15, 1.4),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2, metalness: 0.1 })
    );
    g.add(sole);

    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.45, 1.1),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 })
    );
    upper.position.set(0, 0.28, -0.1);
    g.add(upper);

    const toe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.3, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: accent, roughness: 0.3 })
    );
    toe.rotation.x = Math.PI / 2;
    toe.position.set(0, 0.2, 0.4);
    g.add(toe);

    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.08, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 })
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.52, -0.3);
    g.add(collar);
  } else if (type === 'headphones') {
    // 3D Procedural Gaming Headset
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.06, 12, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#161922', roughness: 0.2, metalness: 0.8 })
    );
    band.rotation.z = Math.PI;
    band.position.y = 0.2;
    g.add(band);

    const earcupL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
      new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 })
    );
    earcupL.rotation.z = Math.PI / 2;
    earcupL.position.set(-0.65, 0.2, 0);
    g.add(earcupL);

    const earcupR = earcupL.clone();
    earcupR.position.x = 0.65;
    g.add(earcupR);

    // RGB Glow ring
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.03, 8, 16),
      new THREE.MeshBasicMaterial({ color: accent })
    );
    glowRing.rotation.y = Math.PI / 2;
    glowRing.position.set(-0.76, 0.2, 0);
    g.add(glowRing);

    const glowRingR = glowRing.clone();
    glowRingR.position.x = 0.76;
    g.add(glowRingR);
  } else if (type === 'music') {
    // 3D Procedural Vinyl Record & Note
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.04, 32),
      new THREE.MeshStandardMaterial({ color: '#0d0d11', roughness: 0.2, metalness: 0.85 })
    );
    disc.rotation.x = Math.PI * 0.4;
    g.add(disc);

    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.045, 16),
      new THREE.MeshBasicMaterial({ color })
    );
    label.rotation.x = Math.PI * 0.4;
    g.add(label);

    const note = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.04, 8, 16),
      new THREE.MeshBasicMaterial({ color: accent })
    );
    note.position.set(0.4, 0.5, 0.2);
    g.add(note);
  } else {
    // 3D Pizza slice
    const crust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.1, 3, 1),
      new THREE.MeshStandardMaterial({ color: '#E8A752', roughness: 0.6 })
    );
    crust.rotation.x = Math.PI * 0.3;
    g.add(crust);

    const cheeseLayer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.72, 0.11, 3, 1),
      new THREE.MeshStandardMaterial({ color: '#FFD54F', roughness: 0.3 })
    );
    cheeseLayer.rotation.x = Math.PI * 0.3;
    g.add(cheeseLayer);

    const pep1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.13, 12),
      new THREE.MeshStandardMaterial({ color: '#C62828', roughness: 0.4 })
    );
    pep1.rotation.x = Math.PI * 0.3;
    pep1.position.set(0, 0.1, 0.1);
    g.add(pep1);
  }

  return g;
}

// 4. Central 3D FamBird Mascot & Monument
export function create3DFamBirdLogo(): THREE.Group {
  const birdGroup = new THREE.Group();

  // Multi-part faceted origami/cyber stylized FamBird
  // Materials
  const birdMat = new THREE.MeshPhysicalMaterial({
    color: '#FFE600',
    emissive: '#FF9900',
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.45,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const wingMat = new THREE.MeshPhysicalMaterial({
    color: '#FFEA29',
    emissive: '#FFB800',
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.35,
  });

  const beakMat = new THREE.MeshStandardMaterial({
    color: '#FF6D00',
    roughness: 0.3,
    metalness: 0.2,
  });

  const eyeVisorMat = new THREE.MeshBasicMaterial({
    color: '#00F0FF',
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.3,
    metalness: 0.1,
  });

  // Body: Geometric faceted diamond-trapezoid torso
  const bodyGeo = new THREE.CylinderGeometry(0.55, 0.85, 1.3, 5);
  const body = new THREE.Mesh(bodyGeo, birdMat);
  body.rotation.y = Math.PI * 0.1;
  body.castShadow = true;
  birdGroup.add(body);

  // White geometric chest / belly shield
  const bellyGeo = new THREE.BoxGeometry(0.65, 0.9, 0.4);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0, -0.05, 0.45);
  birdGroup.add(belly);

  // Head: Sleek faceted polygon head
  const headGeo = new THREE.DodecahedronGeometry(0.52, 0);
  const head = new THREE.Mesh(headGeo, birdMat);
  head.position.set(0, 0.9, 0.18);
  head.castShadow = true;
  birdGroup.add(head);

  // Distinctive FamBird triangular sharp beak
  const beakGeo = new THREE.ConeGeometry(0.24, 0.65, 4);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.rotation.x = Math.PI * 0.5;
  beak.position.set(0, 0.85, 0.72);
  birdGroup.add(beak);

  // Cyan Cyber Visor / Eyes
  const visorGeo = new THREE.BoxGeometry(0.72, 0.14, 0.2);
  const visor = new THREE.Mesh(visorGeo, eyeVisorMat);
  visor.position.set(0, 0.96, 0.52);
  birdGroup.add(visor);

  // Origami Crown Crest Feathers (3 angular sleek feathers)
  for (let i = -1; i <= 1; i++) {
    const crestGeo = new THREE.BoxGeometry(0.12, 0.55, 0.22);
    const crest = new THREE.Mesh(crestGeo, birdMat);
    crest.position.set(i * 0.2, 1.45, -0.05 - Math.abs(i) * 0.1);
    crest.rotation.z = -i * 0.35;
    crest.rotation.x = -0.4;
    birdGroup.add(crest);
  }

  // Iconic Angled Wings (Spread wide in gliding/banking pose)
  const leftWing = new THREE.Group();
  leftWing.name = 'leftWing';
  leftWing.position.set(-0.6, 0.2, 0);

  const wingBaseGeo = new THREE.BoxGeometry(1.4, 0.1, 0.8);
  const wingBaseL = new THREE.Mesh(wingBaseGeo, wingMat);
  wingBaseL.position.x = -0.65;
  wingBaseL.rotation.z = 0.22;
  leftWing.add(wingBaseL);

  const wingTipGeo = new THREE.ConeGeometry(0.45, 1.2, 3);
  const wingTipL = new THREE.Mesh(wingTipGeo, birdMat);
  wingTipL.position.set(-1.6, 0.2, 0);
  wingTipL.rotation.z = Math.PI * 0.55;
  leftWing.add(wingTipL);

  // Glowing Wing Edge Trim
  const wingTrimGeo = new THREE.BoxGeometry(1.9, 0.04, 0.06);
  const wingTrimL = new THREE.Mesh(wingTrimGeo, eyeVisorMat);
  wingTrimL.position.set(-1.0, 0.24, 0.38);
  wingTrimL.rotation.z = 0.22;
  leftWing.add(wingTrimL);

  birdGroup.add(leftWing);

  // Right Wing
  const rightWing = new THREE.Group();
  rightWing.name = 'rightWing';
  rightWing.position.set(0.6, 0.2, 0);

  const wingBaseR = new THREE.Mesh(wingBaseGeo, wingMat);
  wingBaseR.position.x = 0.65;
  wingBaseR.rotation.z = -0.22;
  rightWing.add(wingBaseR);

  const wingTipR = new THREE.Mesh(wingTipGeo, birdMat);
  wingTipR.position.set(1.6, 0.2, 0);
  wingTipR.rotation.z = -Math.PI * 0.55;
  rightWing.add(wingTipR);

  const wingTrimR = new THREE.Mesh(wingTrimGeo, eyeVisorMat);
  wingTrimR.position.set(1.0, 0.24, 0.38);
  wingTrimR.rotation.z = -0.22;
  rightWing.add(wingTrimR);

  birdGroup.add(rightWing);

  // Geometric Tail Fan
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, -0.4, -0.6);
  for (let t = -1; t <= 1; t++) {
    const featherGeo = new THREE.BoxGeometry(0.2, 0.08, 0.9);
    const feather = new THREE.Mesh(featherGeo, birdMat);
    feather.position.set(t * 0.22, 0, -0.3);
    feather.rotation.y = t * 0.3;
    feather.rotation.x = -0.25;
    tailGroup.add(feather);
  }
  birdGroup.add(tailGroup);

  return birdGroup;
}

export function createCentralFamMonument(): { group: THREE.Group; update: (delta: number) => void } {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // Stepped Hexagonal Podium
  const pod1 = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 5.2, 0.4, 6),
    new THREE.MeshStandardMaterial({ color: '#13151f', roughness: 0.5, metalness: 0.4 })
  );
  pod1.position.y = 0.2;
  pod1.receiveShadow = true;
  group.add(pod1);

  const pod2 = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 4.0, 0.5, 6),
    new THREE.MeshStandardMaterial({ color: '#1a1d2c', roughness: 0.4, metalness: 0.5 })
  );
  pod2.position.y = 0.65;
  pod2.receiveShadow = true;
  group.add(pod2);

  // Glowing FamApp Yellow Ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.08, 12, 32),
    new THREE.MeshBasicMaterial({ color: '#FFE600' })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.92;
  group.add(ring);

  // Central 3D FamBird Logo Mascot
  const famBird = create3DFamBirdLogo();
  famBird.position.y = 3.0;
  famBird.scale.set(1.35, 1.35, 1.35);
  group.add(famBird);

  // 2 Orbiting Energy Rings around FamBird
  const orbit1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.04, 8, 32),
    new THREE.MeshBasicMaterial({ color: '#00F0FF' })
  );
  orbit1.position.y = 3.0;
  group.add(orbit1);

  const orbit2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.04, 8, 32),
    new THREE.MeshBasicMaterial({ color: '#FFE600' })
  );
  orbit2.position.y = 3.0;
  group.add(orbit2);

  let elapsed = 0;
  const leftWing = famBird.getObjectByName('leftWing');
  const rightWing = famBird.getObjectByName('rightWing');

  const update = (delta: number) => {
    elapsed += delta;
    famBird.rotation.y += delta * 0.9;
    famBird.position.y = 3.0 + Math.sin(elapsed * 2.2) * 0.22;
    famBird.rotation.z = Math.sin(elapsed * 1.5) * 0.08;

    // Wing flapping animation
    if (leftWing && rightWing) {
      const flap = Math.sin(elapsed * 3.5) * 0.18;
      leftWing.rotation.z = flap;
      rightWing.rotation.z = -flap;
    }

    orbit1.rotation.x = elapsed * 0.8;
    orbit1.rotation.y = elapsed * 1.1;

    orbit2.rotation.x = -elapsed * 0.7;
    orbit2.rotation.z = elapsed * 0.9;
  };

  return { group, update };
}

// 5. Fam Live Stage & DJ Arena
export function createLiveStage(maxAnisotropy: number): { group: THREE.Group; update: (delta: number) => void } {
  const group = new THREE.Group();
  group.position.set(0, 0, -32);

  // Main Stage Deck
  const stageDeck = new THREE.Mesh(
    new THREE.BoxGeometry(16, 1.4, 10),
    new THREE.MeshStandardMaterial({ color: '#111319', roughness: 0.4, metalness: 0.6 })
  );
  stageDeck.position.y = 0.7;
  stageDeck.receiveShadow = true;
  stageDeck.castShadow = true;
  group.add(stageDeck);

  // Stage Front Glowing Edge
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(16.2, 0.1, 0.1),
    new THREE.MeshBasicMaterial({ color: '#FFE600' })
  );
  edge.position.set(0, 1.4, 5.05);
  group.add(edge);

  // Massive LED Screen Backdrop
  const ledGeo = new THREE.PlaneGeometry(14, 6);
  const ledTex = createDJScreenTexture(0);
  const ledMat = new THREE.MeshBasicMaterial({ map: ledTex });
  const ledScreen = new THREE.Mesh(ledGeo, ledMat);
  ledScreen.position.set(0, 4.6, -4.8);
  group.add(ledScreen);

  // Twin Giant Subwoofers on sides
  const subGeo = new THREE.BoxGeometry(2.2, 3.8, 2.0);
  const subMat = new THREE.MeshStandardMaterial({ color: '#090a0f', roughness: 0.7, metalness: 0.3 });

  const subL = new THREE.Mesh(subGeo, subMat);
  subL.position.set(-6.5, 3.3, 2.0);
  group.add(subL);

  const subR = subL.clone();
  subR.position.x = 6.5;
  group.add(subR);

  // DJ Console
  const djTable = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.1, 1.2),
    new THREE.MeshStandardMaterial({ color: '#1f2433', roughness: 0.3, metalness: 0.7 })
  );
  djTable.position.set(0, 1.95, 0.5);
  group.add(djTable);

  // Hologram DJ Character Silhouette
  const djMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 1.4, 12),
    new THREE.MeshBasicMaterial({ color: '#00F0FF', wireframe: true })
  );
  djMesh.position.set(0, 3.2, -0.6);
  group.add(djMesh);

  let time = 0;
  const update = (delta: number) => {
    time += delta;
    // Animate stage screen every few frames
    if (Math.random() < 0.3) {
      const newTex = createDJScreenTexture(time);
      ledMat.map = newTex;
      ledMat.needsUpdate = true;
    }
  };

  return { group, update };
}

// 6. Collectible 3D FamCoin
export function createCoinMesh(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.48, 0.48, 0.09, 24);
  const coinTex = createCoinFaceTexture();
  const sideMat = new THREE.MeshStandardMaterial({
    color: '#FBC02D',
    roughness: 0.25,
    metalness: 0.9,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: coinTex,
    roughness: 0.2,
    metalness: 0.85,
  });
  const mesh = new THREE.Mesh(geo, [sideMat, faceMat, faceMat]);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  return mesh;
}

// 7. Mystery Loot Box Mesh
export function createMysteryBoxMesh(): THREE.Group {
  const g = new THREE.Group();

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.85, 0.85),
    new THREE.MeshStandardMaterial({
      color: '#673AB7',
      roughness: 0.3,
      metalness: 0.6,
    })
  );
  box.castShadow = true;
  g.add(box);

  // Golden Ribbon
  const rib1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 0.88, 0.18),
    new THREE.MeshStandardMaterial({ color: '#FFE600', roughness: 0.2, metalness: 0.8 })
  );
  g.add(rib1);

  const rib2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.88, 0.88),
    new THREE.MeshStandardMaterial({ color: '#FFE600', roughness: 0.2, metalness: 0.8 })
  );
  g.add(rib2);

  return g;
}

// 8. Campus Low-Poly Tree (3 tiers of foliage + trunk)
export function createCampusTree(): THREE.Group {
  const tree = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.38, 2.0, 7);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a3325', roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.0;
  trunk.castShadow = true;
  tree.add(trunk);

  // 3 Foliage Tiers with cyan/lime festival cyber tint
  const leafMat1 = new THREE.MeshStandardMaterial({ color: '#1B5E20', roughness: 0.6 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.6 });
  const leafMat3 = new THREE.MeshStandardMaterial({ color: '#388E3C', roughness: 0.6 });

  const c1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.2, 7), leafMat1);
  c1.position.y = 2.4;
  c1.castShadow = true;
  tree.add(c1);

  const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.9, 7), leafMat2);
  c2.position.y = 3.6;
  c2.castShadow = true;
  tree.add(c2);

  const c3 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 7), leafMat3);
  c3.position.y = 4.7;
  c3.castShadow = true;
  tree.add(c3);

  // Ground shadow
  const shadow = createGroundShadow(1.8, 0.35);
  tree.add(shadow);

  return tree;
}

// 9. Cyber Festival Entrance Arch
export function createEntranceArch(maxAnisotropy: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(0, 0, 36);

  // Left & right pillars
  const pillarGeo = new THREE.BoxGeometry(1.2, 6.0, 1.2);
  const pillarMat = new THREE.MeshStandardMaterial({ color: '#151821', roughness: 0.4, metalness: 0.7 });

  const pL = new THREE.Mesh(pillarGeo, pillarMat);
  pL.position.set(-6, 3, 0);
  pL.castShadow = true;
  g.add(pL);

  const pR = pL.clone();
  pR.position.x = 6;
  g.add(pR);

  // Top Span
  const spanGeo = new THREE.BoxGeometry(13.2, 1.2, 1.4);
  const span = new THREE.Mesh(spanGeo, pillarMat);
  span.position.set(0, 5.8, 0);
  span.castShadow = true;
  g.add(span);

  // Sign Banner
  const bannerGeo = new THREE.BoxGeometry(10.5, 1.6, 0.2);
  const bannerTex = createFestivalBannerTexture(maxAnisotropy);
  const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.2, metalness: 0.3 });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 5.8, 0.72);
  g.add(banner);

  return g;
}

// 10. Dedicated Flex Wall inside Fam World & Exclusive VIP Gates
export function createFlexWallAndGate(initialFlex: boolean): {
  group: THREE.Group;
  update: (delta: number) => void;
  setUnlocked: (unlocked: boolean) => void;
  zomatoGatePos: THREE.Vector3;
  cinepolisGatePos: THREE.Vector3;
  wallZ: number;
} {
  const group = new THREE.Group();
  const wallZ = -14;
  group.position.set(0, 0, wallZ);

  // High-tech dark obsidian & gold trimmed barrier posts
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#0d101a',
    roughness: 0.3,
    metalness: 0.8,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: '#FFB800',
    roughness: 0.2,
    metalness: 0.9,
    emissive: '#FF9100',
    emissiveIntensity: 0.2,
  });

  const neonGoldMat = new THREE.MeshBasicMaterial({
    color: '#FFE600',
  });

  const laserLockedMat = new THREE.MeshBasicMaterial({
    color: '#FF1744',
    transparent: true,
    opacity: 0.85,
  });

  const laserUnlockedMat = new THREE.MeshBasicMaterial({
    color: '#00E676',
    transparent: true,
    opacity: 0.4,
  });

  // Solid perimeter wall segments (leaving 2 wide arched portals at x = -16 and x = 16)
  // Center segment between portals: from x = -11 to x = 11 (width 22)
  const centerWall = new THREE.Mesh(new THREE.BoxGeometry(22, 4.2, 0.8), wallMat);
  centerWall.position.set(0, 2.1, 0);
  centerWall.castShadow = true;
  group.add(centerWall);

  // Center Wall Top Trim with Gold Cyber Decal
  const centerTrim = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.3, 1.0), goldTrimMat);
  centerTrim.position.set(0, 4.25, 0);
  group.add(centerTrim);

  // Holographic VIP Marquee Banner on Center Wall
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 1024;
  bannerCanvas.height = 256;
  const bCtx = bannerCanvas.getContext('2d')!;
  bCtx.fillStyle = '#080a12';
  bCtx.fillRect(0, 0, 1024, 256);
  bCtx.strokeStyle = '#FFE600';
  bCtx.lineWidth = 10;
  bCtx.strokeRect(10, 10, 1004, 236);

  bCtx.fillStyle = '#FFE600';
  bCtx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('★ FAM FLEX VIP ZONE ★', 512, 100);

  bCtx.fillStyle = '#FFFFFF';
  bCtx.font = 'bold 30px "JetBrains Mono", monospace';
  bCtx.fillText('EXCLUSIVE ACCESS: ZOMATO GOLD & CINÉPOLIS', 512, 160);

  bCtx.fillStyle = '#FFB800';
  bCtx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  bCtx.fillText('UPGRADE IN FAMAPP TO UNLOCK', 512, 210);

  const bannerTex = new THREE.CanvasTexture(bannerCanvas);
  bannerTex.colorSpace = THREE.SRGBColorSpace;
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(16, 2.8, 0.2),
    new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.2 })
  );
  signMesh.position.set(0, 2.2, 0.52);
  group.add(signMesh);

  // Left Outer Wall: x = -21 to -48
  const leftOuterWall = new THREE.Mesh(new THREE.BoxGeometry(28, 4.2, 0.8), wallMat);
  leftOuterWall.position.set(-35, 2.1, 0);
  leftOuterWall.castShadow = true;
  group.add(leftOuterWall);

  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(28.2, 0.3, 1.0), goldTrimMat);
  leftTrim.position.set(-35, 4.25, 0);
  group.add(leftTrim);

  // Right Outer Wall: x = 21 to 48
  const rightOuterWall = new THREE.Mesh(new THREE.BoxGeometry(28, 4.2, 0.8), wallMat);
  rightOuterWall.position.set(35, 2.1, 0);
  rightOuterWall.castShadow = true;
  group.add(rightOuterWall);

  const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(28.2, 0.3, 1.0), goldTrimMat);
  rightTrim.position.set(35, 4.25, 0);
  group.add(rightTrim);

  // Gate 1: Zomato Gold Portal (x = -16)
  const zomatoGate = new THREE.Group();
  zomatoGate.position.set(-16, 0, 0);

  const pL1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.4, 1.2), wallMat);
  pL1.position.set(-3.2, 2.7, 0);
  zomatoGate.add(pL1);

  const pR1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.4, 1.2), wallMat);
  pR1.position.set(3.2, 2.7, 0);
  zomatoGate.add(pR1);

  const arch1 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.2, 1.4), goldTrimMat);
  arch1.position.set(0, 5.2, 0);
  zomatoGate.add(arch1);

  // Zomato Signboard
  const zCanvas = document.createElement('canvas');
  zCanvas.width = 512;
  zCanvas.height = 128;
  const zCtx = zCanvas.getContext('2d')!;
  zCtx.fillStyle = '#E23744';
  zCtx.fillRect(0, 0, 512, 128);
  zCtx.fillStyle = '#FFFFFF';
  zCtx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  zCtx.textAlign = 'center';
  zCtx.fillText('ZOMATO GOLD VIP', 256, 75);
  const zTex = new THREE.CanvasTexture(zCanvas);
  zTex.colorSpace = THREE.SRGBColorSpace;
  const zSign = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 1.1, 0.2),
    new THREE.MeshStandardMaterial({ map: zTex })
  );
  zSign.position.set(0, 5.2, 0.72);
  zomatoGate.add(zSign);

  // Laser Grid barrier for Zomato
  const laserBars1: THREE.Mesh[] = [];
  for (let b = -2; b <= 2; b++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 8), laserLockedMat);
    bar.position.set(b * 1.1, 2.1, 0);
    zomatoGate.add(bar);
    laserBars1.push(bar);
  }

  // Floating Lock / Crown Indicator
  const lockCrown1 = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), goldTrimMat);
  lockCrown1.position.set(0, 2.6, 0);
  zomatoGate.add(lockCrown1);

  group.add(zomatoGate);

  // Gate 2: Cinépolis VIP Portal (x = 16)
  const cinepolisGate = new THREE.Group();
  cinepolisGate.position.set(16, 0, 0);

  const pL2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.4, 1.2), wallMat);
  pL2.position.set(-3.2, 2.7, 0);
  cinepolisGate.add(pL2);

  const pR2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.4, 1.2), wallMat);
  pR2.position.set(3.2, 2.7, 0);
  cinepolisGate.add(pR2);

  const arch2 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.2, 1.4), goldTrimMat);
  arch2.position.set(0, 5.2, 0);
  cinepolisGate.add(arch2);

  // Cinépolis Signboard
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 512;
  cCanvas.height = 128;
  const cCtx = cCanvas.getContext('2d')!;
  cCtx.fillStyle = '#0B2341';
  cCtx.fillRect(0, 0, 512, 128);
  cCtx.strokeStyle = '#FFE600';
  cCtx.lineWidth = 8;
  cCtx.strokeRect(8, 8, 496, 112);
  cCtx.fillStyle = '#FFE600';
  cCtx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  cCtx.textAlign = 'center';
  cCtx.fillText('CINÉPOLIS VIP CLUB', 256, 75);
  const cTex = new THREE.CanvasTexture(cCanvas);
  cTex.colorSpace = THREE.SRGBColorSpace;
  const cSign = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 1.1, 0.2),
    new THREE.MeshStandardMaterial({ map: cTex })
  );
  cSign.position.set(0, 5.2, 0.72);
  cinepolisGate.add(cSign);

  // Laser Grid barrier for Cinépolis
  const laserBars2: THREE.Mesh[] = [];
  for (let b = -2; b <= 2; b++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 8), laserLockedMat);
    bar.position.set(b * 1.1, 2.1, 0);
    cinepolisGate.add(bar);
    laserBars2.push(bar);
  }

  const lockCrown2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), goldTrimMat);
  lockCrown2.position.set(0, 2.6, 0);
  cinepolisGate.add(lockCrown2);

  group.add(cinepolisGate);

  let isUnlocked = initialFlex;
  const setUnlocked = (unlocked: boolean) => {
    isUnlocked = unlocked;
    const currentMat = unlocked ? laserUnlockedMat : laserLockedMat;
    laserBars1.forEach((b) => (b.material = currentMat));
    laserBars2.forEach((b) => (b.material = currentMat));
    lockCrown1.visible = !unlocked;
    lockCrown2.visible = !unlocked;
  };
  setUnlocked(initialFlex);

  let elapsed = 0;
  const update = (delta: number) => {
    elapsed += delta;
    if (!isUnlocked) {
      lockCrown1.rotation.y += delta * 2;
      lockCrown2.rotation.y -= delta * 2;
      const pulse = 0.5 + Math.sin(elapsed * 6) * 0.35;
      laserLockedMat.opacity = pulse;
    }
  };

  return {
    group,
    update,
    setUnlocked,
    zomatoGatePos: new THREE.Vector3(-16, 0, wallZ),
    cinepolisGatePos: new THREE.Vector3(16, 0, wallZ),
    wallZ,
  };
}

// 11. Exclusive Experience 1: Zomato Gold Lounge
export function createZomatoGoldLounge(): {
  group: THREE.Group;
  update: (delta: number) => void;
  triggerPos: THREE.Vector3;
} {
  const group = new THREE.Group();
  group.position.set(-20, 0, -28);

  // Stepped Circular Luxury Lounge Deck
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 8.0, 0.6, 32),
    new THREE.MeshStandardMaterial({ color: '#1a1012', roughness: 0.3, metalness: 0.5 })
  );
  deck.position.y = 0.3;
  deck.receiveShadow = true;
  group.add(deck);

  // Red & Gold Carpet Circle
  const carpet = new THREE.Mesh(
    new THREE.CylinderGeometry(6.6, 6.6, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: '#88121D', roughness: 0.6 })
  );
  carpet.position.y = 0.62;
  group.add(carpet);

  // 4 Golden Curved Columns
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const px = Math.cos(angle) * 5.8;
    const pz = Math.sin(angle) * 5.8;
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 4.5, 16),
      new THREE.MeshStandardMaterial({ color: '#FFB800', roughness: 0.2, metalness: 0.85 })
    );
    col.position.set(px, 2.5, pz);
    col.castShadow = true;
    group.add(col);
  }

  // Floating Crown / Canopy
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(6.4, 5.8, 0.6, 32),
    new THREE.MeshStandardMaterial({ color: '#E23744', roughness: 0.3, metalness: 0.4 })
  );
  canopy.position.y = 4.8;
  canopy.castShadow = true;
  group.add(canopy);

  // 3D Giant Golden Cloche & Fork Mascot atop Pavilion
  const mascotGroup = new THREE.Group();
  mascotGroup.position.set(0, 5.8, 0);

  const cloche = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: '#FFE600', roughness: 0.15, metalness: 0.9 })
  );
  mascotGroup.add(cloche);

  const clocheHandle = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({ color: '#FFE600', roughness: 0.1, metalness: 0.9 })
  );
  clocheHandle.position.y = 1.3;
  mascotGroup.add(clocheHandle);

  group.add(mascotGroup);

  // VIP Lounge Couches inside
  for (let c = 0; c < 3; c++) {
    const cAngle = (c * Math.PI * 2) / 3 + 0.3;
    const cx = Math.cos(cAngle) * 3.4;
    const cz = Math.sin(cAngle) * 3.4;
    const couch = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.7, 0.9),
      new THREE.MeshStandardMaterial({ color: '#B71C1C', roughness: 0.5 })
    );
    couch.position.set(cx, 0.95, cz);
    couch.rotation.y = -cAngle + Math.PI / 2;
    group.add(couch);
  }

  // Center Cocktail Table with Ambient Candle Light
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: '#FFB800', roughness: 0.2, metalness: 0.8 })
  );
  table.position.set(0, 1.0, 0);
  group.add(table);

  const loungeLight = new THREE.PointLight(0xff6b6b, 2.5, 14);
  loungeLight.position.set(0, 2.5, 0);
  group.add(loungeLight);

  const update = (delta: number) => {
    mascotGroup.rotation.y += delta * 0.8;
  };

  return {
    group,
    update,
    triggerPos: new THREE.Vector3(-20, 0, -24),
  };
}

// 12. Exclusive Experience 2: Cinépolis VIP Cinema
export function createCinepolisVIPZone(): {
  group: THREE.Group;
  update: (delta: number) => void;
  triggerPos: THREE.Vector3;
} {
  const group = new THREE.Group();
  group.position.set(20, 0, -28);

  // Stepped VIP Cinema Deck
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 8.0, 0.6, 32),
    new THREE.MeshStandardMaterial({ color: '#091526', roughness: 0.3, metalness: 0.6 })
  );
  deck.position.y = 0.3;
  deck.receiveShadow = true;
  group.add(deck);

  // Carpet with golden VIP stars
  const carpet = new THREE.Mesh(
    new THREE.CylinderGeometry(6.6, 6.6, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: '#0D274A', roughness: 0.5 })
  );
  carpet.position.y = 0.62;
  group.add(carpet);

  // Curved IMAX Cinema Marquee Screen Backdrop
  const screenGeo = new THREE.CylinderGeometry(6.0, 6.0, 3.4, 24, 1, true, Math.PI * 0.6, Math.PI * 0.8);
  const screenMat = new THREE.MeshBasicMaterial({ color: '#0066FF', side: THREE.DoubleSide });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 2.4, 0);
  group.add(screen);

  // 4 Recliner Cinema Seats
  for (let s = -2; s <= 2; s++) {
    if (s === 0) continue;
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: '#1A2332', roughness: 0.4 })
    );
    seat.position.set(s * 1.5, 1.1, 1.5);
    group.add(seat);
  }

  // Giant 3D Popcorn Bucket & Film Reel atop Pavilion
  const cinemaMascot = new THREE.Group();
  cinemaMascot.position.set(0, 5.0, 0);

  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 0.85, 1.6, 16),
    new THREE.MeshStandardMaterial({ color: '#D50000', roughness: 0.3 })
  );
  cinemaMascot.add(bucket);

  const popcorn = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.0, 1),
    new THREE.MeshStandardMaterial({ color: '#FFF59D', roughness: 0.8 })
  );
  popcorn.position.y = 0.8;
  cinemaMascot.add(popcorn);

  // Film Reel ring
  const filmReel = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.12, 12, 32),
    new THREE.MeshStandardMaterial({ color: '#FFB800', roughness: 0.2, metalness: 0.9 })
  );
  filmReel.rotation.x = Math.PI / 2;
  filmReel.position.y = 0.2;
  cinemaMascot.add(filmReel);

  group.add(cinemaMascot);

  // Cinema Point Light (Electric Cyan)
  const cineLight = new THREE.PointLight(0x00b4d8, 2.5, 14);
  cineLight.position.set(0, 2.8, 0);
  group.add(cineLight);

  const update = (delta: number) => {
    cinemaMascot.rotation.y += delta * 0.9;
  };

  return {
    group,
    update,
    triggerPos: new THREE.Vector3(20, 0, -24),
  };
}

// 13. Interactive Photo Booth inside Fam World (Polaroid Studio)
export function createInteractivePhotoBooth(): {
  group: THREE.Group;
  update: (delta: number) => void;
  triggerPos: THREE.Vector3;
} {
  const group = new THREE.Group();
  group.position.set(-22, 0, 12);

  // Booth Pavilion / Shack
  const boothMat = new THREE.MeshStandardMaterial({
    color: '#161924',
    roughness: 0.3,
    metalness: 0.7,
  });

  const neonPinkMat = new THREE.MeshBasicMaterial({ color: '#FF2E93' });
  const neonYellowMat = new THREE.MeshBasicMaterial({ color: '#FFE600' });

  // Main Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.4, 4.2), boothMat);
  cabin.position.y = 2.2;
  cabin.castShadow = true;
  group.add(cabin);

  // Front Entrance Cutout
  const interior = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 3.4, 3.8),
    new THREE.MeshStandardMaterial({ color: '#2A1838', roughness: 0.6 })
  );
  interior.position.set(0, 1.9, 0.3);
  group.add(interior);

  // Photo Backdrop screen inside booth
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.0),
    new THREE.MeshBasicMaterial({ color: '#FF2E93' })
  );
  backdrop.position.set(0, 2.0, -1.5);
  group.add(backdrop);

  // Studio Flash Ring / Marquee Light Bulbs
  const flashRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.08, 12, 24),
    new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
  );
  flashRing.position.set(0, 2.6, 1.85);
  group.add(flashRing);

  // Camera Lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: '#050508', roughness: 0.1, metalness: 0.9 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 2.6, 1.95);
  group.add(lens);

  // Blinking Red LED Tally Light
  const tallyLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#FF0055' })
  );
  tallyLed.position.set(0.4, 3.1, 1.95);
  group.add(tallyLed);

  // Top Neon Marquee Sign: "📸 POLAROID PHOTO BOOTH"
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const sCtx = signCanvas.getContext('2d')!;
  sCtx.fillStyle = '#0f0f18';
  sCtx.fillRect(0, 0, 512, 128);
  sCtx.strokeStyle = '#FF2E93';
  sCtx.lineWidth = 6;
  sCtx.strokeRect(6, 6, 500, 116);

  sCtx.fillStyle = '#FFE600';
  sCtx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  sCtx.textAlign = 'center';
  sCtx.fillText('📸 PHOTO BOOTH', 256, 55);

  sCtx.fillStyle = '#FF2E93';
  sCtx.font = 'bold 24px "JetBrains Mono", monospace';
  sCtx.fillText('SNAP MEMORIES W/ FRIENDS', 256, 95);

  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const marqueeSign = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ map: signTex })
  );
  marqueeSign.position.set(0, 4.6, 1.8);
  group.add(marqueeSign);

  // Polaroid Photo Dispenser Tray at Front with Sample Polaroid sticking out
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.15, 0.8),
    new THREE.MeshStandardMaterial({ color: '#FFB800', roughness: 0.3 })
  );
  tray.position.set(0, 1.1, 2.2);
  group.add(tray);

  const samplePhoto = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.9),
    new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.1 })
  );
  samplePhoto.rotation.x = -Math.PI * 0.4;
  samplePhoto.position.set(0, 1.25, 2.3);
  group.add(samplePhoto);

  // Flashing Studio Light
  const studioLight = new THREE.PointLight(0xff2e93, 2.5, 12);
  studioLight.position.set(0, 2.6, 1.5);
  group.add(studioLight);

  let elapsed = 0;
  const update = (delta: number) => {
    elapsed += delta;
    tallyLed.visible = Math.floor(elapsed * 2.5) % 2 === 0;
    studioLight.intensity = 2.0 + Math.sin(elapsed * 4) * 0.8;
  };

  return {
    group,
    update,
    triggerPos: new THREE.Vector3(-22, 0, 15),
  };
}
