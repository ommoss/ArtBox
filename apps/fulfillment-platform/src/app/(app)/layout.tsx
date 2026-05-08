import React from 'react'

export const metadata = {
  title: 'Artbox Fulfillment',
  description: 'Internal fulfillment platform for Artbox Printing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          background: '#f4f4f4',
          color: '#111',
        }}
      >
        {children}
      </body>
    </html>
  )
}
