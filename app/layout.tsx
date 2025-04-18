import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ParallaxProvider from "@/components/parallax-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DreamSpace - Design Your Reality",
  description: "Transform your living spaces with AI-powered design",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400&family=Raleway:wght@200;300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ParallaxProvider>{children}</ParallaxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
