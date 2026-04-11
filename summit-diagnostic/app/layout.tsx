import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Summit Diagnostic — Summit Strategies Group',
  description: 'Organizational and leadership diagnostic engine for Summit Strategies Group.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
