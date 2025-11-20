import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Page } from 'react-pdf'
import { HighlightOverlay } from './HighlightOverlay'
import type { Highlight } from '../types'

interface PdfPageProps {
  pageNumber: number
  scale: number
  highlights: Highlight[]
  onPageRender?: () => void
}

/**
 * PdfPage - Renders a single PDF page with highlight overlays
 *
 * This component wraps react-pdf's Page component and adds:
 * - Highlight overlay rendering
 * - Text layer support for selection
 * - Scroll-into-view functionality
 */
export const PdfPage: React.FC<PdfPageProps> = ({
  pageNumber,
  scale,
  highlights,
  onPageRender,
}) => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [pageHeight, setPageHeight] = useState<number>(0)

  // Scroll to page when highlights change
  useEffect(() => {
    const pageHighlights = highlights.filter((h) => h.pageIndex === pageNumber - 1)
    if (pageHighlights.length > 0 && pageRef.current) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        pageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [highlights, pageNumber])

  // Capture page dimensions after render
  const handlePageRenderSuccess = useCallback(
    (page: { originalHeight?: number; height: number }) => {
      // Get the page's viewport height for coordinate conversion
      const viewport = page.originalHeight || page.height
      setPageHeight(viewport)
      onPageRender?.()
    },
    [onPageRender]
  )

  const pageHighlights = highlights.filter((h) => h.pageIndex === pageNumber - 1)

  return (
    <div ref={pageRef} className="relative mb-4 shadow-lg" data-page-number={pageNumber}>
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={false}
        onRenderSuccess={handlePageRenderSuccess}
        className="mx-auto"
      />

      {/* Render highlights for this page */}
      {pageHighlights.map((highlight) => (
        <div
          key={highlight.id}
          className="pointer-events-none absolute left-0 top-0"
          style={{ width: '100%', height: '100%' }}
        >
          <HighlightOverlay
            rects={highlight.rects}
            color={highlight.color}
            scale={scale}
            pageHeight={pageHeight}
          />
        </div>
      ))}
    </div>
  )
}
