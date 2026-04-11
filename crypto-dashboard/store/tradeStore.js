// store/tradeStore.js
// Estado global da aplicação via Zustand.
// Gerencia: histórico de sugestões, modal ativo, loading de execução.
// persist() salva o histórico no localStorage do navegador.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTradeStore = create(
  persist(
    (set, get) => ({
      // ── Histórico das últimas 10 sugestões ──────────────────────────────────
      history: [],  // [{ id, symbol, side, entry, sl, tp, timestamp, status, indicators }]

      addToHistory: (suggestion) => {
        const history = get().history;
        const newEntry = {
          id:         Date.now(),
          ...suggestion,
          timestamp:  new Date().toISOString(),
          status:     'pending',  // 'pending' | 'executed' | 'cancelled'
        };
        set({ history: [newEntry, ...history].slice(0, 10) });
        return newEntry.id;
      },

      updateStatus: (id, status) => {
        set(state => ({
          history: state.history.map(h =>
            h.id === id ? { ...h, status } : h
          ),
        }));
      },

      // ── Modal ────────────────────────────────────────────────────────────────
      modal: null,   // null | { symbol, side, entry, sl, tp, qty, reasons }

      openModal:  (data) => set({ modal: data }),
      closeModal: ()     => set({ modal: null }),

      // ── Loading de execução ──────────────────────────────────────────────────
      executing: false,
      setExecuting: (v) => set({ executing: v }),

      // ── Erro de execução ─────────────────────────────────────────────────────
      execError: null,
      setExecError: (e) => set({ execError: e }),
    }),
    {
      name: 'cryptodesk-store',  // chave no localStorage
      partialize: (state) => ({ history: state.history }),  // só persiste histórico
    }
  )
);