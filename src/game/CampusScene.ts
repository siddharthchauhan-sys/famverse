/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterController,
  createPlayerCharacter,
  createBrandStall,
  createCentralFamMonument,
  createLiveStage,
  createCoinMesh,
  createMysteryBoxMesh,
  createCampusTree,
  createEntranceArch,
  createFlexWallAndGate,
  createZomatoGoldLounge,
  createCinepolisVIPZone,
  createInteractivePhotoBooth,
} from './proceduralModels';
import { createPlazaPavementTexture } from '../services/textures';
import { STALLS } from './stallData';
import { CoinCollectible, PlayerCustomization, StallData, RemotePlayer, Sabotage } from '../types';
import { soundEngine } from '../services/audio';

// Pre-allocated math vectors to eliminate garbage collection inside the loop
const _vec3 = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _playerTargetPos = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _camLook = new THREE.Vector3();
const _mouseVec2 = new THREE.Vector2();

function createNameTagSprite(name: string, persona: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(15, 17, 24, 0.9)';
  ctx.strokeStyle = '#FFE600';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 96, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 256, 56);

  ctx.fillStyle = '#FFE600';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText(persona.toUpperCase(), 256, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.4, 0.6, 1);
  sprite.position.y = 2.4;
  return sprite;
}

export interface CampusSceneCallbacks {
  onNearStall: (stall: StallData | null) => void;
  onCoinCollected: (coin: CoinCollectible, totalCoins: number) => void;
  onPlayerPosition: (x: number, z: number, rotationY: number, isMoving: boolean, speed: number) => void;
  onNearEmergencyBuzzer?: (isNear: boolean) => void;
  onNearFlexGate?: (gate: 'zomato_gold' | 'cinepolis' | 'barrier' | null) => void;
  onNearPhotoBooth?: (isNear: boolean) => void;
  onTapliNudge?: (friendName: string) => void;
}

export class CampusScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;
  private callbacks: CampusSceneCallbacks;

  // Actors & World
  private player: CharacterController;
  private playerPos = new THREE.Vector3(0, 0, 18); // start near entrance arch
  private playerRotation = Math.PI;
  private targetRotation = Math.PI;
  private playerSpeed = 0;
  private isMoving = false;
  private wasMoving = false;
  private isNightMode = true;

  // Multiplayer Remote Players
  private remotePlayers = new Map<
    string,
    {
      controller: CharacterController;
      targetPos: THREE.Vector3;
      targetRotY: number;
      isMoving: boolean;
      speed: number;
      sprite: THREE.Sprite;
      name: string;
      lastTapliTime?: number;
    }
  >();

  // Stalls & Sabotages
  private stallMeshes: { stall: StallData; group: THREE.Group; triggerPos: THREE.Vector3 }[] = [];
  private activeNearStall: StallData | null = null;
  private sabotageBeacons = new Map<string, THREE.Group>();

  // Emergency Audit Buzzer
  private emergencyBuzzerPos = new THREE.Vector3(0, 0, 2.6);
  private isNearBuzzer = false;

  // Flex Wall & Exclusive Zones
  private isFlexMember: boolean = false;
  private flexWallObj: ReturnType<typeof createFlexWallAndGate> | null = null;
  private zomatoLoungeObj: ReturnType<typeof createZomatoGoldLounge> | null = null;
  private cinepolisObj: ReturnType<typeof createCinepolisVIPZone> | null = null;
  private activeFlexGate: 'zomato_gold' | 'cinepolis' | 'barrier' | null = null;
  private lastFlexGateAlertTime = 0;

  // Interactive Photo Booth
  private photoBoothObj: ReturnType<typeof createInteractivePhotoBooth> | null = null;
  private isNearPhotoBooth: boolean = false;

  // Tapli Nudge State
  private lastGlobalTapliTime = 0;

  // Collectibles
  private coins: { data: CoinCollectible; mesh: THREE.Object3D }[] = [];
  private collectedCoinCount = 0;

  // Animated Scene Components
  private monumentUpdate: (delta: number) => void;
  private stageUpdate: (delta: number) => void;
  private animatedProps: { mesh: THREE.Object3D; rotSpeed: number; bobOffset: number }[] = [];

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private stageLight: THREE.PointLight;
  private monumentLight: THREE.PointLight;

  // Input State (Dual Virtual Joysticks)
  private keys: Record<string, boolean> = {};
  private joystickVector = { x: 0, y: 0 };
  private aimJoystickVector = { x: 0, y: 0 };
  private mouseDragging = false;
  private mousePrevX = 0;
  private camAngle = 0;
  private camDistance = 8.5;
  private camHeight = 4.2;

  // Click-to-move target
  private clickNavTarget: THREE.Vector3 | null = null;
  private raycaster = new THREE.Raycaster();
  private groundPlane: THREE.Mesh;

  constructor(
    container: HTMLDivElement,
    customization: PlayerCustomization,
    isFlexMember: boolean,
    callbacks: CampusSceneCallbacks
  ) {
    this.container = container;
    this.isFlexMember = isFlexMember;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL from GPU renderer string
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c13);
    this.scene.fog = new THREE.FogExp2(0x0a0c13, 0.015);

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.2, 200);

    // 4. Room Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0x384166, 0x11131a, 0.9);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfff4d6, 1.4);
    this.dirLight.position.set(25, 45, 20);
    if (!this.isSoftwareGl) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 2048;
      this.dirLight.shadow.mapSize.height = 2048;
      this.dirLight.shadow.camera.near = 1;
      this.dirLight.shadow.camera.far = 120;
      const d = 42;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // Central Monument Point Light
    this.monumentLight = new THREE.PointLight(0xffe600, 2.5, 22);
    this.monumentLight.position.set(0, 3.2, 0);
    this.scene.add(this.monumentLight);

    // Stage Point Light
    this.stageLight = new THREE.PointLight(0x00f0ff, 3.0, 35);
    this.stageLight.position.set(0, 5, -30);
    this.scene.add(this.stageLight);

    // 6. Build Campus Ground & Environment
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const pavementTex = createPlazaPavementTexture(maxAnisotropy);
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      map: pavementTex,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);

    // Outer Grass / Perimeter terrain zone
    const outerGroundGeo = new THREE.RingGeometry(80, 160, 32);
    const outerGroundMat = new THREE.MeshStandardMaterial({
      color: '#08110b',
      roughness: 0.9,
    });
    const outerGround = new THREE.Mesh(outerGroundGeo, outerGroundMat);
    outerGround.rotation.x = -Math.PI / 2;
    outerGround.position.y = -0.05;
    this.scene.add(outerGround);

    // Perimeter trees for natural boundary
    this.createPerimeterFoliage();

    // 7. Add Monuments, Stage & Entrance
    const monument = createCentralFamMonument();
    this.monumentUpdate = monument.update;
    this.scene.add(monument.group);

    // Emergency Audit Buzzer Podium (Central FamApp Tribunal)
    const buzzerPodium = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.65, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: '#161922', roughness: 0.3, metalness: 0.8 })
    );
    buzzerPodium.position.set(0, 0.45, 2.6);
    buzzerPodium.castShadow = true;
    this.scene.add(buzzerPodium);

    const buzzerBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.16, 16),
      new THREE.MeshStandardMaterial({
        color: '#FF1744',
        emissive: '#D50000',
        emissiveIntensity: 0.9,
        roughness: 0.2,
      })
    );
    buzzerBtn.position.set(0, 0.95, 2.6);
    this.scene.add(buzzerBtn);

    const stage = createLiveStage(maxAnisotropy);
    this.stageUpdate = stage.update;
    this.scene.add(stage.group);

    const entrance = createEntranceArch(maxAnisotropy);
    this.scene.add(entrance);

    // 8. Add Brand Stalls
    STALLS.forEach((stall) => {
      const stallGroup = createBrandStall(stall, maxAnisotropy);
      this.scene.add(stallGroup);

      // Trigger location is 2.8 units forward from the stall origin along its rotation
      const rot = stall.rotationY;
      const trigX = stall.position[0] + Math.sin(rot) * 2.8;
      const trigZ = stall.position[2] + Math.cos(rot) * 2.8;

      this.stallMeshes.push({
        stall,
        group: stallGroup,
        triggerPos: new THREE.Vector3(trigX, 0, trigZ),
      });

      // Find mascot mesh inside stall to add to animatedProps
      const mascot = stallGroup.getObjectByName('mascot');
      if (mascot) {
        this.animatedProps.push({
          mesh: mascot,
          rotSpeed: 0.8,
          bobOffset: Math.random() * Math.PI,
        });
      }
    });

    // 9. Scatter Collectible FamCoins & Mystery Boxes
    this.generateCollectibles();

    // 10. Add Dedicated Flex Wall & Exclusive VIP Portals
    this.flexWallObj = createFlexWallAndGate(this.isFlexMember);
    this.scene.add(this.flexWallObj.group);

    // 11. Add Exclusive Zones (Zomato Gold Lounge & Cinépolis VIP)
    this.zomatoLoungeObj = createZomatoGoldLounge();
    this.scene.add(this.zomatoLoungeObj.group);

    this.cinepolisObj = createCinepolisVIPZone();
    this.scene.add(this.cinepolisObj.group);

    // 12. Add Interactive Photo Booth (Polaroid Studio)
    this.photoBoothObj = createInteractivePhotoBooth();
    this.scene.add(this.photoBoothObj.group);

    // 13. Player Avatar (scaled for optimal mobile screen presence)
    this.player = createPlayerCharacter(customization);
    this.player.group.scale.set(0.85, 0.85, 0.85);
    this.player.group.position.copy(this.playerPos);
    this.scene.add(this.player.group);

    // 14. Event Listeners
    this.setupInputs();

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Start loop
    this.tick = this.tick.bind(this);
    this.startLoop();
  }

  private createPerimeterFoliage() {
    const numTrees = 36;
    for (let i = 0; i < numTrees; i++) {
      const angle = (i / numTrees) * Math.PI * 2;
      const radius = 55 + Math.sin(i * 3) * 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Don't block front entrance arch (around z = 36, x = 0)
      if (z > 28 && Math.abs(x) < 14) continue;

      const tree = createCampusTree();
      tree.position.set(x, 0, z);
      const scale = 0.8 + Math.random() * 0.4;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
    }
  }

  private generateCollectibles() {
    // 20 FamCoins distributed across plaza paths + 4 mystery loot boxes
    const coinPositions: [number, number, number][] = [
      [0, 0.9, 12],
      [0, 0.9, 6],
      [0, 0.9, -6],
      [0, 0.9, -12],
      [0, 0.9, -20],
      [-10, 0.9, 8],
      [-12, 0.9, -6],
      [-18, 0.9, -8],
      [-14, 0.9, 16],
      [10, 0.9, 8],
      [12, 0.9, -6],
      [18, 0.9, -8],
      [14, 0.9, 16],
      [-8, 0.9, -24],
      [8, 0.9, -24],
      [-24, 0.9, 2],
      [24, 0.9, 2],
      [-6, 0.9, 24],
      [6, 0.9, 24],
      [0, 0.9, 28],
    ];

    coinPositions.forEach((pos, idx) => {
      const mesh = createCoinMesh();
      mesh.position.set(pos[0], pos[1], pos[2]);
      this.scene.add(mesh);

      this.coins.push({
        data: {
          id: `coin-${idx}`,
          position: pos,
          value: 50,
          collected: false,
        },
        mesh,
      });

      this.animatedProps.push({
        mesh,
        rotSpeed: 2.2,
        bobOffset: idx * 0.5,
      });
    });

    // 4 Mystery Loot Boxes at special spots
    const boxPositions: [number, number, number][] = [
      [-18, 0.6, -26],
      [18, 0.6, -26],
      [-32, 0.6, 18],
      [32, 0.6, 18],
    ];

    boxPositions.forEach((pos, idx) => {
      const mesh = createMysteryBoxMesh();
      mesh.position.set(pos[0], pos[1], pos[2]);
      this.scene.add(mesh);

      this.coins.push({
        data: {
          id: `box-${idx}`,
          position: pos,
          value: 200,
          collected: false,
          isMysteryBox: true,
        },
        mesh,
      });

      this.animatedProps.push({
        mesh,
        rotSpeed: 1.4,
        bobOffset: idx * 1.2,
      });
    });
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e' && this.activeNearStall) {
        soundEngine.playStallInteract();
        this.callbacks.onNearStall(this.activeNearStall);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mouse drag to orbit camera around player
    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      this.mouseDragging = true;
      this.mousePrevX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mouseDragging) {
        const deltaX = e.clientX - this.mousePrevX;
        this.camAngle -= deltaX * 0.007;
        this.mousePrevX = e.clientX;
      }
    });

    // Click/tap on ground to navigate (Click-to-Move)
    dom.addEventListener('click', (e) => {
      // Don't treat a drag as click
      const rect = dom.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _mouseVec2.set(x, y);
      this.raycaster.setFromCamera(_mouseVec2, this.camera);
      const intersects = this.raycaster.intersectObject(this.groundPlane);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        this.clickNavTarget = new THREE.Vector3(pt.x, 0, pt.z);
      }
    });

    // Window resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  public setJoystickInput(x: number, y: number) {
    this.joystickVector.x = x;
    this.joystickVector.y = y;
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      this.clickNavTarget = null; // joystick overrides click-to-move
    }
  }

  public setAimJoystickInput(x: number, y: number) {
    this.aimJoystickVector.x = x;
    this.aimJoystickVector.y = y;
  }

  public setFlexMembership(isFlex: boolean) {
    this.isFlexMember = isFlex;
    this.flexWallObj?.setUnlocked(isFlex);
    if (isFlex) {
      soundEngine.playGateUnlock();
    }
  }

  public captureSnapshot(): string {
    try {
      this.renderer.render(this.scene, this.camera);
      return this.renderer.domElement.toDataURL('image/jpeg', 0.88);
    } catch {
      return '';
    }
  }

  public teleportToStall(stallId: string) {
    const stall = this.stallMeshes.find((s) => s.stall.id === stallId);
    if (stall) {
      this.playerPos.set(stall.triggerPos.x, 0, stall.triggerPos.z);
      this.clickNavTarget = null;
      soundEngine.playStallInteract();
    }
  }

  public updatePlayerCustomization(custom: PlayerCustomization) {
    this.player.updateCustomization(custom);
  }

  public toggleNightMode(): boolean {
    this.isNightMode = !this.isNightMode;
    if (this.isNightMode) {
      this.scene.background = new THREE.Color(0x0a0c13);
      this.scene.fog = new THREE.FogExp2(0x0a0c13, 0.015);
      this.dirLight.intensity = 0.9;
      this.dirLight.color.set(0x8da1de);
      this.hemiLight.intensity = 0.6;
      this.monumentLight.intensity = 3.5;
      this.stageLight.intensity = 4.0;
    } else {
      // Festival Daytime
      this.scene.background = new THREE.Color(0x8bc34a);
      this.scene.fog = new THREE.FogExp2(0xa5d6a7, 0.01);
      this.dirLight.intensity = 1.8;
      this.dirLight.color.set(0xfff7e6);
      this.hemiLight.intensity = 1.1;
      this.monumentLight.intensity = 1.5;
      this.stageLight.intensity = 1.5;
    }
    return this.isNightMode;
  }

  private onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Process movement and aim inputs
    this.updatePlayerMovement(delta);

    // 2. Animate central FamBird monument & stage
    this.monumentUpdate(delta);
    this.stageUpdate(delta);

    // 3. Animate Flex Wall, VIP lounges and Photo Booth
    this.flexWallObj?.update(delta);
    this.zomatoLoungeObj?.update(delta);
    this.cinepolisObj?.update(delta);
    this.photoBoothObj?.update(delta);

    // 4. Animate coins & props (bobbing and spinning)
    const time = this.clock.getElapsedTime();
    this.animatedProps.forEach((p) => {
      p.mesh.rotation.y += p.rotSpeed * delta;
      // bob up and down slightly if it's a coin or box
      if (p.mesh.position.y > 0.5) {
        const base = p.mesh.name === 'mascot' ? 5.2 : 0.9;
        p.mesh.position.y = base + Math.sin(time * 3 + p.bobOffset) * 0.12;
      }
    });

    // 5. Update remote multiplayer players
    this.remotePlayers.forEach((entry) => {
      // If position gap is large, snap to avoid lagging slide across map
      if (entry.controller.group.position.distanceTo(entry.targetPos) > 6) {
        entry.controller.group.position.copy(entry.targetPos);
      } else {
        entry.controller.group.position.lerp(entry.targetPos, 0.35);
      }
      entry.controller.group.rotation.y = THREE.MathUtils.damp(
        entry.controller.group.rotation.y,
        entry.targetRotY,
        14,
        delta
      );
      entry.controller.updateAnimation(entry.isMoving, entry.speed, delta);
    });

    // 6. Animate Sabotage Alert Beacons
    this.sabotageBeacons.forEach((beacon) => {
      beacon.rotation.y += delta * 3;
      beacon.position.y = 5.8 + Math.sin(time * 5) * 0.25;
    });

    // 7. Check Emergency Buzzer Proximity
    const distBuzzer = this.playerPos.distanceTo(this.emergencyBuzzerPos);
    const nearBuzzer = distBuzzer < 2.2;
    if (nearBuzzer !== this.isNearBuzzer) {
      this.isNearBuzzer = nearBuzzer;
      this.callbacks.onNearEmergencyBuzzer?.(nearBuzzer);
    }

    // 8. Check Photo Booth Proximity
    if (this.photoBoothObj) {
      const distPB = this.playerPos.distanceTo(this.photoBoothObj.triggerPos);
      const nearPB = distPB < 4.2;
      if (nearPB !== this.isNearPhotoBooth) {
        this.isNearPhotoBooth = nearPB;
        this.callbacks.onNearPhotoBooth?.(nearPB);
      }
    }

    // 9. Check VIP zones proximity
    if (this.isFlexMember) {
      let activeGate: 'zomato_gold' | 'cinepolis' | null = null;
      if (this.zomatoLoungeObj && this.playerPos.distanceTo(this.zomatoLoungeObj.triggerPos) < 5.8) {
        activeGate = 'zomato_gold';
      } else if (this.cinepolisObj && this.playerPos.distanceTo(this.cinepolisObj.triggerPos) < 5.8) {
        activeGate = 'cinepolis';
      }
      if (activeGate !== this.activeFlexGate) {
        this.activeFlexGate = activeGate;
        this.callbacks.onNearFlexGate?.(activeGate);
      }
    }

    // 10. Check Tapli Proximity (When two friends bump within 1.8m)
    const now = performance.now();
    if (now - this.lastGlobalTapliTime > 3500) {
      for (const [_, entry] of this.remotePlayers.entries()) {
        const dist = this.playerPos.distanceTo(entry.controller.group.position);
        if (dist < 1.8) {
          this.lastGlobalTapliTime = now;
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([40, 30, 60]);
            } catch {
              // Ignore unsupported devices
            }
          }
          soundEngine.playTapli();
          this.callbacks.onTapliNudge?.(entry.name);
          break;
        }
      }
    }

    // 11. Check Coin & Box Collisions
    this.checkCollectibleCollisions();

    // 12. Check Stall Proximity
    this.checkStallProximity();

    // 13. Camera smooth follow
    this.updateCameraFollow(delta);

    // 14. Render
    this.renderer.render(this.scene, this.camera);

    // 15. Schedule next frame
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private updatePlayerMovement(delta: number) {
    _moveDir.set(0, 0, 0);

    // Keyboard WASD
    let inputForward = 0;
    let inputRight = 0;

    if (this.keys['w'] || this.keys['arrowup']) inputForward -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) inputForward += 1;
    if (this.keys['a'] || this.keys['arrowleft']) inputRight -= 1;
    if (this.keys['d'] || this.keys['arrowright']) inputRight += 1;

    // Add Joystick
    if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
      inputRight = this.joystickVector.x;
      inputForward = this.joystickVector.y;
    }

    const hasDirectInput = Math.abs(inputForward) > 0.1 || Math.abs(inputRight) > 0.1;

    // Process Aim / Look Virtual Joystick
    if (Math.abs(this.aimJoystickVector.x) > 0.08) {
      this.camAngle -= this.aimJoystickVector.x * delta * 2.8;
    }
    if (Math.abs(this.aimJoystickVector.y) > 0.1) {
      this.camHeight = THREE.MathUtils.clamp(
        this.camHeight - this.aimJoystickVector.y * delta * 2.5,
        2.5,
        6.5
      );
    }

    if (hasDirectInput) {
      this.clickNavTarget = null; // cancel click target
      // Project move relative to camera angle
      const sin = Math.sin(this.camAngle);
      const cos = Math.cos(this.camAngle);

      _moveDir.x = inputRight * cos - inputForward * sin;
      _moveDir.z = inputRight * sin + inputForward * cos;
      _moveDir.normalize();

      const speed = this.keys['shift'] ? 12 : 7.5;
      this.playerSpeed = speed;
      this.isMoving = true;

      // Rotate player towards moving direction
      this.targetRotation = Math.atan2(_moveDir.x, _moveDir.z);
    } else if (this.clickNavTarget) {
      // Move towards click target
      const dist = this.playerPos.distanceTo(this.clickNavTarget);
      if (dist > 0.4) {
        _moveDir.subVectors(this.clickNavTarget, this.playerPos).setY(0).normalize();
        this.playerSpeed = 8.0;
        this.isMoving = true;
        this.targetRotation = Math.atan2(_moveDir.x, _moveDir.z);
      } else {
        this.clickNavTarget = null;
        this.isMoving = false;
        this.playerSpeed = 0;
      }
    } else {
      this.isMoving = false;
      this.playerSpeed = THREE.MathUtils.damp(this.playerSpeed, 0, 8, delta);

      // If stationary and aiming, rotate player to aim heading
      if (Math.abs(this.aimJoystickVector.x) > 0.15 || Math.abs(this.aimJoystickVector.y) > 0.15) {
        this.targetRotation = this.camAngle + Math.atan2(this.aimJoystickVector.x, -this.aimJoystickVector.y);
        this.playerRotation = THREE.MathUtils.damp(this.playerRotation, this.targetRotation, 10, delta);
        this.player.group.rotation.y = this.playerRotation;
      }
    }

    if (this.isMoving) {
      // Step sound throttled
      if (Math.random() < 0.08) {
        soundEngine.playFootstep();
      }

      // Smooth rotate towards movement direction
      this.playerRotation = THREE.MathUtils.damp(this.playerRotation, this.targetRotation, 14, delta);
      this.player.group.rotation.y = this.playerRotation;

      // Apply movement displacement
      this.playerPos.x += _moveDir.x * this.playerSpeed * delta;
      this.playerPos.z += _moveDir.z * this.playerSpeed * delta;

      // Keep within campus bounds (-65 to 65)
      this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -65, 65);
      this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -65, 65);

      // Flex Wall barrier collision (located around wallZ = -14)
      const wallZ = this.flexWallObj ? this.flexWallObj.wallZ : -14;
      if (!this.isFlexMember && this.playerPos.z < wallZ + 1.2 && this.playerPos.z > wallZ - 2.8) {
        const isZomatoGate = Math.abs(this.playerPos.x - -16) < 3.2;
        const isCinepolisGate = Math.abs(this.playerPos.x - 16) < 3.2;

        // Bounce back to safe front side of wall
        this.playerPos.z = wallZ + 1.25;

        const now = performance.now();
        if (now - this.lastFlexGateAlertTime > 2500) {
          this.lastFlexGateAlertTime = now;
          soundEngine.playGateReject();
          if (isZomatoGate) {
            this.callbacks.onNearFlexGate?.('zomato_gold');
          } else if (isCinepolisGate) {
            this.callbacks.onNearFlexGate?.('cinepolis');
          } else {
            this.callbacks.onNearFlexGate?.('barrier');
          }
        }
      }

      this.player.group.position.copy(this.playerPos);

      // Notify callback for minimap & multiplayer
      this.callbacks.onPlayerPosition(this.playerPos.x, this.playerPos.z, this.playerRotation, true, this.playerSpeed);
    } else if (this.wasMoving) {
      // Just stopped moving! Emit stopped packet to remote players
      this.callbacks.onPlayerPosition(this.playerPos.x, this.playerPos.z, this.playerRotation, false, 0);
    }
    this.wasMoving = this.isMoving;

    // Animate character limbs
    this.player.updateAnimation(this.isMoving, this.playerSpeed, delta);
  }

  private checkCollectibleCollisions() {
    this.coins.forEach((c) => {
      if (c.data.collected) return;
      const coinPos = _vec3.set(c.data.position[0], 0, c.data.position[2]);
      const dist = this.playerPos.distanceTo(coinPos);

      if (dist < 1.45) {
        c.data.collected = true;
        c.mesh.visible = false;
        this.collectedCoinCount += c.data.value;

        if (c.data.isMysteryBox) {
          soundEngine.playMysteryBox();
        } else {
          soundEngine.playCoin();
        }

        this.callbacks.onCoinCollected(c.data, this.collectedCoinCount);
      }
    });
  }

  private checkStallProximity() {
    let nearestStall: StallData | null = null;
    let minDistance = 3.6;

    for (const item of this.stallMeshes) {
      const dist = this.playerPos.distanceTo(item.triggerPos);
      if (dist < minDistance) {
        minDistance = dist;
        nearestStall = item.stall;
      }
    }

    if (nearestStall !== this.activeNearStall) {
      this.activeNearStall = nearestStall;
      this.callbacks.onNearStall(nearestStall);
    }
  }

  private updateCameraFollow(delta: number) {
    // Camera sits behind player based on camAngle
    const desiredX = this.playerPos.x + Math.sin(this.camAngle) * this.camDistance;
    const desiredZ = this.playerPos.z + Math.cos(this.camAngle) * this.camDistance;
    const desiredY = this.playerPos.y + this.camHeight;

    _camPos.set(desiredX, desiredY, desiredZ);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camPos.x, 8, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camPos.y, 8, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camPos.z, 8, delta);

    _camLook.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
    this.camera.lookAt(_camLook);
  }

  public syncRemotePlayer(player: RemotePlayer) {
    let entry = this.remotePlayers.get(player.id);
    if (!entry) {
      const controller = createPlayerCharacter(player.customization);
      controller.group.scale.set(0.85, 0.85, 0.85);
      const sprite = createNameTagSprite(player.name, player.persona);
      controller.group.add(sprite);
      controller.group.position.set(...player.position);
      this.scene.add(controller.group);

      entry = {
        controller,
        targetPos: new THREE.Vector3(...player.position),
        targetRotY: player.rotationY,
        isMoving: player.isMoving,
        speed: player.speed,
        sprite,
        name: player.name,
      };
      this.remotePlayers.set(player.id, entry);
    } else {
      entry.name = player.name;
      entry.targetPos.set(...player.position);
      entry.targetRotY = player.rotationY;
      entry.isMoving = player.isMoving;
      entry.speed = player.speed;
      entry.controller.updateCustomization(player.customization);
    }
  }

  public updateRemotePlayerPosition(
    id: string,
    position: [number, number, number],
    rotationY: number,
    isMoving: boolean,
    speed: number,
    isHoverboard: boolean
  ) {
    const entry = this.remotePlayers.get(id);
    if (entry) {
      entry.targetPos.set(...position);
      entry.targetRotY = rotationY;
      entry.isMoving = isMoving;
      entry.speed = speed;
      entry.controller.hoverboard.visible = isHoverboard;
    }
  }

  public hasRemotePlayer(id: string): boolean {
    return this.remotePlayers.has(id);
  }

  public removeRemotePlayer(id: string) {
    const entry = this.remotePlayers.get(id);
    if (entry) {
      this.scene.remove(entry.controller.group);
      this.remotePlayers.delete(id);
    }
  }

  public updateSabotages(sabotages: Sabotage[]) {
    const activeStallIds = new Set(sabotages.filter((s) => !s.fixed).map((s) => s.stallId));

    this.sabotageBeacons.forEach((beacon, stallId) => {
      if (!activeStallIds.has(stallId)) {
        this.scene.remove(beacon);
        this.sabotageBeacons.delete(stallId);
      }
    });

    sabotages.forEach((sab) => {
      if (!sab.fixed && !this.sabotageBeacons.has(sab.stallId)) {
        const stall = STALLS.find((s) => s.id === sab.stallId);
        if (stall) {
          const beaconGroup = new THREE.Group();
          beaconGroup.position.set(stall.position[0], 5.8, stall.position[2]);

          const warningMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.9, 0),
            new THREE.MeshBasicMaterial({ color: '#FF1744', wireframe: true })
          );
          beaconGroup.add(warningMesh);

          const light = new THREE.PointLight(0xff1744, 4, 12);
          beaconGroup.add(light);

          this.scene.add(beaconGroup);
          this.sabotageBeacons.set(sab.stallId, beaconGroup);
        }
      }
    });
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.remotePlayers.forEach((entry) => {
      this.scene.remove(entry.controller.group);
    });
    this.remotePlayers.clear();
    this.renderer.dispose();
  }
}
