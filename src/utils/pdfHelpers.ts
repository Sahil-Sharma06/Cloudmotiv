import type { PageTextContent } from '../types'

/**
 * Export method to get page text contents from viewer
 * This is a helper function to extract text content stored in the PDF viewer
 */
export const getPageTextContents = (viewerElement: HTMLElement): PageTextContent[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hiddenDiv = viewerElement.querySelector('[style*="display: none"]') as any
  return hiddenDiv?.__pageTextContents || []
}
