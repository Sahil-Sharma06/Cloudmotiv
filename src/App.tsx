import { useState, useRef } from 'react'
import { PdfViewer } from './components/PdfViewer'
import { RightPanel } from './components/RightPanel'
import { useHighlightStore } from './store/highlightStore'
import { HighlightManager } from './utils/HighlightManager'
import { getPageTextContents } from './utils/pdfHelpers'
import { REFERENCES, ANALYSIS_TEXT, DEFAULT_PDF_PATH } from './data/references'
import type { Reference } from './types'

/**
 * App - Main application component
 *
 * Implements the two-panel layout:
 * - Left: PDF viewer with highlight capability
 * - Right: Analysis text with clickable references
 *
 * Coordinates highlight state between panels via Zustand store
 */
function App() {
  const [pdfUrl] = useState(DEFAULT_PDF_PATH)
  const [isReady, setIsReady] = useState(false)
  const viewerContainerRef = useRef<HTMLDivElement>(null)
  const { addHighlight } = useHighlightStore()

  /**
   * Handle reference click from right panel
   * Searches PDF for the phrase and creates a highlight
   */
  const handleReferenceClick = async (reference: Reference) => {
    if (!isReady || !viewerContainerRef.current) {
      console.warn('PDF not ready for highlighting')
      return
    }

    // Get page text contents from the viewer
    const pageContents = getPageTextContents(viewerContainerRef.current)

    if (pageContents.length === 0) {
      console.error('No page text contents available')
      return
    }

    // Find and highlight the phrase
    const highlight = await HighlightManager.findPhrase(
      reference.phrase,
      reference.id,
      pageContents,
      reference.pageHint ? reference.pageHint - 1 : undefined // Convert to 0-indexed
    )

    if (highlight) {
      addHighlight(highlight)

      // Scroll to the highlighted page
      const pageElement = viewerContainerRef.current.querySelector(
        `[data-page-number="${highlight.pageIndex + 1}"]`
      )
      if (pageElement) {
        setTimeout(() => {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    } else {
      const message =
        `Could not find a good match for "${reference.phrase}" in the PDF.\n\n` +
        `This could mean:\n` +
        `- The text appears differently in the PDF\n` +
        `- The text is split across multiple lines\n` +
        `- The reference phrase needs to be updated\n\n` +
        `Check the browser console for search details.`
      alert(message)
    }
  }

  const handlePdfReady = () => {
    setIsReady(true)

    // Debug: Log page contents to help find correct phrases
    if (viewerContainerRef.current) {
      const pageContents = getPageTextContents(viewerContainerRef.current)
      console.log('=== PDF TEXT CONTENT DEBUG ===')
      pageContents.forEach((content, index) => {
        console.log(`\n--- Page ${index + 1} ---`)
        console.log(content.text.substring(0, 500)) // First 500 chars
      })
      console.log('\n=== END DEBUG ===')
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Left Panel - PDF Viewer */}
      <div
        ref={viewerContainerRef}
        className="flex-1 border-r border-gray-300"
        role="region"
        aria-label="PDF Document Viewer"
      >
        <PdfViewer pdfUrl={pdfUrl} onReady={handlePdfReady} />
      </div>

      {/* Right Panel - Analysis Text */}
      <div
        className="w-full md:w-[600px] lg:w-[700px]"
        role="region"
        aria-label="Financial Analysis"
      >
        <RightPanel
          analysisText={ANALYSIS_TEXT}
          references={REFERENCES}
          onReferenceClick={handleReferenceClick}
        />
      </div>
    </div>
  )
}

export default App
