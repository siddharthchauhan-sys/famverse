/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RemotePlayer, Sabotage, AuditLog } from '../types';

export interface MultiplayerCallbacks {
  onInit: (data: {
    players: RemotePlayer[];
    sabotages: Sabotage[];
    auditLogs: AuditLog[];
    role: 'saver' | 'scammer';
    roomCode: string;
  }) => void;
  onPlayerJoined: (player: RemotePlayer) => void;
  onPlayerMoved: (data: {
    id: string;
    position: [number, number, number];
    rotationY: number;
    isMoving: boolean;
    speed: number;
    isHoverboard: boolean;
  }) => void;
  onPlayerLeft: (id: string) => void;
  onSabotageCreated: (sabotage: Sabotage, logEntry: AuditLog) => void;
  onTaskCompleted: (data: {
    playerId: string;
    tasksCompleted: number;
    coins: number;
    stallId?: string;
    logEntry: AuditLog;
  }) => void;
  onEmergencyStarted: (data: {
    callerId: string;
    callerName: string;
    logEntry: AuditLog;
    players: RemotePlayer[];
  }) => void;
  onVoteUpdate: (voterId: string, targetPlayerId: string | null) => void;
  onVoteResult: (data: {
    ejectedId: string | null;
    ejectedName: string;
    wasScammer: boolean;
    winner: 'savers' | 'scammer' | null;
  }) => void;
  onRoleAssigned: (role: 'saver' | 'scammer') => void;
  onChatMessage: (msg: { id: string; senderName: string; text: string; time: string }) => void;
  onVictimRobbed: (data: { stolenCoins: number; stolenCouponsCount: number; time: string }) => void;
  onRobberSuccess: (data: { victimName: string; stolenCoins: number }) => void;
  onAuditLog: (logEntry: AuditLog) => void;
}

export class MultiplayerService {
  private ws: WebSocket | null = null;
  private callbacks: MultiplayerCallbacks | null = null;
  private isConnected: boolean = false;
  private lastMoveEmitTime: number = 0;
  private reconnectTimer: number | null = null;
  private roomCode: string = 'CAMPUS-FAM';
  private playerCache: Partial<RemotePlayer> = {};

  public connect(roomCode: string, player: Partial<RemotePlayer>, callbacks: MultiplayerCallbacks) {
    this.roomCode = roomCode;
    this.playerCache = player;
    this.callbacks = callbacks;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.ws?.send(
          JSON.stringify({
            type: 'join',
            roomCode: this.roomCode,
            player: this.playerCache,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Auto-reconnect after 2s
        if (!this.reconnectTimer) {
          this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            if (this.callbacks) {
              this.connect(this.roomCode, this.playerCache, this.callbacks);
            }
          }, 2000);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      console.warn('WebSocket connection not ready, running in local mode:', e);
    }
  }

  private handleMessage(msg: Record<string, unknown>) {
    if (!this.callbacks) return;

    switch (msg.type) {
      case 'init':
        this.callbacks.onInit({
          players: msg.players as RemotePlayer[],
          sabotages: msg.sabotages as Sabotage[],
          auditLogs: msg.auditLogs as AuditLog[],
          role: msg.role as 'saver' | 'scammer',
          roomCode: msg.roomCode as string,
        });
        break;
      case 'player:joined':
        this.callbacks.onPlayerJoined(msg.player as RemotePlayer);
        break;
      case 'player:moved':
        this.callbacks.onPlayerMoved(msg as unknown as {
          id: string;
          position: [number, number, number];
          rotationY: number;
          isMoving: boolean;
          speed: number;
          isHoverboard: boolean;
        });
        break;
      case 'player:left':
        this.callbacks.onPlayerLeft(msg.id as string);
        break;
      case 'sabotage:created':
        this.callbacks.onSabotageCreated(msg.sabotage as Sabotage, msg.logEntry as AuditLog);
        break;
      case 'task:completed':
        this.callbacks.onTaskCompleted(msg as unknown as {
          playerId: string;
          tasksCompleted: number;
          coins: number;
          stallId?: string;
          logEntry: AuditLog;
        });
        break;
      case 'emergency:started':
        this.callbacks.onEmergencyStarted(msg as unknown as {
          callerId: string;
          callerName: string;
          logEntry: AuditLog;
          players: RemotePlayer[];
        });
        break;
      case 'vote:update':
        this.callbacks.onVoteUpdate(msg.voterId as string, (msg.targetPlayerId as string) || null);
        break;
      case 'vote:result':
        this.callbacks.onVoteResult(msg as unknown as {
          ejectedId: string | null;
          ejectedName: string;
          wasScammer: boolean;
          winner: 'savers' | 'scammer' | null;
        });
        break;
      case 'role:assigned':
        this.callbacks.onRoleAssigned(msg.role as 'saver' | 'scammer');
        break;
      case 'chat:message':
        this.callbacks.onChatMessage(msg as unknown as {
          id: string;
          senderName: string;
          text: string;
          time: string;
        });
        break;
      case 'victim:robbed':
        this.callbacks.onVictimRobbed(msg as unknown as {
          stolenCoins: number;
          stolenCouponsCount: number;
          time: string;
        });
        break;
      case 'robber:success':
        this.callbacks.onRobberSuccess(msg as unknown as {
          victimName: string;
          stolenCoins: number;
        });
        break;
      case 'audit:log':
        this.callbacks.onAuditLog(msg.logEntry as AuditLog);
        break;
    }
  }

  public robPlayer(victimId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'rob:player',
          victimId,
        })
      );
    }
  }

  private wasMovingLast: boolean = false;

  public sendMovement(
    position: [number, number, number],
    rotationY: number,
    isMoving: boolean,
    speed: number,
    isHoverboard: boolean
  ) {
    const now = performance.now();
    // Throttle to ~30Hz (every 33ms), but ALWAYS send on stop or start
    const stateChanged = isMoving !== this.wasMovingLast;
    if (!stateChanged && now - this.lastMoveEmitTime < 33) return;

    this.lastMoveEmitTime = now;
    this.wasMovingLast = isMoving;

    const payload = {
      type: 'player:move',
      position,
      rotationY,
      isMoving,
      speed,
      isHoverboard,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else if (stateChanged && this.playerCache.id) {
      // HTTP fallback for key state transitions if socket is buffering
      fetch(`/api/room/${this.roomCode}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: this.playerCache.id,
          ...payload,
        }),
      }).catch(() => {});
    }
  }

  public sendSabotage(stallId: string, stallName: string, sabotageType: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'scam:commit',
          stallId,
          stallName,
          sabotageType,
        })
      );
    }
  }

  public sendCompleteTask(stallId?: string, stallName?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'task:complete',
          stallId,
          stallName,
        })
      );
    }
  }

  public callEmergency() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'emergency:call',
        })
      );
    }
  }

  public castVote(targetPlayerId: string | null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'vote:cast',
          targetPlayerId,
        })
      );
    }
  }

  public sendChatMessage(senderName: string, text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'chat:send',
          senderName,
          text,
        })
      );
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const multiplayerService = new MultiplayerService();
