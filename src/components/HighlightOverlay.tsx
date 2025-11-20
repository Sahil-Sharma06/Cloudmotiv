import React from 'react'

interface HighlightOverlayProps {
  rects: Array<{ x: number; y: number; width: number; height: number }>
  color?: string
  scale: number
  pageHeight: number
}

/**
 * HighlightOverlay - Renders highlight rectangles over PDF text
 *
 * This component creates absolutely positioned overlay divs that highlight
 * specific text regions in the PDF. Coordinates are scaled to match the
 * current zoom level.
 *
 * Note: PDF.js uses a coordinate system where Y increases upward from the bottom,
 * but CSS uses Y increasing downward from the top. We need to flip the Y coordinate.
 */
export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  rects,
  color = '#fef08a',
  scale,
  pageHeight,
}) => {
  return (
    <>
      {rects.map((rect, index) => {
        // Convert PDF coordinates (bottom-left origin) to CSS coordinates (top-left origin)
        // PDF Y increases upward, CSS Y increases downward
        const cssTop = pageHeight ? (pageHeight - rect.y - rect.height) * scale : rect.y * scale

        return (
          <div
            key={index}
            className="pdf-highlight pointer-events-none absolute mix-blend-multiply"
            style={{
              left: `${rect.x * scale}px`,
              top: `${cssTop}px`,
              width: `${rect.width * scale}px`,
              height: `${rect.height * scale}px`,
              backgroundColor: color,
              opacity: 0.6,
              transition: 'opacity 0.2s ease-in-out',
            }}
            role="mark"
            aria-label="Highlighted text"
          />
        )
      })}
    </>
  )
}
