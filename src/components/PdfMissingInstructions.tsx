import React from 'react'

interface PdfMissingInstructionsProps {
  pdfPath: string
}

/**
 * PdfMissingInstructions - Display helpful instructions when PDF is missing
 */
export const PdfMissingInstructions: React.FC<PdfMissingInstructionsProps> = ({ pdfPath }) => {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50 p-8">
      <div className="max-w-2xl rounded-lg border-2 border-primary-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <svg
            className="h-12 w-12 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PDF File Required</h2>
            <p className="text-sm text-gray-600">Looking for: {pdfPath}</p>
          </div>
        </div>

        <div className="space-y-4 text-gray-700">
          <p className="font-semibold">
            To use this PDF Reference Viewer, please add your PDF file:
          </p>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Option 1: Use the attached PDF</h3>
            <ol className="ml-4 list-decimal space-y-1 text-sm">
              <li>
                Locate the file:{' '}
                <code className="rounded bg-gray-200 px-1 py-0.5">
                  Fullstack-Developer-Case-Study (1).pdf
                </code>
              </li>
              <li>
                Copy it to:{' '}
                <code className="rounded bg-gray-200 px-1 py-0.5">public/sample.pdf</code>
              </li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Option 2: Use any PDF</h3>
            <ol className="ml-4 list-decimal space-y-1 text-sm text-blue-800">
              <li>Place any PDF file in the public folder</li>
              <li>Rename it to sample.pdf</li>
              <li>
                Update references in{' '}
                <code className="rounded bg-blue-200 px-1 py-0.5">src/data/references.ts</code>
              </li>
            </ol>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="mb-2 font-semibold text-yellow-900">Quick Command (PowerShell)</h3>
            <code className="block rounded bg-yellow-100 p-2 text-xs text-yellow-900">
              Copy-Item "Fullstack-Developer-Case-Study (1).pdf" "public/sample.pdf"
            </code>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> The PDF viewer requires files to be served from the public folder
            or a web URL. Direct file system paths (c:\ or file://) won't work in browsers due to
            security restrictions.
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700"
          >
            Refresh Page After Adding PDF
          </button>
        </div>
      </div>
    </div>
  )
}
