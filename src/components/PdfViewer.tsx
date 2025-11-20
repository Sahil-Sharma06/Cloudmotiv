import React, { useState, useCallback, useRef } from 'react'
import { Document } from 'react-pdf'
import { PdfPage } from './PdfPage'
import { PdfMissingInstructions } from './PdfMissingInstructions'
import { usePdfViewerStore } from '../store/pdfViewerStore'
import { useHighlightStore } from '../store/highlightStore'
import type { PageTextContent } from '../types'
import { ZoomInIcon, ZoomOutIcon, ChevronLeftIcon, ChevronRightIcon, DocumentIcon } from './Icons'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

interface PdfViewerProps {
  pdfUrl: string
  onReady?: () => void
}

/**
 * PdfViewer - Main PDF viewing component
 *
 * Features:
 * - Multi-page PDF rendering with virtualization considerations
 * - Zoom controls (in/out, reset)
 * - Page navigation
 * - Text extraction for highlight search
 * - Highlight overlay coordination
 */
export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onReady }) => {
  const { numPages, currentPage, scale, setNumPages, setCurrentPage, zoomIn, zoomOut, setScale } =
    usePdfViewerStore()
  const { highlights } = useHighlightStore()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageTextContents, setPageTextContents] = useState<PageTextContent[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Store reference to PDF document for text extraction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocumentRef = useRef<any>(null)

  const onDocumentLoadSuccess = useCallback(
    async ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages)
      setIsLoading(false)
      setError(null)

      // Extract text content from all pages for search
      if (pdfDocumentRef.current) {
        const contents: PageTextContent[] = []

        for (let i = 1; i <= pages; i++) {
          try {
            const page = await pdfDocumentRef.current.getPage(i)
            const textContent = await page.getTextContent()

            contents.push({
              pageIndex: i - 1,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              text: textContent.items.map((item: any) => item.str).join(' '),
              items: textContent.items,
            })
          } catch (err) {
            console.error(`Error extracting text from page ${i}:`, err)
          }
        }

        setPageTextContents(contents)
        onReady?.()
      }
    },
    [setNumPages, onReady]
  )

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF document. Please check the file path.')
    setIsLoading(false)
  }, [])

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const handleZoomReset = () => {
    setScale(1.2)
  }

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <DocumentIcon className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {isLoading ? 'Loading...' : `Page ${currentPage} of ${numPages}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Page navigation */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            className="rounded p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="rounded p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="mx-2 h-6 w-px bg-gray-300" />

          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="rounded p-1.5 hover:bg-gray-100"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOutIcon className="h-5 w-5" />
          </button>

          <span className="min-w-[4rem] text-center text-sm font-medium text-gray-700">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="rounded p-1.5 hover:bg-gray-100"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomInIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleZoomReset}
            className="ml-1 rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            aria-label="Reset zoom"
            title="Reset zoom to 120%"
          >
            Reset
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-200 p-4"
        role="main"
        aria-label="PDF document viewer"
      >
        {error ? (
          <PdfMissingInstructions pdfPath={pdfUrl} />
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={(pdf) => {
              pdfDocumentRef.current = pdf
              onDocumentLoadSuccess(pdf)
            }}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600" />
                  <p className="text-sm text-gray-600">Loading PDF...</p>
                </div>
              </div>
            }
          >
            {/* Render all pages - in production, consider virtualization for large PDFs */}
            {Array.from(new Array(numPages), (_, index) => (
              <PdfPage
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                highlights={highlights}
              />
            ))}
          </Document>
        )}
      </div>

      {/* Export page text contents for external access */}
      {React.createElement('div', {
        ref: (el: HTMLDivElement | null): void => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (el) (el as any).__pageTextContents = pageTextContents
        },
        style: { display: 'none' },
      })}
    </div>
  )
}
