'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Disable SSR — swagger-ui-react requires browser APIs
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary-700 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Invoicer API Docs</h1>
            <p className="text-blue-200 text-xs">Interactive REST API reference</p>
          </div>
        </div>
        <a href="/dashboard" className="text-blue-200 hover:text-white text-sm transition-colors">
          ← Back to Dashboard
        </a>
      </div>

      <SwaggerUI
        url="/api/docs"
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration
        tryItOutEnabled
        persistAuthorization
      />
    </div>
  )
}
