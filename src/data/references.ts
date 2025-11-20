import type { Reference } from '../types'

/**
 * Pre-defined references linking analysis text to PDF locations
 * These correspond to the Maersk Q2 2025 Interim Report
 */
export const REFERENCES: Reference[] = [
  {
    id: 'ref-1',
    label: '[1]',
    phrase: 'Revenue 12.8',
    pageHint: 1,
    description: 'Q2 2025 revenue growth',
  },
  {
    id: 'ref-2',
    label: '[2]',
    phrase: 'EBITDA 3.2',
    pageHint: 1,
    description: 'Q2 2025 EBITDA figure',
  },
  {
    id: 'ref-3',
    label: '[3]',
    phrase: 'Gain sale non-current assets',
    pageHint: 15,
    description: 'Financial statement line item on page 15',
  },
]

/**
 * Analysis text with inline reference markers
 * This would typically come from the case study PDF
 */
export const ANALYSIS_TEXT = `
# Maersk Q2 2025 Financial Analysis

## Executive Summary

A.P. Moller-Maersk A/S demonstrated strong operational performance in Q2 2025, with revenue growth driven by improved container shipping demand and strategic capacity management.

## Key Financial Metrics

The company reported solid financial results for the quarter. ${REFERENCES[0].label} compared to the same period in the previous year, reflecting increased volumes and improved freight rates across key trade lanes.

Profitability remained robust with ${REFERENCES[1].label} for the quarter, demonstrating effective cost management and operational efficiency improvements. The EBITDA margin of 25% shows the company's ability to convert revenue into operating cash flow.

## Balance Sheet Highlights

The consolidated income statement shows various line items contributing to the overall financial position. Notable among these is ${REFERENCES[2].label}, which represents proceeds from asset disposals and other non-operating items. This line item is particularly relevant for understanding one-time gains and the company's capital allocation strategy.

## Strategic Outlook

Looking ahead, Maersk continues to focus on:
- Expanding integrated logistics capabilities
- Improving supply chain digitalization
- Maintaining disciplined capacity management
- Pursuing strategic partnerships and acquisitions

The company's Q2 performance positions it well for continued growth in the evolving global trade environment.

---

*Note: Click on any reference number (e.g., ${REFERENCES[2].label}) to view the exact source in the PDF document. The highlighted text will appear in the left panel with smooth scrolling to the relevant page.*
`

/**
 * Default PDF file to load
 *
 * IMPORTANT: To use this app, place your PDF file in the public folder:
 * 1. Copy "Fullstack-Developer-Case-Study (1).pdf" to public/sample.pdf
 * OR
 * 2. Update this path to point to your PDF location
 *
 * For development, you can use a sample PDF or a URL:
 * - Local: '/sample.pdf' (file in public folder)
 * - Remote: 'https://example.com/sample.pdf'
 */
export const DEFAULT_PDF_PATH = '/sample.pdf'
