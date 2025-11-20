/**
 * Utility functions for search and text manipulation
 */

/**
 * Normalize text for comparison (lowercase, trim whitespace)
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Highlight text matches in a string with HTML
 */
export function highlightMatches(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Escape special regex characters
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Debounce function for performance optimization
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Smooth scroll to element with offset
 */
export function smoothScrollTo(
  element: HTMLElement,
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
): void {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({
    top: targetPosition,
    behavior,
  })
}

/**
 * Format page number for display
 */
export function formatPageNumber(current: number, total: number): string {
  return `Page ${current} of ${total}`
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
