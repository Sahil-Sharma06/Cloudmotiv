import { create } from 'zustand'
import type { PdfViewerState } from '../types'

const MIN_SCALE = 0.5
const MAX_SCALE = 3.0
const SCALE_STEP = 0.25

/**
 * Global state store for PDF viewer controls
 */
export const usePdfViewerStore = create<PdfViewerState>((set) => ({
  numPages: 0,
  currentPage: 1,
  scale: 1.2,

  setNumPages: (num: number) => set({ numPages: num }),

  setCurrentPage: (page: number) =>
    set((state) => ({
      currentPage: Math.max(1, Math.min(page, state.numPages)),
    })),

  setScale: (scale: number) => set({ scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale)) }),

  zoomIn: () =>
    set((state) => ({
      scale: Math.min(MAX_SCALE, state.scale + SCALE_STEP),
    })),

  zoomOut: () =>
    set((state) => ({
      scale: Math.max(MIN_SCALE, state.scale - SCALE_STEP),
    })),
}))
