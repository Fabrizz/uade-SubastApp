import { API_BASE } from '@/lib/api';
import { Client, IMessage } from '@stomp/stompjs';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export const WsNotificationTypeObj = {
  warning: 'warning',
  success: 'success',
  info: 'info',
  category_update: 'category_update',
} as const;

export type WsNotificationType = typeof WsNotificationTypeObj[keyof typeof WsNotificationTypeObj];

// Field names must match the Spring Boot notification DTO
export type WsNotification = {
  id: number | string;
  type: WsNotificationType;
  title: string;
  description: string;
  createdAt: string; // ISO 8601
};

interface WebSocketContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  notifications: WsNotification[];
  removeNotification: (id: number | string) => void;
  clearNotifications: () => void;
}

// Converts http(s):// → ws(s):// and appends the native (non-SockJS) STOMP endpoint
const WS_URL = API_BASE.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/api/v1/ws/native';

// ─── Context ──────────────────────────────────────────────────────────────────

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, refreshUser } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    let connectionTimeout: ReturnType<typeof setTimeout>;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      // React Native: WebSocket omits the NULL byte at the end of STOMP frames
      appendMissingNULLonIncoming: true,
      forceBinaryWSFrames: true,
      onConnect: () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        client.subscribe('/user/queue/notificaciones', (msg: IMessage) => {
          try {
            const notif: WsNotification = JSON.parse(msg.body);
            setNotifications((prev) => [notif, ...prev]);
            if (notif.type === WsNotificationTypeObj.category_update) {
              refreshUser();
            }
          } catch {
            // malformed message — ignore
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsConnecting(false);
      },
      onStompError: (frame) => {
        clearTimeout(connectionTimeout);
        const msg = frame.headers?.message ?? 'Error de conexión STOMP';
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(msg);
      },
      onWebSocketError: (evt) => {
        clearTimeout(connectionTimeout);
        const e = evt as any;
        const msg = e.reason || e.message || `WebSocket cerrado (código ${e.code ?? '?'})`;
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(msg || 'No se pudo conectar al servidor');
      },
    });

    client.activate();
    clientRef.current = client;

    connectionTimeout = setTimeout(() => {
      if (!clientRef.current?.connected) {
        setIsConnecting(false);
        setConnectionError('Timeout: el servidor no respondió');
        client.deactivate();
      }
    }, 10000);

    return () => {
      clearTimeout(connectionTimeout);
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [isAuthenticated, token]);

  const removeNotification = useCallback((id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <WebSocketContext.Provider value={{ isConnected, isConnecting, connectionError, notifications, removeNotification, clearNotifications }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
  return ctx;
}
