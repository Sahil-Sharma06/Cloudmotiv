import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import { useHighlightStore } from '../store/highlightStore'
import type { Reference } from '../types'
import { LinkIcon, XMarkIcon } from './Icons'

interface RightPanelProps {
  analysisText: string
  references: Reference[]
  onReferenceClick: (reference: Reference) => void
}

/**
 * RightPanel - Displays analysis text with clickable references
 *
 * Features:
 * - Markdown rendering for formatted text
 * - Clickable reference markers with visual feedback
 * - Active reference indicator
 * - Reference legend/tooltip
 */
export const RightPanel: React.FC<RightPanelProps> = ({
  analysisText,
  references,
  onReferenceClick,
}) => {
  const { activeReferenceId, clearHighlights } = useHighlightStore()
  const [showLegend, setShowLegend] = useState(true)

  const handleReferenceClick = useCallback(
    (reference: Reference) => {
      onReferenceClick(reference)
    },
    [onReferenceClick]
  )

  // Custom markdown renderer to make references clickable
  const renderText = (text: string) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    references.forEach((ref) => {
      const index = text.indexOf(ref.label, lastIndex)
      if (index !== -1) {
        // Add text before reference
        if (index > lastIndex) {
          parts.push(text.substring(lastIndex, index))
        }

        // Add clickable reference
        const isActive = activeReferenceId === ref.id
        parts.push(
          <button
            key={ref.id}
            onClick={() => handleReferenceClick(ref)}
            className={clsx(
              'mx-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-sm font-semibold transition-all',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
              isActive
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            )}
            aria-label={`Reference ${ref.label}: ${ref.description || ref.phrase}`}
            title={ref.description || ref.phrase}
          >
            {ref.label}
          </button>
        )

        lastIndex = index + ref.label.length
      }
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Financial Analysis</h2>
        <p className="mt-1 text-sm text-gray-600">
          Click on references to highlight the source in the PDF
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {/* Reference Legend */}
        {showLegend && (
          <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <LinkIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="text-sm font-semibold text-primary-900">Interactive References</h3>
                  <p className="mt-1 text-xs text-primary-700">
                    Click any reference number (e.g., [3]) to view and highlight the exact source
                    text in the PDF document.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLegend(false)}
                className="ml-2 flex-shrink-0 rounded p-1 hover:bg-primary-100"
                aria-label="Close legend"
              >
                <XMarkIcon className="h-4 w-4 text-primary-600" />
              </button>
            </div>
          </div>
        )}

        {/* Active reference indicator */}
        {activeReferenceId && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-900">
                Highlighting: {references.find((r) => r.id === activeReferenceId)?.label}
              </span>
            </div>
            <button
              onClick={clearHighlights}
              className="rounded px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Clear
            </button>
          </div>
        )}

        {/* Analysis text with custom rendering */}
        <div className="prose prose-sm prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 prose-strong:text-gray-900 max-w-none">
          {analysisText.split('\n').map((line, index) => {
            if (line.trim().startsWith('#')) {
              // Render headings
              const level = line.match(/^#+/)?.[0].length || 1
              const text = line.replace(/^#+\s*/, '')
              const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements

              return (
                <HeadingTag key={index} className="mt-6 first:mt-0">
                  {renderText(text)}
                </HeadingTag>
              )
            } else if (line.trim() === '---') {
              return <hr key={index} className="my-6" />
            } else if (line.trim()) {
              return (
                <p key={index} className="mb-4">
                  {renderText(line)}
                </p>
              )
            }
            return null
          })}
        </div>

        {/* Reference list */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">References</h3>
          <ul className="space-y-2">
            {references.map((ref) => (
              <li key={ref.id} className="flex items-start gap-2 text-xs text-gray-600">
                <button
                  onClick={() => handleReferenceClick(ref)}
                  className={clsx(
                    'flex-shrink-0 rounded px-1.5 py-0.5 font-semibold transition-colors',
                    activeReferenceId === ref.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  {ref.label}
                </button>
                <span>
                  {ref.description || ref.phrase}
                  {ref.pageHint && (
                    <span className="ml-1 text-gray-400">(page {ref.pageHint})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
