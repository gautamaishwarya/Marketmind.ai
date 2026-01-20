import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MarketMind AI - Your Market Research Agent',
  description: 'Talk to Scout and discover your market. Get instant insights, competitive analysis, and strategic guidance for your startup.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
