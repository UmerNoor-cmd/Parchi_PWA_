import { redirect } from "next/navigation"
import type { Metadata } from "next"

// When a student scans the QR code but doesn't have the Parchi app installed,
// the OS opens this URL in the browser. We redirect to the landing page which
// has the download links. Once the app IS installed, Universal Links (iOS) /
// App Links (Android) intercept the URL before the browser ever opens.

export const metadata: Metadata = {
  title: "Redeem with Parchi",
  description: "Download the Parchi app to redeem this offer.",
}

export default function RedeemPage() {
  redirect("/")
}
