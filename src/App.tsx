/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { CampusScene } from './game/CampusScene';
import { HUD } from './components/HUD';
import { ControlsDock } from './components/ControlsDock';
import { StallModal } from './components/StallModal';
import { WalletModal } from './components/WalletModal';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { MobileControls } from './components/MobileControls';
import { EmergencyTribunalModal } from './components/EmergencyTribunalModal';
import { PersonaSelectorModal } from './components/PersonaSelectorModal';
import { VirtualAssetsLockerModal } from './components/VirtualAssetsLockerModal';
import { RegistrationModal } from './components/RegistrationModal';
import { CampusMapModal } from './components/CampusMapModal';
import { TaskListHUD } from './components/TaskListHUD';
import { RobbedAlertToast } from './components/RobbedAlertToast';
import { FraudActionDock } from './components/FraudActionDock';
import { FlexWallModal } from './components/FlexWallModal';
import { FlexZoneModal } from './components/FlexZoneModal';
import { PhotoBoothModal } from './components/PhotoBoothModal';
import { TapliToast } from './components/TapliToast';
import {
  StallData,
  Coupon,
  PlayerCustomization,
  CoinCollectible,
  RemotePlayer,
  PersonaType,
  Sabotage,
  AuditLog,
  VirtualAsset,
  PlayerTask,
  RobberyAlert,
} from './types';
import { multiplayerService } from './services/multiplayer';
import { soundEngine } from './services/audio';
import { INITIAL_VIRTUAL_ASSETS, PERSONAS } from './game/personaData';

const STORAGE_KEY_COINS = 'famfest_coins';
const STORAGE_KEY_COUPONS = 'famfest_coupons';
const STORAGE_KEY_CUSTOM = 'famfest_avatar';
const STORAGE_KEY_VISITED = 'famfest_visited';
const STORAGE_KEY_NAME = 'famfest_name';
const STORAGE_KEY_PERSONA = 'famfest_persona';
const STORAGE_KEY_ASSETS = 'famfest_assets';
const STORAGE_KEY_FLEX = 'famfest_flex_member';
const SESSION_KEY_REGISTERED = 'famfest_session_registered';

const INITIAL_TASKS: PlayerTask[] = [
  {
    id: 'task-zomato',
    title: 'Collect Zomato 50% Off Deal',
    stallId: 'zomato',
    stallName: 'Zomato',
    category: 'Food',
    description: 'Visit the Zomato stall and claim the Late Night Campus Craving coupon.',
    completed: false,
    rewardCoins: 100,
  },
  {
    id: 'task-nike',
    title: 'Grab Nike 25% Sneaker Drop',
    stallId: 'nike',
    stallName: 'Nike',
    category: 'Fashion',
    description: 'Visit the Nike kiosk to unlock the Air Jordan student drop code.',
    completed: false,
    rewardCoins: 100,
  },
  {
    id: 'task-boat',
    title: 'Test boAt Gaming Earbuds',
    stallId: 'boat',
    stallName: 'boAt',
    category: 'Tech',
    description: 'Visit the boAt stall and inspect the low-latency gaming headset deal.',
    completed: false,
    rewardCoins: 100,
  },
  {
    id: 'task-dominos',
    title: "Grab Domino's Free Lava Cake Deal",
    stallId: 'dominos',
    stallName: "Domino's",
    category: 'Food',
    description: "Visit Domino's stall and claim the Cheesy Pizza deal.",
    completed: false,
    rewardCoins: 100,
  },
];

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CampusScene | null>(null);

  // New Session Registration Check
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY_REGISTERED) === 'true';
  });

  // Room & Identity
  const [roomCode, setRoomCode] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'CAMPUS-FAM';
  });

  const [playerId] = useState<string>(() => `player-${Math.random().toString(36).substring(2, 9)}`);
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_NAME) || 'Student';
  });

  const [persona, setPersona] = useState<PersonaType>(() => {
    return (localStorage.getItem(STORAGE_KEY_PERSONA) as PersonaType) || 'Campus Hustler';
  });

  const [myRole, setMyRole] = useState<'saver' | 'scammer'>('saver');

  // App & Currency State
  const [famCoins, setFamCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COINS);
    return saved ? parseInt(saved, 10) : 250;
  });

  const [savedCoupons, setSavedCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COUPONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [visitedStalls, setVisitedStalls] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VISITED);
    return saved ? JSON.parse(saved) : [];
  });

  const [customization, setCustomization] = useState<PlayerCustomization>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
    return saved
      ? JSON.parse(saved)
      : {
          hoodieColor: '#FFE600',
          hairColor: '#12141c',
          skinColor: '#f5cba7',
          trailColor: '#FFE600',
          mount: 'shoes',
        };
  });

  const [virtualAssets, setVirtualAssets] = useState<VirtualAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_VIRTUAL_ASSETS;
  });

  // Assigned Tasks
  const [tasks, setTasks] = useState<PlayerTask[]>(INITIAL_TASKS);

  // Stealth Robbery Alert
  const [robberyAlert, setRobberyAlert] = useState<RobberyAlert | null>(null);

  // Multiplayer & Fraud Deduction Game State
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [sabotages, setSabotages] = useState<Sabotage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-initial',
      text: '⚡ Welcome to FamFest 3D! Complete assigned tasks and beware of robbers.',
      time: 'Now',
      severity: 'info',
    },
  ]);
  const [chatMessages, setChatMessages] = useState<{ id: string; senderName: string; text: string; time: string }[]>([]);

  // Emergency Meeting State
  const [isEmergencyTribunalOpen, setIsEmergencyTribunalOpen] = useState(false);
  const [emergencyCallerName, setEmergencyCallerName] = useState('Campus Security');
  const [voteResult, setVoteResult] = useState<{
    ejectedId: string | null;
    ejectedName: string;
    wasScammer: boolean;
    winner: 'savers' | 'scammer' | null;
  } | null>(null);

  // Flex Membership State
  const [isFlexMember, setIsFlexMember] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_FLEX) === 'true';
  });
  const [isFlexWallModalOpen, setIsFlexWallModalOpen] = useState<boolean>(false);
  const [flexGateType, setFlexGateType] = useState<'zomato_gold' | 'cinepolis' | 'barrier' | null>(null);
  const [isFlexZoneModalOpen, setIsFlexZoneModalOpen] = useState<boolean>(false);
  const [activeFlexZone, setActiveFlexZone] = useState<'zomato_gold' | 'cinepolis' | null>(null);

  // Photo Booth State
  const [isPhotoBoothModalOpen, setIsPhotoBoothModalOpen] = useState<boolean>(false);
  const [photoBoothSnapshot, setPhotoBoothSnapshot] = useState<string>('');
  const [isNearPhotoBooth, setIsNearPhotoBooth] = useState<boolean>(false);
  const [isNearFlexGate, setIsNearFlexGate] = useState<boolean>(false);

  // Tapli Nudge State
  const [tapliFriendName, setTapliFriendName] = useState<string | null>(null);

  // Proximity & Scene state
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState<boolean>(false);
  const [nearStall, setNearStall] = useState<StallData | null>(null);
  const [isNearEmergencyBuzzer, setIsNearEmergencyBuzzer] = useState<boolean>(false);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 18, rotY: Math.PI });

  // Modals
  const [activeModalStall, setActiveModalStall] = useState<StallData | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FLEX, isFlexMember.toString());
  }, [isFlexMember]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COINS, famCoins.toString());
  }, [famCoins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(savedCoupons));
  }, [savedCoupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VISITED, JSON.stringify(visitedStalls));
  }, [visitedStalls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customization));
  }, [customization]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NAME, playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PERSONA, persona);
  }, [persona]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(virtualAssets));
  }, [virtualAssets]);

  // Connect WebSocket Multiplayer
  useEffect(() => {
    if (!isRegistered) return;

    multiplayerService.connect(
      roomCode,
      {
        id: playerId,
        name: playerName,
        persona,
        position: [0, 0, 18],
        rotationY: Math.PI,
        customization,
        coins: famCoins,
      },
      {
        onInit: (data) => {
          setRemotePlayers(data.players.filter((p) => p.id !== playerId));
          setSabotages(data.sabotages);
          setAuditLogs(data.auditLogs);
          setMyRole(data.role);

          data.players.forEach((p) => {
            if (p.id !== playerId) {
              sceneRef.current?.syncRemotePlayer(p);
            }
          });
          sceneRef.current?.updateSabotages(data.sabotages);
        },
        onPlayerJoined: (p) => {
          if (p.id === playerId) return;
          setRemotePlayers((prev) => [...prev.filter((item) => item.id !== p.id), p]);
          sceneRef.current?.syncRemotePlayer(p);
        },
        onPlayerMoved: (data) => {
          if (data.id === playerId) return;
          setRemotePlayers((prev) =>
            prev.map((p) =>
              p.id === data.id
                ? {
                    ...p,
                    position: data.position,
                    rotationY: data.rotationY,
                    isMoving: data.isMoving,
                    speed: data.speed,
                    isHoverboard: data.isHoverboard,
                  }
                : p
            )
          );
          // Directly update the 3D scene actor in real-time
          sceneRef.current?.updateRemotePlayerPosition(
            data.id,
            data.position,
            data.rotationY,
            data.isMoving,
            data.speed,
            data.isHoverboard
          );
        },
        onPlayerLeft: (id) => {
          setRemotePlayers((prev) => prev.filter((p) => p.id !== id));
          sceneRef.current?.removeRemotePlayer(id);
        },
        onSabotageCreated: (sab, log) => {
          setSabotages((prev) => [...prev, sab]);
          setAuditLogs((prev) => [log, ...prev]);
          sceneRef.current?.updateSabotages([sab]);
          soundEngine.playMysteryBox();
        },
        onTaskCompleted: (data) => {
          if (data.stallId) {
            setSabotages((prev) => prev.filter((s) => s.stallId !== data.stallId));
            sceneRef.current?.updateSabotages([]);
          }
          setAuditLogs((prev) => [data.logEntry, ...prev]);
        },
        onEmergencyStarted: (data) => {
          setEmergencyCallerName(data.callerName);
          setIsEmergencyTribunalOpen(true);
          setAuditLogs((prev) => [data.logEntry, ...prev]);
          setVoteResult(null);
          soundEngine.playMysteryBox();
        },
        onVoteUpdate: (voterId, targetId) => {
          setRemotePlayers((prev) =>
            prev.map((p) => (p.id === voterId ? { ...p, votedFor: targetId } : p))
          );
        },
        onVoteResult: (data) => {
          setVoteResult(data);
          if (data.wasScammer) {
            setFamCoins((prev) => prev + 500);
          }
        },
        onRoleAssigned: (role) => {
          setMyRole(role);
        },
        onChatMessage: (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        },
        onVictimRobbed: (data) => {
          // Stealth robbery event: anonymous notification!
          soundEngine.playMysteryBox();
          setFamCoins((prev) => Math.max(0, prev - data.stolenCoins));
          setSavedCoupons((prev) => prev.slice(0, Math.max(0, prev.length - data.stolenCouponsCount)));
          setRobberyAlert({
            id: `rob-${Date.now()}`,
            stolenCoins: data.stolenCoins,
            stolenCouponsCount: data.stolenCouponsCount,
            timestamp: Date.now(),
          });
        },
        onRobberSuccess: (data) => {
          soundEngine.playCoin();
          setFamCoins((prev) => prev + data.stolenCoins);
        },
        onAuditLog: (logEntry) => {
          setAuditLogs((prev) => [logEntry, ...prev]);
        },
      }
    );

    return () => {
      multiplayerService.disconnect();
    };
  }, [playerId, roomCode, isRegistered]);

  // Handle stall visiting
  const handleOpenStall = useCallback((stall: StallData) => {
    soundEngine.playStallInteract();
    setActiveModalStall(stall);
    setVisitedStalls((prev) => (prev.includes(stall.id) ? prev : [...prev, stall.id]));

    // Check off assigned task for this stall
    setTasks((prev) =>
      prev.map((t) => (t.stallId === stall.id ? { ...t, completed: true } : t))
    );
  }, []);

  // Handle coupon saving
  const handleSaveCoupon = useCallback((coupon: Coupon) => {
    setSavedCoupons((prev) => {
      if (prev.some((c) => c.id === coupon.id)) return prev;
      return [...prev, coupon];
    });
    setFamCoins((prev) => prev + 100);
    multiplayerService.sendCompleteTask();

    // Check off task
    setTasks((prev) =>
      prev.map((t) => (t.stallId === coupon.brandId ? { ...t, completed: true } : t))
    );
  }, []);

  // Initialize Three.js scene once inside empty ref container
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new CampusScene(canvasMountRef.current, customization, isFlexMember, {
      onNearStall: (stall) => {
        setNearStall(stall);
      },
      onCoinCollected: (coin: CoinCollectible, _totalCoins: number) => {
        setFamCoins((prev) => prev + coin.value);
      },
      onPlayerPosition: (x: number, z: number, rotY: number, isMoving: boolean, speed: number) => {
        setPlayerPos({ x, z, rotY });
        multiplayerService.sendMovement(
          [x, 0, z],
          rotY,
          isMoving,
          speed,
          customization.mount === 'hoverboard'
        );
      },
      onNearEmergencyBuzzer: (isNear: boolean) => {
        setIsNearEmergencyBuzzer(isNear);
      },
      onNearFlexGate: (gate) => {
        if (gate) {
          setIsNearFlexGate(true);
          setFlexGateType(gate);
          if (!isFlexMember) {
            setIsFlexWallModalOpen(true);
          } else if (gate === 'zomato_gold' || gate === 'cinepolis') {
            setActiveFlexZone(gate);
            setIsFlexZoneModalOpen(true);
          }
        } else {
          setIsNearFlexGate(false);
          setFlexGateType(null);
        }
      },
      onNearPhotoBooth: (isNear: boolean) => {
        setIsNearPhotoBooth(isNear);
      },
      onTapliNudge: (friendName: string) => {
        setTapliFriendName(friendName);
      },
    });

    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Find nearest remote player for Robber action (within 3.5m)
  const nearPlayer = useMemo(() => {
    for (const p of remotePlayers) {
      const dist = Math.hypot(playerPos.x - p.position[0], playerPos.z - p.position[2]);
      if (dist < 3.5) {
        return p;
      }
    }
    return null;
  }, [remotePlayers, playerPos]);

  // Update customization on scene actor
  const handleUpdateCustomization = (newCustom: PlayerCustomization) => {
    setCustomization(newCustom);
    sceneRef.current?.updatePlayerCustomization(newCustom);
  };

  const handleToggleHoverboard = () => {
    const nextMount = customization.mount === 'hoverboard' ? 'shoes' : 'hoverboard';
    const updated: PlayerCustomization = { ...customization, mount: nextMount };
    setCustomization(updated);
    sceneRef.current?.updatePlayerCustomization(updated);
    soundEngine.playStallInteract();
  };

  const handleTeleport = (stallId: string) => {
    sceneRef.current?.teleportToStall(stallId);
  };

  const handleToggleNight = () => {
    if (sceneRef.current) {
      const mode = sceneRef.current.toggleNightMode();
      setIsNightMode(mode);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleToggleBgMusic = () => {
    const isPlaying = soundEngine.toggleBgMusic();
    setIsBgMusicPlaying(isPlaying);
  };

  const handleJoystickMove = useCallback((x: number, y: number) => {
    sceneRef.current?.setJoystickInput(x, y);
  }, []);

  const handleJoystickAim = useCallback((x: number, y: number) => {
    sceneRef.current?.setAimJoystickInput(x, y);
  }, []);

  // Flex Membership & Gate Handlers
  const handleUnlockFlex = useCallback(() => {
    setIsFlexMember(true);
    sceneRef.current?.setFlexMembership(true);
    setFamCoins((prev) => prev + 500);
  }, []);

  const handleOpenFlexGate = useCallback(() => {
    if (!isFlexMember) {
      setIsFlexWallModalOpen(true);
    } else {
      setActiveFlexZone(flexGateType === 'cinepolis' ? 'cinepolis' : 'zomato_gold');
      setIsFlexZoneModalOpen(true);
    }
  }, [isFlexMember, flexGateType]);

  // Photo Booth Handlers
  const handleOpenPhotoBooth = useCallback(() => {
    const snap = sceneRef.current?.captureSnapshot() || '';
    setPhotoBoothSnapshot(snap);
    setIsPhotoBoothModalOpen(true);
  }, []);

  const handleRetakeSnapshot = useCallback((): string => {
    return sceneRef.current?.captureSnapshot() || '';
  }, []);

  // Fraud Sabotage & Robbery Handlers
  const handleCommitSabotage = (stallId: string, stallName: string, type: string) => {
    multiplayerService.sendSabotage(stallId, stallName, type);
  };

  const handleFixSabotage = (stallId: string, stallName: string) => {
    multiplayerService.sendCompleteTask(stallId, stallName);
    setFamCoins((prev) => prev + 150);
  };

  const handleRobNearPlayer = (victimId: string) => {
    multiplayerService.robPlayer(victimId);
    soundEngine.playMysteryBox();
  };

  const handleTriggerEmergency = () => {
    multiplayerService.callEmergency();
  };

  const handleClaimVirtualAsset = (asset: VirtualAsset) => {
    setVirtualAssets((prev) => {
      if (prev.some((a) => a.id === asset.id)) return prev;
      return [...prev, { ...asset, unlockedAt: Date.now() }];
    });
    setFamCoins((prev) => prev + 250);
  };

  // Handle Initial Registration Submission
  const handleRegisterSession = (data: {
    name: string;
    persona: PersonaType;
    roomCode: string;
    customization: PlayerCustomization;
  }) => {
    setPlayerName(data.name);
    setPersona(data.persona);
    setRoomCode(data.roomCode);
    setCustomization(data.customization);
    sceneRef.current?.updatePlayerCustomization(data.customization);
    sessionStorage.setItem(SESSION_KEY_REGISTERED, 'true');
    setIsRegistered(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0c13] select-none text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Isolated WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2. Initial Registration Screen for New Sessions / Devices */}
      {!isRegistered && (
        <RegistrationModal initialRoom={roomCode} onRegister={handleRegisterSession} />
      )}

      {/* 3. Top HUD Overlay */}
      <HUD
        famCoins={famCoins}
        visitedStalls={visitedStalls}
        savedCoupons={savedCoupons}
        isNightMode={isNightMode}
        isMuted={isMuted}
        isBgMusicPlaying={isBgMusicPlaying}
        nearStall={nearStall}
        playerPos={playerPos}
        playerCount={remotePlayers.length + 1}
        sabotageCount={sabotages.filter((s) => !s.fixed).length}
        myRole={myRole}
        onToggleNight={handleToggleNight}
        onToggleMute={handleToggleMute}
        onToggleBgMusic={handleToggleBgMusic}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenStall={handleOpenStall}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenAssets={() => setIsAssetsModalOpen(true)}
        onOpenPersona={() => setIsPersonaModalOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* 4. Assigned Tasks HUD (Collapsible) */}
      <TaskListHUD
        tasks={tasks}
        onGuideToStall={handleTeleport}
        myRole={myRole}
      />

      {/* 5. Mobile Controls (Ergonomic Joystick & Thumb Action Cluster) */}
      <MobileControls
        onMove={handleJoystickMove}
        myRole={myRole}
        nearStall={nearStall}
        nearPlayer={nearPlayer}
        isNearEmergencyBuzzer={isNearEmergencyBuzzer}
        isCurrentStallSabotaged={
          nearStall ? sabotages.some((s) => s.stallId === nearStall.id && !s.fixed) : false
        }
        isHoverboard={customization.mount === 'hoverboard'}
        onOpenStall={handleOpenStall}
        onRobNearPlayer={handleRobNearPlayer}
        onFixSabotage={() => nearStall && handleFixSabotage(nearStall.id, nearStall.name)}
        onTriggerEmergency={handleTriggerEmergency}
        onToggleHoverboard={handleToggleHoverboard}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* 6. Fraud Sabotages & Emergency Audit Dock (Desktop) */}
      <FraudActionDock
        myRole={myRole}
        nearStall={nearStall}
        activeSabotages={sabotages}
        isNearEmergencyBuzzer={isNearEmergencyBuzzer}
        onCommitSabotage={handleCommitSabotage}
        onFixSabotage={handleFixSabotage}
        onTriggerEmergency={handleTriggerEmergency}
      />

      {/* 7. Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <ControlsDock
        onTeleport={handleTeleport}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        isHoverboard={customization.mount === 'hoverboard'}
        onToggleHoverboard={handleToggleHoverboard}
      />

      {/* 8. Stealth Robbery Alert Toast (When anonymous pickpocket occurs) */}
      {robberyAlert && (
        <RobbedAlertToast
          stolenCoins={robberyAlert.stolenCoins}
          stolenCouponsCount={robberyAlert.stolenCouponsCount}
          onCallEmergency={() => {
            setRobberyAlert(null);
            handleTriggerEmergency();
          }}
          onDismiss={() => setRobberyAlert(null)}
        />
      )}

      {/* 9. Brand Stall Modal */}
      {activeModalStall && (
        <StallModal
          stall={activeModalStall}
          onClose={() => setActiveModalStall(null)}
          onSaveCoupon={handleSaveCoupon}
          savedCouponIds={savedCoupons.map((c) => c.id)}
        />
      )}

      {/* 10. Coupon Wallet Modal */}
      {isWalletOpen && (
        <WalletModal
          coupons={savedCoupons}
          onClose={() => setIsWalletOpen(false)}
          onSelectStallById={(id) => {
            setIsWalletOpen(false);
            handleTeleport(id);
          }}
        />
      )}

      {/* 11. Campus Map Modal */}
      {isMapOpen && (
        <CampusMapModal
          playerPos={playerPos}
          onNavigateToStall={handleTeleport}
          onClose={() => setIsMapOpen(false)}
        />
      )}

      {/* 12. Avatar Customizer Modal */}
      {isCustomizerOpen && (
        <AvatarCustomizerModal
          customization={customization}
          onUpdate={handleUpdateCustomization}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* 13. Persona & Invite Access Modal */}
      {isPersonaModalOpen && (
        <PersonaSelectorModal
          currentName={playerName}
          currentPersona={persona}
          myRole={myRole}
          roomCode={roomCode}
          onSave={(newName, newPersona, newCustom) => {
            setPlayerName(newName);
            setPersona(newPersona);
            handleUpdateCustomization(newCustom);
          }}
          onClose={() => setIsPersonaModalOpen(false)}
        />
      )}

      {/* 14. FamApp Virtual Assets Locker & 1-Tap Checkout Simulator */}
      {isAssetsModalOpen && (
        <VirtualAssetsLockerModal
          assets={virtualAssets}
          playerName={playerName}
          onClose={() => setIsAssetsModalOpen(false)}
          onSimulateCheckout={(_merchant, coupon) => {
            handleSaveCoupon(coupon);
          }}
        />
      )}

      {/* 15. Among Us Style Emergency Fraud Tribunal Modal */}
      {isEmergencyTribunalOpen && (
        <EmergencyTribunalModal
          callerName={emergencyCallerName}
          myPlayerId={playerId}
          players={[
            {
              id: playerId,
              name: `${playerName} (You)`,
              persona,
              role: myRole,
              position: [playerPos.x, 0, playerPos.z],
              rotationY: playerPos.rotY,
              isMoving: false,
              speed: 0,
              isHoverboard: customization.mount === 'hoverboard',
              customization,
              coins: famCoins,
              tasksCompleted: tasks.filter((t) => t.completed).length,
              votedFor: null,
              isAlive: true,
            },
            ...remotePlayers,
          ]}
          auditLogs={auditLogs}
          chatMessages={chatMessages}
          onCastVote={(targetId) => multiplayerService.castVote(targetId)}
          onSendChat={(text) => multiplayerService.sendChatMessage(playerName, text)}
          voteResult={voteResult}
          onCloseResult={() => {
            setIsEmergencyTribunalOpen(false);
            setVoteResult(null);
          }}
          onClaimAsset={handleClaimVirtualAsset}
        />
      )}
    </div>
  );
}
