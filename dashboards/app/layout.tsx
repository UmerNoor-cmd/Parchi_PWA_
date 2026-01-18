import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" })

const hagrid = localFont({
  src: [
    {
      path: "./fonts/Hagrid-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Hagrid-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/Hagrid-Text-Extrabold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Hagrid-Text-Extrabold-Italic.ttf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "Parchi Pakistan! Student Discounts App",
  description: "Exclusive student discounts and offers across Pakistan.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/Parchi-Icon-with-new-blue.png",
        type: "image/png",
      },
    ],
    apple: "/Parchi-Icon-with-new-blue.png",
  },
}

import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${hagrid.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <SonnerToaster />
        <Analytics />
      </body>
    </html>
  )
}
