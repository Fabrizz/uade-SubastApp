import { api } from '@/lib/api';
import type { components } from '@/types/api';
import type { IMessage } from '@stomp/stompjs';
import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubastaResponse = components['schemas']['SubastaResponse'];
type ItemCatalogoResponse = components['schemas']['ItemCatalogoResponse'];
type AsistenteResponse = components['schemas']['AsistenteResponse'];
type PujoResponse = components['schemas']['PujoResponse'];

type SubscribeFn = (topic: string, cb: (msg: IMessage) => void) => () => void;

// ─── Store shape ──────────────────────────────────────────────────────────────

interface SubastaStore {
  subasta: SubastaResponse | null;
  catalogo: ItemCatalogoResponse[];
  itemActual: ItemCatalogoResponse | null;
  mejorPuja: number;
  pujas: PujoResponse[];
  asistente: AsistenteResponse | null;

  isLoading: boolean;
  isPlacingBid: boolean;
  error: string | null;

  joinSubasta: (subastaId: number, token: string, clienteId: number, subscribe: SubscribeFn) => Promise<void>;
  leaveSubasta: () => void;
  placePuja: (importe: number, token: string) => Promise<void>;
  setItemActual: (item: ItemCatalogoResponse) => void;
  clearError: () => void;

  // internal — not meant to be consumed by components
  _unsubscribe: (() => void) | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

/**
 * Returns min/max bid bounds per TPO rules.
 * max is null for oro/platino auctions (no upper limit).
 */
export function getBidBounds(
  precioBase: number,
  mejorPuja: number,
  categoriaSubasta: SubastaResponse['categoria'],
): { min: number; max: number | null } {
  const min = mejorPuja + precioBase * 0.01;
  const noUpperLimit = categoriaSubasta === 'oro' || categoriaSubasta === 'platino';
  return { min, max: noUpperLimit ? null : mejorPuja + precioBase * 0.2 };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSubastaStore = create<SubastaStore>((set, get) => ({
  subasta: null,
  catalogo: [],
  itemActual: null,
  mejorPuja: 0,
  pujas: [],
  asistente: null,
  isLoading: false,
  isPlacingBid: false,
  error: null,
  _unsubscribe: null,

  joinSubasta: async (subastaId, token, clienteId, subscribe) => {
    get().leaveSubasta();
    set({ isLoading: true, error: null });

    try {
      // 1. Auction details
      const { data: subasta, error: eSubasta } = await api.GET('/api/v1/subastas/{id}', {
        params: { path: { id: subastaId } },
        headers: authHeaders(token),
      });
      if (eSubasta || !subasta) throw new Error('No se pudo obtener la subasta');

      // 2. Register as attendee (idempotent — backend returns existing record if already joined)
      const { data: asistente } = await api.POST('/api/v1/subastas/{id}/asistentes', {
        params: { path: { id: subastaId } },
        headers: authHeaders(token),
        body: { clienteId },
      });

      // 3. Catalog
      const { data: catalogoPage } = await api.GET('/api/v1/subastas/{id}/catalogo/items', {
        params: { path: { id: subastaId }, query: { size: 100 } },
        headers: authHeaders(token),
      });
      const catalogo = (catalogoPage as any)?.content ?? catalogoPage ?? [];
      const itemActual = (catalogo as ItemCatalogoResponse[]).find((i) => !i.subastado)
        ?? (catalogo as ItemCatalogoResponse[])[0]
        ?? null;

      // 4. Current bids for active item
      let mejorPuja = itemActual?.precioBase ?? 0;
      let pujas: PujoResponse[] = [];
      if (itemActual?.identificador) {
        const { data: pujasData } = await api.GET(
          '/api/v1/subastas/{id}/catalogo/items/{idItem}/pujos',
          {
            params: { path: { id: subastaId, idItem: itemActual.identificador } },
            headers: authHeaders(token),
          },
        );
        pujas = (Array.isArray(pujasData) ? pujasData : (pujasData as any)?.content ?? []) as PujoResponse[];
        const top = pujas.reduce((max, p) => Math.max(max, p.importe ?? 0), 0);
        if (top > 0) mejorPuja = top;
      }

      // 5. Subscribe to live bids
      const unsubscribe = subscribe(`/topic/subastas/${subastaId}/pujas`, (msg: IMessage) => {
        try {
          const puja: PujoResponse = JSON.parse(msg.body);
          set((s) => ({
            pujas: [puja, ...s.pujas],
            mejorPuja: Math.max(s.mejorPuja, puja.importe ?? 0),
          }));
        } catch {
          // malformed frame — ignore
        }
      });

      set({ subasta, asistente: asistente ?? null, catalogo, itemActual, mejorPuja, pujas, isLoading: false, _unsubscribe: unsubscribe });
    } catch (e: any) {
      set({ isLoading: false, error: e.message ?? 'Error al unirse a la subasta' });
    }
  },

  leaveSubasta: () => {
    get()._unsubscribe?.();
    set({
      subasta: null,
      catalogo: [],
      itemActual: null,
      mejorPuja: 0,
      pujas: [],
      asistente: null,
      error: null,
      _unsubscribe: null,
    });
  },

  placePuja: async (importe, token) => {
    const { subasta, itemActual, asistente } = get();
    if (!subasta?.identificador || !itemActual?.identificador || !asistente?.identificador) {
      set({ error: 'No estás en una subasta activa' });
      return;
    }
    set({ isPlacingBid: true, error: null });
    try {
      const { error: ePuja } = await api.POST(
        '/api/v1/subastas/{id}/catalogo/items/{idItem}/pujos',
        {
          params: { path: { id: subasta.identificador, idItem: itemActual.identificador } },
          headers: authHeaders(token),
          body: { asistenteId: asistente.identificador, importe },
        },
      );
      if (ePuja) throw new Error('Puja rechazada por el servidor');
      // WS broadcast will update mejorPuja + pujas list automatically
    } catch (e: any) {
      set({ error: e.message ?? 'No se pudo realizar la puja' });
    } finally {
      set({ isPlacingBid: false });
    }
  },

  setItemActual: (item) => set({ itemActual: item }),

  clearError: () => set({ error: null }),
}));
