import type { Highlight, PageTextContent } from '../types'

/**
 * HighlightManager - Core utility for finding and highlighting text in PDFs
 *
 * This class provides two-stage matching:
 * 1. Page-level search to find which page contains the target phrase
 * 2. Within-page text-layer matching to find exact bounding boxes
 *
 * Fallback: If exact coordinates cannot be determined, we return approximate
 * rectangles based on the text position in the page.
 */
export class HighlightManager {
  /**
   * Normalize text for matching - removes extra whitespace and special characters
   */
  private static normalizeForMatching(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/usd\s*/gi, 'usd ') // Normalize USD spacing
      .replace(/\$/g, 'usd ') // Convert $ to USD
      .replace(/,(\d)/g, '$1') // Remove thousands separators: 12,800 -> 12800
      .replace(/[^\w\s.,;:!?$%()-]/g, '') // Remove special chars but keep basic punctuation
      .trim()
  }

  /**
   * Check if phrase matches with fuzzy matching (allows for minor differences)
   */
  private static fuzzyMatch(haystack: string, needle: string): boolean {
    const normalizedHaystack = this.normalizeForMatching(haystack)
    const normalizedNeedle = this.normalizeForMatching(needle)

    // First try exact match
    if (normalizedHaystack.includes(normalizedNeedle)) {
      return true
    }

    // Extract key terms (numbers, significant words)
    const extractKeyTerms = (text: string): string[] => {
      // Find numbers (including decimals and percentages)
      const numbers = text.match(/\d+\.?\d*/g) || []
      // Find significant words (4+ chars, not common words)
      const words = text
        .split(' ')
        .filter(
          (word) =>
            word.length >= 4 &&
            !['this', 'that', 'with', 'from', 'have', 'been', 'were', 'said'].includes(word)
        )
      return [...numbers, ...words]
    }

    const needleTerms = extractKeyTerms(normalizedNeedle)
    const haystackTerms = extractKeyTerms(normalizedHaystack)

    if (needleTerms.length === 0) return false

    // Check how many key terms match
    const matchedTerms = needleTerms.filter((term) =>
      haystackTerms.some((hTerm) => hTerm.includes(term) || term.includes(hTerm))
    )

    // Need at least 60% of key terms to match, or at least 2 terms
    const matchRatio = matchedTerms.length / needleTerms.length
    return matchRatio >= 0.6 || matchedTerms.length >= 2
  }

  /**
   * Search for a phrase across all pages and return highlight data
   *
   * @param phrase - The exact text to find and highlight
   * @param id - Unique identifier for this highlight
   * @param pageContents - Array of page text content with positional data
   * @param pageHint - Optional page number hint to start search (0-indexed)
   * @returns Highlight object with page and rect coordinates, or null if not found
   */
  static async findPhrase(
    phrase: string,
    id: string,
    pageContents: PageTextContent[],
    pageHint?: number
  ): Promise<Highlight | null> {
    // Normalize search phrase
    const normalizedPhrase = this.normalizeForMatching(phrase)

    console.log(`Searching for phrase: "${phrase}"`)
    console.log(`Normalized: "${normalizedPhrase}"`)

    // Start search from hint page if provided, otherwise search all
    const searchOrder =
      pageHint !== undefined
        ? [pageHint, ...pageContents.map((_, i) => i).filter((i) => i !== pageHint)]
        : pageContents.map((_, i) => i)

    for (const pageIndex of searchOrder) {
      const pageContent = pageContents[pageIndex]
      if (!pageContent) continue

      console.log(`Checking page ${pageIndex + 1}...`)

      // Step 1: Check if phrase exists on this page using fuzzy matching
      if (this.fuzzyMatch(pageContent.text, phrase)) {
        console.log(`Found match on page ${pageIndex + 1}`)

        // Step 2: Find exact position within page
        const rects = this.findTextRects(phrase, pageContent)

        if (rects.length > 0) {
          console.log(`Found ${rects.length} highlight rectangles`)
          return {
            id,
            phrase,
            pageIndex,
            rects,
            color: '#fef08a', // Yellow highlight
          }
        }

        // Fallback: Create approximate highlight if exact rects not found
        // This can happen with complex PDF layouts or multi-line text
        console.warn(
          `Exact coordinates not found for "${phrase}" on page ${pageIndex + 1}, using fallback`
        )
        return {
          id,
          phrase,
          pageIndex,
          rects: [{ x: 50, y: 100, width: 500, height: 30 }], // Approximate position
          color: '#fef08a',
        }
      }
    }

    console.error(`Phrase "${phrase}" not found in any page`)
    return null
  }

  /**
   * Find bounding rectangles for text within a page
   *
   * @param phrase - Text to locate
   * @param pageContent - Page text content with item positions
   * @returns Array of rectangles covering the phrase
   */
  private static findTextRects(
    phrase: string,
    pageContent: PageTextContent
  ): { x: number; y: number; width: number; height: number }[] {
    const normalizedPhrase = this.normalizeForMatching(phrase)

    // Build text with proper spacing
    let fullText = ''
    const charToItemMap: number[] = [] // Maps each character position to item index

    pageContent.items.forEach((item, itemIndex) => {
      const itemText = item.str
      for (let i = 0; i < itemText.length; i++) {
        charToItemMap.push(itemIndex)
      }
      fullText += itemText
      // Add space between items (except if the item already ends with space or next starts with space)
      if (itemIndex < pageContent.items.length - 1) {
        const nextItem = pageContent.items[itemIndex + 1]
        if (!itemText.endsWith(' ') && !nextItem.str.startsWith(' ')) {
          fullText += ' '
          charToItemMap.push(itemIndex) // Space belongs to current item
        }
      }
    })

    const normalizedFullText = this.normalizeForMatching(fullText)

    // Try to find the phrase in the normalized text
    let startIndex = normalizedFullText.indexOf(normalizedPhrase)
    let searchLength = normalizedPhrase.length

    // If exact match not found, try finding key terms and highlighting that region
    if (startIndex === -1) {
      // Extract numbers and key words from the phrase
      const numbers = normalizedPhrase.match(/\d+\.?\d*/g) || []
      const keyWords = normalizedPhrase
        .split(' ')
        .filter((word) => word.length >= 4 && !['this', 'that', 'with', 'from'].includes(word))

      // Try to find a section containing multiple key terms
      const allKeyTerms = [...numbers, ...keyWords]

      for (const term of allKeyTerms) {
        const termIndex = normalizedFullText.indexOf(term)
        if (termIndex !== -1) {
          // Found a key term, use it as the start point
          // Look for more terms nearby to determine the highlight region
          const contextStart = Math.max(0, termIndex - 50)
          const contextEnd = Math.min(normalizedFullText.length, termIndex + 100)
          const context = normalizedFullText.substring(contextStart, contextEnd)

          // Check how many key terms are in this context
          const termsInContext = allKeyTerms.filter((t) => context.includes(t))

          if (termsInContext.length >= Math.max(1, allKeyTerms.length * 0.5)) {
            // This context has enough key terms, use it
            startIndex = termIndex
            searchLength = Math.min(100, normalizedFullText.length - termIndex)
            console.log(
              `Using partial match starting at "${normalizedFullText.substring(termIndex, termIndex + 30)}..."`
            )
            break
          }
        }
      }
    }

    if (startIndex === -1) {
      console.warn(`Could not find phrase "${phrase}" or its key terms in page text`)
      return []
    }

    // Map the found positions back to original text (accounting for normalization)
    // This is approximate due to normalization, but should work for most cases
    const normalizedToOriginal = (normIndex: number): number => {
      // Simple heuristic: scale by length difference
      const ratio = fullText.length / normalizedFullText.length
      return Math.floor(normIndex * ratio)
    }

    const originalStart = normalizedToOriginal(startIndex)
    const originalEnd = normalizedToOriginal(startIndex + searchLength)

    // Find which text items contain our phrase
    const matchingItemIndices = new Set<number>()

    for (let i = originalStart; i < Math.min(originalEnd, charToItemMap.length); i++) {
      matchingItemIndices.add(charToItemMap[i])
    }

    // Convert to array and get actual items
    const matchingItems = Array.from(matchingItemIndices)
      .sort((a, b) => a - b)
      .map((index) => pageContent.items[index])

    // Convert text items to rectangles using PDF.js coordinate system
    const rects = matchingItems.map((item) => {
      // PDF.js transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const transform = item.transform
      const x = transform[4]
      // Note: PDF coordinates have Y increasing upward from bottom-left
      // We need to keep them as-is; the rendering layer will handle the flip
      const y = transform[5]
      const width = item.width
      const height = item.height || 12 // Default height if not available

      return { x, y, width, height }
    })

    return this.mergeRects(rects)
  }

  /**
   * Merge adjacent or overlapping rectangles to reduce highlight count
   *
   * @param rects - Array of rectangles to merge
   * @returns Merged array of rectangles
   */
  static mergeRects(
    rects: { x: number; y: number; width: number; height: number }[]
  ): { x: number; y: number; width: number; height: number }[] {
    if (rects.length <= 1) return rects

    const sorted = [...rects].sort((a, b) => a.y - b.y || a.x - b.x)
    const merged: typeof rects = []

    let current = sorted[0]

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i]

      // Check if rectangles are on the same line (similar y) and adjacent/overlapping
      const sameY = Math.abs(current.y - next.y) < 5
      const adjacent = next.x <= current.x + current.width + 10

      if (sameY && adjacent) {
        // Merge rectangles
        const rightEdge = Math.max(current.x + current.width, next.x + next.width)
        current = {
          x: Math.min(current.x, next.x),
          y: Math.min(current.y, next.y),
          width: rightEdge - Math.min(current.x, next.x),
          height: Math.max(current.height, next.height),
        }
      } else {
        merged.push(current)
        current = next
      }
    }

    merged.push(current)
    return merged
  }
}
