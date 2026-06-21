import { API_BASE } from '@/lib/api';
import { useNotificacionesStore, WsNotification, WsNotificationTypeObj } from '@/lib/notificaciones.store';
import { useSubastaStore } from '@/lib/subastas.store';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebSocketContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  subscribeToTopic: (topic: string, callback: (msg: IMessage) => void) => () => void;
}

// Converts http(s):// → ws(s):// and appends the native (non-SockJS) STOMP endpoint
const WS_URL = API_BASE.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/api/v1/ws/native';

// ─── Context ──────────────────────────────────────────────────────────────────

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, refreshUser } = useAuth();
  const clientRef = useRef<Client | null>(null);
  // topic → callback: persists across reconnects so we can re-subscribe automatically
  const topicCallbacksRef = useRef<Map<string, (msg: IMessage) => void>>(new Map());
  // topic → StompSubscription: needed to unsubscribe while connected
  const stompSubsRef = useRef<Map<string, StompSubscription>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      topicCallbacksRef.current.clear();
      stompSubsRef.current.clear();
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
            useNotificacionesStore.getState().addNotification(notif);
            if (notif.type === WsNotificationTypeObj.category_update) {
              refreshUser();
              // The category change may have made the backend kick us out of the subasta
              // we were in (see ClienteService/CategoriaService) — drop the local session
              // too so the auction screen falls back to preview mode immediately.
              if (useSubastaStore.getState().subasta) {
                useSubastaStore.getState().leaveSubasta(token);
              }
            }
          } catch {
            // malformed message — ignore
          }
        });
        // Re-subscribe to any topics registered before/during reconnect
        topicCallbacksRef.current.forEach((cb, topic) => {
          const sub = client.subscribe(topic, cb);
          stompSubsRef.current.set(topic, sub);
        });
      },
      onDisconnect: () => {
        stompSubsRef.current.clear(); // handles are gone; re-created in onConnect on reconnect
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

  const subscribeToTopic = useCallback((topic: string, callback: (msg: IMessage) => void) => {
    topicCallbacksRef.current.set(topic, callback);
    if (clientRef.current?.connected) {
      const sub = clientRef.current.subscribe(topic, callback);
      stompSubsRef.current.set(topic, sub);
    }
    return () => {
      topicCallbacksRef.current.delete(topic);
      const sub = stompSubsRef.current.get(topic);
      if (sub) {
        sub.unsubscribe();
        stompSubsRef.current.delete(topic);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, isConnecting, connectionError, subscribeToTopic }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
  return ctx;
}
