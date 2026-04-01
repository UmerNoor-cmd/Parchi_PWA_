"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"

// These never change — hardcoded intentionally.
const APP_STORE_URL =
  "https://apps.apple.com/app/parchi-the-student-app/id6760251460"
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.parchi.student&hl=en"

export default function MerchantDeepLinkPage() {
  const params = useParams()
  const merchantId = params?.id as string

  useEffect(() => {
    if (!merchantId) return

    const deepLink = `parchi://merchant/${merchantId}`

    // Detect platform
    const ua = navigator.userAgent || ""
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    const storeUrl = isIOS ? APP_STORE_URL : PLAY_STORE_URL

    // Try to open the app. If it's not installed the browser will stay on
    // this page and the setTimeout fallback will redirect to the store.
    window.location.href = deepLink

    // Give the OS 2 s to hand off to the app. If the page is still visible
    // after that (app not installed / not handled), go to the store.
    // We only redirect to a store on mobile; on desktop just stay on page.
    if (isIOS || isAndroid) {
      const timer = setTimeout(() => {
        window.location.replace(storeUrl)
      }, 2000)

      // If the app DID open, the page goes into the background and
      // visibilitychange fires — cancel the timer so we don't also open the store.
      const onVisibilityChange = () => {
        if (document.hidden) clearTimeout(timer)
      }
      document.addEventListener("visibilitychange", onVisibilityChange, {
        once: true,
      })

      return () => {
        clearTimeout(timer)
        document.removeEventListener("visibilitychange", onVisibilityChange)
      }
    }
  }, [merchantId])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f0f6ff] px-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/Parchi-Icon-with-new-blue.png"
          alt="Parchi"
          width={80}
          height={80}
          className="rounded-2xl shadow-lg"
        />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Opening in Parchi…
      </h1>
      <p className="text-gray-500 text-sm mb-10 max-w-xs">
        If the app doesn&apos;t open automatically, download it below.
      </p>

      {/* Store badges */}
      <div className="flex flex-col gap-4 items-center w-full max-w-xs">
        <a
          href={APP_STORE_URL}
          className="w-full"
          aria-label="Download on the App Store"
        >
          <img
            src="/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
            alt="Download on the App Store"
            className="h-14 w-auto mx-auto"
          />
        </a>
        <a
          href={PLAY_STORE_URL}
          className="w-full"
          aria-label="Get it on Google Play"
        >
          <img
            src="/GetItOnGooglePlay_Badge_Web_color_English.svg"
            alt="Get it on Google Play"
            className="h-14 w-auto mx-auto"
          />
        </a>
      </div>
    </main>
  )
}
