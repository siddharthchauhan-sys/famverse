/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Multi-user & Fraud Game State
interface PlayerState {
  id: string;
  name: string;
  persona: string;
  role: 'saver' | 'scammer';
  position: [number, number, number];
  rotationY: number;
  isMoving: boolean;
  speed: number;
  isHoverboard: boolean;
  customization: {
    hoodieColor: string;
    hairColor: string;
    skinColor: string;
    trailColor: string;
    mount: 'shoes' | 'hoverboard';
  };
  coins: number;
  tasksCompleted: number;
  votedFor: string | null;
  isAlive: boolean;
  isBot?: boolean;
}

interface SabotageState {
  id: string;
  type: 'phishing_qr' | 'jammed_soundbox' | 'fake_coupon' | 'coin_siphon';
  stallId: string;
  stallName: string;
  fixed: boolean;
  tamperedBy: string;
  timestamp: number;
}

interface RoomState {
  code: string;
  status: 'lobby' | 'playing' | 'emergency' | 'ended';
  players: Map<string, PlayerState>;
  sabotages: SabotageState[];
  auditLogs: { id: string; text: string; time: string; severity: 'info' | 'warning' | 'alert' }[];
  emergencyCaller: string | null;
  meetingTimeRemaining: number;
  scammerId: string | null;
  winner: 'savers' | 'scammer' | null;
}

const rooms = new Map<string, RoomState>();

// Create or get default festival room
function getOrCreateRoom(code: string = 'CAMPUS-FAM'): RoomState {
  if (!rooms.has(code)) {
    const room: RoomState = {
      code,
      status: 'playing',
      players: new Map(),
      sabotages: [],
      auditLogs: [
        {
          id: 'log-0',
          text: '⚡ FamFest 3D Campus Security System Online. Beware of payment phishing scammers!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'info',
        },
      ],
      emergencyCaller: null,
      meetingTimeRemaining: 0,
      scammerId: null,
      winner: null,
    };
    rooms.set(code, room);
  }
  return rooms.get(code)!;
}

// Ensure default room exists
const defaultRoom = getOrCreateRoom('CAMPUS-FAM');

// WebSocket Server with explicit upgrade routing
const wss = new WebSocketServer({ noServer: true });
const clientRoomMap = new Map<WebSocket, { roomCode: string; playerId: string }>();

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/ws' || pathname === '/' || !pathname.includes('.')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// HTTP API Fallback for room sync across all networks
app.get('/api/room/:code', (req, res) => {
  const room = getOrCreateRoom(req.params.code);
  res.json({
    players: Array.from(room.players.values()),
    sabotages: room.sabotages,
    auditLogs: room.auditLogs,
  });
});

app.post('/api/room/:code/move', (req, res) => {
  const room = getOrCreateRoom(req.params.code);
  const { playerId, position, rotationY, isMoving, speed, isHoverboard } = req.body;
  const p = room.players.get(playerId);
  if (p) {
    p.position = position;
    p.rotationY = rotationY;
    p.isMoving = isMoving;
    p.speed = speed;
    p.isHoverboard = isHoverboard;
    broadcastToRoom(room.code, {
      type: 'player:moved',
      id: playerId,
      position,
      rotationY,
      isMoving,
      speed,
      isHoverboard,
    });
  }
  res.json({ ok: true });
});

function broadcastToRoom(roomCode: string, message: object, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      const info = clientRoomMap.get(client);
      if (info && info.roomCode === roomCode) {
        client.send(data);
      }
    }
  });
}

function checkAndAssignRoles(room: RoomState) {
  const playerList = Array.from(room.players.values());
  if (playerList.length >= 2 && !room.scammerId) {
    const scammerIndex = Math.floor(Math.random() * playerList.length);
    playerList.forEach((p, idx) => {
      p.role = idx === scammerIndex ? 'scammer' : 'saver';
    });
    room.scammerId = playerList[scammerIndex].id;

    // Send role reveal
    wss.clients.forEach((client) => {
      const info = clientRoomMap.get(client);
      if (info && info.roomCode === room.code) {
        const p = room.players.get(info.playerId);
        if (p && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: 'role:assigned',
              role: p.role,
              scammerName: p.role === 'scammer' ? p.name : undefined,
            })
          );
        }
      }
    });
  }
}

// Add automated student personas to populate the world for vibrant multiplayer
function seedCampusBots(room: RoomState) {
  if (room.players.size < 4) {
    const botPersonas: Partial<PlayerState>[] = [
      {
        id: 'bot-aarav',
        name: 'Aarav (Sneakerhead)',
        persona: 'Sneakerhead Scout',
        position: [-24, 0, 8],
        rotationY: 0,
        isMoving: false,
        speed: 0,
        isHoverboard: false,
        customization: {
          hoodieColor: '#FF5722',
          hairColor: '#12141c',
          skinColor: '#f5cba7',
          trailColor: '#FF5722',
          mount: 'shoes',
        },
        coins: 450,
        tasksCompleted: 2,
        role: 'saver',
        isAlive: true,
        isBot: true,
      },
      {
        id: 'bot-diya',
        name: 'Diya (Foodie Ninja)',
        persona: 'Foodie Ninja',
        position: [-18, 0, -14],
        rotationY: Math.PI * 0.4,
        isMoving: false,
        speed: 0,
        isHoverboard: true,
        customization: {
          hoodieColor: '#FF2E93',
          hairColor: '#e2e8f0',
          skinColor: '#f5cba7',
          trailColor: '#00F0FF',
          mount: 'hoverboard',
        },
        coins: 600,
        tasksCompleted: 3,
        role: 'saver',
        isAlive: true,
        isBot: true,
      },
      {
        id: 'bot-kabir',
        name: 'Kabir (Cyber DJ)',
        persona: 'Cyber DJ',
        position: [24, 0, 6],
        rotationY: -Math.PI * 0.5,
        isMoving: false,
        speed: 0,
        isHoverboard: false,
        customization: {
          hoodieColor: '#00F0FF',
          hairColor: '#00F0FF',
          skinColor: '#f5cba7',
          trailColor: '#FFE600',
          mount: 'shoes',
        },
        coins: 350,
        tasksCompleted: 1,
        role: 'saver',
        isAlive: true,
        isBot: true,
      },
    ];

    botPersonas.forEach((bot) => {
      if (!room.players.has(bot.id!)) {
        room.players.set(bot.id!, bot as PlayerState);
      }
    });
  }
}

seedCampusBots(defaultRoom);

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'join') {
        const roomCode = msg.roomCode || 'CAMPUS-FAM';
        const room = getOrCreateRoom(roomCode);
        const playerId = msg.player.id;

        const playerState: PlayerState = {
          id: playerId,
          name: msg.player.name || 'FamStudent',
          persona: msg.player.persona || 'Campus Hustler',
          role: room.scammerId === playerId ? 'scammer' : 'saver',
          position: msg.player.position || [0, 0, 18],
          rotationY: msg.player.rotationY || Math.PI,
          isMoving: false,
          speed: 0,
          isHoverboard: msg.player.isHoverboard || false,
          customization: msg.player.customization || {
            hoodieColor: '#FFE600',
            hairColor: '#12141c',
            skinColor: '#f5cba7',
            trailColor: '#FFE600',
            mount: 'shoes',
          },
          coins: msg.player.coins || 100,
          tasksCompleted: 0,
          votedFor: null,
          isAlive: true,
        };

        room.players.set(playerId, playerState);
        clientRoomMap.set(ws, { roomCode, playerId });

        // Check if roles need assignment
        checkAndAssignRoles(room);

        // Send full state to newly connected client
        ws.send(
          JSON.stringify({
            type: 'init',
            roomCode,
            status: room.status,
            players: Array.from(room.players.values()),
            sabotages: room.sabotages,
            auditLogs: room.auditLogs,
            role: playerState.role,
          })
        );

        // Notify other clients
        broadcastToRoom(
          roomCode,
          {
            type: 'player:joined',
            player: playerState,
          },
          ws
        );
      } else if (msg.type === 'player:move') {
        const info = clientRoomMap.get(ws);
        if (!info) return;
        const room = rooms.get(info.roomCode);
        if (!room) return;

        const p = room.players.get(info.playerId);
        if (p) {
          p.position = msg.position;
          p.rotationY = msg.rotationY;
          p.isMoving = msg.isMoving;
          p.speed = msg.speed;
          p.isHoverboard = msg.isHoverboard;

          broadcastToRoom(
            info.roomCode,
            {
              type: 'player:moved',
              id: info.playerId,
              position: msg.position,
              rotationY: msg.rotationY,
              isMoving: msg.isMoving,
              speed: msg.speed,
              isHoverboard: msg.isHoverboard,
            },
            ws
          );
        }
      } else if (msg.type === 'scam:commit') {
        // Scammer commits a fraud/sabotage!
        const info = clientRoomMap.get(ws);
        if (!info) return;
        const room = rooms.get(info.roomCode);
        if (!room) return;

        const sabotage: SabotageState = {
          id: `sab-${Date.now()}`,
          type: msg.sabotageType || 'phishing_qr',
          stallId: msg.stallId,
          stallName: msg.stallName,
          fixed: false,
          tamperedBy: info.playerId,
          timestamp: Date.now(),
        };

        room.sabotages.push(sabotage);

        const logEntry = {
          id: `log-${Date.now()}`,
          text: `🚨 ALERT: Tampered Payment Terminal detected at ${msg.stallName} stall! Suspicious spoofing active.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'alert' as const,
        };
        room.auditLogs.unshift(logEntry);

        broadcastToRoom(info.roomCode, {
          type: 'sabotage:created',
          sabotage,
          logEntry,
        });
      } else if (msg.type === 'rob:player') {
        // Robber steals coupons/coins from victim silently without revealing robber identity
        const info = clientRoomMap.get(ws);
        if (!info) return;
        const room = rooms.get(info.roomCode);
        if (!room) return;

        const robber = room.players.get(info.playerId);
        const victimId = msg.victimId;
        const victim = room.players.get(victimId);

        if (robber && victim) {
          const stolenCoins = Math.min(victim.coins, 150);
          victim.coins = Math.max(0, victim.coins - stolenCoins);
          robber.coins += stolenCoins;

          // Find victim's websocket and send anonymous alert (DO NOT INCLUDE ROBBER ID/NAME)
          wss.clients.forEach((client) => {
            const clientInfo = clientRoomMap.get(client);
            if (clientInfo && clientInfo.playerId === victimId && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'victim:robbed',
                  stolenCoins,
                  stolenCouponsCount: 1,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                })
              );
            }
          });

          // Confirm to robber
          ws.send(
            JSON.stringify({
              type: 'robber:success',
              victimName: victim.name,
              stolenCoins,
            })
          );

          // Add anonymous incident to audit log
          const logEntry = {
            id: `log-${Date.now()}`,
            text: `⚠️ THEFT REPORT: A student was pickpocketed near the festival stalls! Someone was robbed!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'warning' as const,
          };
          room.auditLogs.unshift(logEntry);

          broadcastToRoom(info.roomCode, {
            type: 'audit:log',
            logEntry,
          });
        }
      } else if (msg.type === 'task:complete') {
        const info = clientRoomMap.get(ws);
        if (!info) return;
        const room = rooms.get(info.roomCode);
        if (!room) return;

        const p = room.players.get(info.playerId);
        if (p) {
          p.tasksCompleted += 1;
          p.coins += 150;

          // If sabotage was fixed at stall
          if (msg.stallId) {
            room.sabotages = room.sabotages.filter((s) => s.stallId !== msg.stallId);
          }

          const logEntry = {
            id: `log-${Date.now()}`,
            text: `✅ ${p.name} verified security & restored terminal safety at ${msg.stallName || 'kiosk'}!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'info' as const,
          };
          room.auditLogs.unshift(logEntry);

          broadcastToRoom(info.roomCode, {
            type: 'task:completed',
            playerId: info.playerId,
            tasksCompleted: p.tasksCompleted,
            coins: p.coins,
            stallId: msg.stallId,
            logEntry,
          });
        }
      } else if (msg.type === 'emergency:call') {
        // Player hits the Emergency Fraud Audit Buzzer!
        const info = clientRoomMap.get(ws);
        if (!info) return;
        const room = rooms.get(info.roomCode);
        if (!room) return;

        room.status = 'emergency';
        room.emergencyCaller = info.playerId;
        room.meetingTimeRemaining = 45; // 45 seconds voting

        // Reset votes
        room.players.forEach((p) => {
          p.votedFor = null;
        });

        const caller = room.players.get(info.playerId);
        const callerName = caller ? caller.name : 'Unknown';

        const logEntry = {
          id: `log-${Date.now()}`,
          text: `🚨 EMERGENCY AUDIT CALLED by ${callerName}! All students report to the FamApp Fraud Tribunal!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'alert' as const,
        };
        room.auditLogs.unshift(logEntry);

        broadcastToRoom(info.roomCode, {
          type: 'emergency:started',
          callerId: info.playerId,
          callerName,
          logEntry,
          players: Array.from(room.players.values()),
        });
      } else if (msg.type === 'vote:cast') {
        const info = clientRoomMap.get(ws);
        if (!info) return;
        const room = rooms.get(info.roomCode);
        if (!room) return;

        const voter = room.players.get(info.playerId);
        if (voter) {
          voter.votedFor = msg.targetPlayerId; // null = skip
        }

        // Simulate bot votes
        room.players.forEach((p) => {
          if (p.isBot && p.votedFor === null) {
            const candidates = Array.from(room.players.keys());
            p.votedFor = candidates[Math.floor(Math.random() * candidates.length)];
          }
        });

        // Check if all alive players voted
        const allVoted = Array.from(room.players.values()).every((p) => p.votedFor !== null);

        broadcastToRoom(info.roomCode, {
          type: 'vote:update',
          voterId: info.playerId,
          targetPlayerId: msg.targetPlayerId,
        });

        if (allVoted || msg.forceTally) {
          // Tally votes
          const voteCounts = new Map<string, number>();
          room.players.forEach((p) => {
            if (p.votedFor && p.votedFor !== 'skip') {
              voteCounts.set(p.votedFor, (voteCounts.get(p.votedFor) || 0) + 1);
            }
          });

          let maxVotes = 0;
          let ejectedId: string | null = null;
          voteCounts.forEach((count, pid) => {
            if (count > maxVotes) {
              maxVotes = count;
              ejectedId = pid;
            }
          });

          const ejectedPlayer = ejectedId ? room.players.get(ejectedId) : null;
          const wasScammer = ejectedPlayer ? ejectedPlayer.role === 'scammer' : false;

          let winner: 'savers' | 'scammer' | null = null;
          if (wasScammer) {
            winner = 'savers';
          }

          room.status = 'playing';

          broadcastToRoom(info.roomCode, {
            type: 'vote:result',
            ejectedId,
            ejectedName: ejectedPlayer ? ejectedPlayer.name : 'Nobody (Skipped)',
            wasScammer,
            winner,
          });
        }
      } else if (msg.type === 'chat:send') {
        const info = clientRoomMap.get(ws);
        if (!info) return;
        broadcastToRoom(info.roomCode, {
          type: 'chat:message',
          id: `msg-${Date.now()}`,
          senderId: info.playerId,
          senderName: msg.senderName,
          text: msg.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    const info = clientRoomMap.get(ws);
    if (info) {
      const room = rooms.get(info.roomCode);
      if (room) {
        room.players.delete(info.playerId);
        broadcastToRoom(info.roomCode, {
          type: 'player:left',
          id: info.playerId,
        });
      }
      clientRoomMap.delete(ws);
    }
  });
});

// Production or Vite development integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev, load Vite's dev server and mount as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FamFest 3D Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
