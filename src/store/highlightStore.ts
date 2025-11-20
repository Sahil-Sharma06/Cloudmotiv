import { create } from 'zustand'
import type { HighlightState, Highlight } from '../types'

/**
 * Global state store for managing PDF highlights
 * Uses Zustand for simple, performant state management
 */
export const useHighlightStore = create<HighlightState>((set) => ({
  highlights: [],
  activeReferenceId: null,

  setActiveReference: (id: string | null) => set({ activeReferenceId: id }),

  addHighlight: (highlight: Highlight) =>
    set((state) => ({
      highlights: [...state.highlights.filter((h) => h.id !== highlight.id), highlight],
      activeReferenceId: highlight.id,
    })),

  clearHighlights: () => set({ highlights: [], activeReferenceId: null }),

  removeHighlight: (id: string) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
      activeReferenceId: state.activeReferenceId === id ? null : state.activeReferenceId,
    })),
}))
