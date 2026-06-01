import { API_BASE } from '@/lib/api';
import { Client, IMessage } from '@stomp/stompjs';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

// Field names must match the Spring Boot notification DTO
export type WsNotification = {
  id: number | string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  createdAt: string; // ISO 8601
};

interface WebSocketContextValue {
  isConnected: boolean;
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
  const { token, isAuthenticated } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      return;
    }

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        setConnectionError(null);
        client.subscribe('/user/queue/notificaciones', (msg: IMessage) => {
          try {
            const notif: WsNotification = JSON.parse(msg.body);
            setNotifications((prev) => [notif, ...prev]);
          } catch {
            // malformed message — ignore
          }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        setIsConnected(false);
        setConnectionError(frame.headers?.message ?? 'Error de conexión STOMP');
      },
      onWebSocketError: () => {
        setIsConnected(false);
        setConnectionError('No se pudo conectar al servidor');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  const removeNotification = useCallback((id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <WebSocketContext.Provider value={{ isConnected, connectionError, notifications, removeNotification, clearNotifications }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
  return ctx;
}
