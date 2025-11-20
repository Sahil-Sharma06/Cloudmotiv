/**
 * Highlight data structure representing a text match in the PDF
 */
export interface Highlight {
  id: string
  phrase: string
  pageIndex: number
  rects: HighlightRect[]
  color?: string
}

/**
 * Bounding rectangle for a highlighted area
 */
export interface HighlightRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Reference data linking analysis text to PDF locations
 */
export interface Reference {
  id: string
  label: string
  phrase: string
  pageHint?: number // Optional hint for which page to search
  description?: string
}

/**
 * PDF page text content with positional data
 */
export interface PageTextContent {
  pageIndex: number
  text: string
  items: TextItem[]
}

/**
 * Individual text item from PDF.js text layer
 */
export interface TextItem {
  str: string
  transform: number[]
  width: number
  height: number
  hasEOL?: boolean
}

/**
 * Application state for the highlight store
 */
export interface HighlightState {
  highlights: Highlight[]
  activeReferenceId: string | null
  setActiveReference: (id: string | null) => void
  addHighlight: (highlight: Highlight) => void
  clearHighlights: () => void
  removeHighlight: (id: string) => void
}

/**
 * PDF viewer state
 */
export interface PdfViewerState {
  numPages: number
  currentPage: number
  scale: number
  setNumPages: (num: number) => void
  setCurrentPage: (page: number) => void
  setScale: (scale: number) => void
  zoomIn: () => void
  zoomOut: () => void
}
