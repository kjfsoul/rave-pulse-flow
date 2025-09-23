'use client'

import dynamic from 'next/dynamic'

// Disable SSR completely to avoid environment variable issues
const App = dynamic(() => import('../src/App'), { 
  ssr: false,
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading EDM Shuffle...</div>
})

export default function Home() {
  return <App />
}
