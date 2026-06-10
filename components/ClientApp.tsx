'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Import the original App component dynamically to avoid SSR issues
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-neon-green text-2xl font-display animate-pulse">
        Loading Batas Kota...
      </div>
    </div>
  )
})

export default function ClientApp() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-neon-green text-2xl font-display animate-pulse">
          Loading Batas Kota...
        </div>
      </div>
    )
  }

  return <App />
}