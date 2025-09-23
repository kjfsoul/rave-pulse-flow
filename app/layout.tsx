import type { Metadata } from 'next'
import '../src/index.css'

export const metadata: Metadata = {
  title: 'EDM Shuffle - Rave Pulse Flow',
  description: 'The ultimate EDM festival experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
