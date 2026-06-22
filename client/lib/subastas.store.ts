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
  finalizada: boolean;

  isLoading: boolean;
  isPlacingBid: boolean;
  error: string | null;

  joinSubasta: (subastaId: number, token: string, clienteId: number, subscribe: SubscribeFn) => Promise<void>;
  checkAsistencia: (subastaId: number, token: string, clienteId: number, subscribe: SubscribeFn) => Promise<void>;
  checkAsistenciaActual: (token: string, clienteId: number, subscribe: SubscribeFn) => Promise<void>;
  leaveSubasta: (token?: string) => Promise<void>;
  placePuja: (importe: number, token: string) => Promise<void>;
  setItemActual: (item: ItemCatalogoResponse) => void;
  clearError: () => void;

  // internal — not meant to be consumed by components
  _unsubscribe: (() => void) | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

/**
 * Fetches subasta details, catalog and current bids, subscribes to the live topics,
 * and writes everything into the store. Shared by joinSubasta (after registering) and
 * checkAsistencia (when an active asistencia already exists server-side).
 */
type SetSubastaStore = (
  partial: Partial<SubastaStore> | ((s: SubastaStore) => Partial<SubastaStore>),
) => void;

/**
 * Re-fetches subasta + catalog + bids for the current item and writes them into the store.
 * Used whenever the server advances the auction (SUBASTA_INICIADA / ITEM_SUBASTADO / ITEM_SIGUIENTE):
 * re-fetching the subasta brings the updated itemActualId / inicioItemActualTs / finItemActualTs,
 * so the per-item countdown resets on its own. The current item is chosen by the server's
 * itemActualId, falling back to the first not-yet-auctioned item.
 */
async function refetchEstadoSubasta(
  set: SetSubastaStore,
  subastaId: number,
  token: string,
): Promise<void> {
  const { data: subasta } = await api.GET('/api/v1/subastas/{id}', {
    params: { path: { id: subastaId } },
    headers: authHeaders(token),
  });

  const { data: catalogoPage } = await api.GET('/api/v1/subastas/{id}/catalogo/items', {
    params: {
      path: { id: subastaId },
      query: { pageable: {} },
    },
    headers: authHeaders(token),
  });
  const catalogo = (catalogoPage as any)?.content ?? catalogoPage ?? [];
  const itemActual =
    (subasta?.itemActualId
      ? (catalogo as ItemCatalogoResponse[]).find((i) => i.identificador === subasta.itemActualId)
      : undefined)
    ?? (catalogo as ItemCatalogoResponse[]).find((i) => !i.subastado)
    ?? (catalogo as ItemCatalogoResponse[])[0]
    ?? null;

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

  set({
    ...(subasta ? { subasta } : {}),
    catalogo,
    itemActual,
    mejorPuja,
    pujas,
  });
}

async function enterSubasta(
  set: SetSubastaStore,
  subastaId: number,
  token: string,
  asistente: AsistenteResponse,
  subscribe: SubscribeFn,
): Promise<void> {
  const { data: subasta, error: eSubasta } = await api.GET('/api/v1/subastas/{id}', {
    params: { path: { id: subastaId } },
    headers: authHeaders(token),
  });
  if (eSubasta || !subasta) throw new Error('No se pudo obtener la subasta');

  const { data: catalogoPage } = await api.GET('/api/v1/subastas/{id}/catalogo/items', {
    params: {
      path: { id: subastaId },
      query: { pageable: {} }
    },
    headers: authHeaders(token),
  });
  const catalogo = (catalogoPage as any)?.content ?? catalogoPage ?? [];
  const itemActual =
    (subasta.itemActualId
      ? (catalogo as ItemCatalogoResponse[]).find((i) => i.identificador === subasta.itemActualId)
      : undefined)
    ?? (catalogo as ItemCatalogoResponse[]).find((i) => i.subastado !== 'si')
    ?? (catalogo as ItemCatalogoResponse[])[0]
    ?? null;

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

  // Subscribe to live bids
  const unsubBids = subscribe(`/topic/subastas/${subastaId}/pujas`, (msg: IMessage) => {
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

  // Subscribe to subasta events (auction start, item advancement, auction end)
  const unsubProgression = subscribe(`/topic/subastas/${subastaId}`, async (msg: IMessage) => {
    try {
      const event = JSON.parse(msg.body);
      switch (event.tipo) {
        // The auction was started, an item advanced (auto or manual), or the current
        // item closed — re-sync subasta/catalog/bids. The per-item countdown resets on
        // its own because the re-fetched subasta carries fresh timestamps.
        case 'SUBASTA_INICIADA':
        case 'ITEM_SUBASTADO':
        case 'ITEM_SIGUIENTE':
          await refetchEstadoSubasta(set, subastaId, token);
          break;
        // The scheduler closed the auction automatically. Keep `subasta` so the screen
        // can show a closing state, but drop the live item and flag it as finished.
        case 'SUBASTA_FINALIZADA':
          set({ finalizada: true, itemActual: null });
          break;
        default:
          break;
      }
    } catch {
      // malformed frame or API error — ignore
    }
  });

  set({
    subasta,
    asistente,
    catalogo,
    itemActual,
    mejorPuja,
    pujas,
    finalizada: false,
    _unsubscribe: () => {
      unsubBids();
      unsubProgression();
    },
  });
}

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
  finalizada: false,
  isLoading: false,
  isPlacingBid: false,
  error: null,
  _unsubscribe: null,

  joinSubasta: async (subastaId, token, clienteId, subscribe) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Get latest active session from the server to prevent desync
      const { data: activeAsistente } = await api.GET('/api/v1/clientes/{id}/asistencia-actual', {
        params: { path: { id: clienteId } },
        headers: authHeaders(token),
      });

      // 2. If we are in another subasta (either locally or on the server), leave it first
      const currentActiveSubastaId = activeAsistente?.subastaId || get().subasta?.identificador;
      const currentActiveAsistenteId = activeAsistente?.identificador || get().asistente?.identificador;

      if (currentActiveSubastaId && currentActiveSubastaId !== subastaId) {
        // Unsubscribe from local WS
        get()._unsubscribe?.();
        // Clear local state
        set({
          subasta: null,
          catalogo: [],
          itemActual: null,
          mejorPuja: 0,
          pujas: [],
          asistente: null,
          finalizada: false,
          _unsubscribe: null,
        });

        // Delete the attendance on the server
        if (currentActiveAsistenteId) {
          try {
            await api.DELETE('/api/v1/subastas/{id}/asistentes/{idAsistente}', {
              params: { path: { id: currentActiveSubastaId, idAsistente: currentActiveAsistenteId } },
              headers: authHeaders(token),
            });
          } catch {
            // best-effort
          }
        }
      } else {
        // Just clear the local subasta state if it's different, without deleting on server
        if (get().subasta?.identificador !== subastaId) {
          await get().leaveSubasta(); // call leaveSubasta without token so it doesn't delete on server
        }
      }

      // 3. Register as attendee
      const { data: asistente, error: eAsistente } = await api.POST('/api/v1/subastas/{id}/asistentes', {
        params: { path: { id: subastaId } },
        headers: authHeaders(token),
        body: { clienteId },
      });
      if (eAsistente || !asistente) {
        const errorMsg = (eAsistente as any)?.mensaje || 'No se pudo unir a la subasta';
        throw new Error(errorMsg);
      }

      await enterSubasta(set, subastaId, token, asistente, subscribe);
      set({ isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e.message ?? 'Error al unirse a la subasta' });
    }
  },

  // Checks whether the client already has an active asistencia for this subasta
  // (e.g. after an app restart) and rehydrates the session without re-registering.
  checkAsistencia: async (subastaId, token, clienteId, subscribe) => {
    if (get().subasta?.identificador === subastaId) return;

    const { data: asistente } = await api.GET('/api/v1/subastas/{id}/asistentes/{idCliente}', {
      params: { path: { id: subastaId, idCliente: clienteId } },
      headers: authHeaders(token),
    });
    if (!asistente) return; // no active asistencia — stay in preview mode

    await get().leaveSubasta(token);
    try {
      await enterSubasta(set, subastaId, token, asistente, subscribe);
    } catch {
      // couldn't rehydrate — leave the user in preview mode, no error surfaced
    }
  },

  // Discovers whether the client has an active asistencia in ANY subasta — no subastaId
  // needed upfront. Used app-wide on login/app start so global UI (e.g. the tab bar banner)
  // reflects an existing session without requiring the user to open that auction screen first.
  checkAsistenciaActual: async (token, clienteId, subscribe) => {
    const { data: asistente } = await api.GET('/api/v1/clientes/{id}/asistencia-actual', {
      params: { path: { id: clienteId } },
      headers: authHeaders(token),
    });
    if (!asistente?.subastaId) return; // no active asistencia anywhere

    if (get().subasta?.identificador === asistente.subastaId) return;

    await get().leaveSubasta(token);
    try {
      await enterSubasta(set, asistente.subastaId, token, asistente, subscribe);
    } catch {
      // couldn't rehydrate — leave the user in preview mode, no error surfaced
    }
  },

  leaveSubasta: async (token) => {
    const { _unsubscribe, asistente, subasta } = get();
    _unsubscribe?.();
    set({
      subasta: null,
      catalogo: [],
      itemActual: null,
      mejorPuja: 0,
      pujas: [],
      asistente: null,
      finalizada: false,
      error: null,
      _unsubscribe: null,
    });

    // Tell the backend too — otherwise the server still thinks the client is an active
    // attendee, which blocks joining a different subasta and leaves stale asistencia rows.
    if (token && asistente?.identificador && subasta?.identificador) {
      try {
        await api.DELETE('/api/v1/subastas/{id}/asistentes/{idAsistente}', {
          params: { path: { id: subasta.identificador, idAsistente: asistente.identificador } },
          headers: authHeaders(token),
        });
      } catch {
        // best-effort — local state is already cleared regardless
      }
    }
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
      if (ePuja) {
        const errorMsg = (ePuja as any)?.mensaje || 'Puja rechazada por el servidor';
        throw new Error(errorMsg);
      }
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
