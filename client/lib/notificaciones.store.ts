import { api } from "@/lib/api";
import { create } from "zustand";

export const WsNotificationTypeObj = {
  warning: "warning",
  success: "success",
  info: "info",
  category_update: "category_update",
  pujo_update: "pujo_update",
} as const;

export type WsNotificationType = typeof WsNotificationTypeObj[keyof typeof WsNotificationTypeObj];

// Field names must match the Spring Boot WS notification payload (WsNotificacionService.WsPayload)
export type WsNotification = {
  id: number | string;
  type: WsNotificationType;
  title: string;
  description: string;
  createdAt: string; // ISO 8601
};

// Best-effort mapping from the free-form persisted `Notificacion.tipo` (used server-side for
// filtering, e.g. "puja"/"pago"/"envio") to the WS envelope type used for icon/color on the
// client. Not 1:1 — the backend reuses "subasta" for both info and warning pushes — so this is
// only used to pick a reasonable icon for notification HISTORY, not for live pushes (which
// already carry the real type).
const TIPO_TO_WS_TYPE: Record<string, WsNotificationType> = {
  categoria: "category_update",
  puja: "pujo_update",
  pago: "success",
  multa: "warning",
  envio: "info",
  subasta: "info",
};

interface NotificacionesStore {
  notifications: WsNotification[];
  loaded: boolean;
  addNotification: (notif: WsNotification) => void;
  removeNotification: (id: number | string) => void;
  clearNotifications: () => void;
  fetchRecientes: (token: string, personaId: number) => Promise<void>;
}

export const useNotificacionesStore = create<NotificacionesStore>((set) => ({
  notifications: [],
  loaded: false,

  addNotification: (notif) => set((s) => ({ notifications: [notif, ...s.notifications] })),

  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  clearNotifications: () => set({ notifications: [], loaded: false }),

  // Last 20 persisted notifications for the logged-in persona, used to seed history on
  // login/app start (live pushes via WS take over from there).
  fetchRecientes: async (token, personaId) => {
    try {
      const { data } = await api.GET("/api/v1/notificaciones", {
        params: {
          query: {
            destinatarioId: personaId,
            pageable: { page: 0, size: 20, sort: ["fecha,desc"] },
          },
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const content = data?.content ?? [];
      const mapped: WsNotification[] = content.map((n) => ({
        id: n.identificador ?? `${n.titulo}-${n.fecha}`,
        type: TIPO_TO_WS_TYPE[n.tipo ?? ""] ?? "info",
        title: n.titulo ?? "",
        description: n.descripcion ?? "",
        createdAt: n.fecha ?? new Date().toISOString(),
      }));
      set({ notifications: mapped, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
