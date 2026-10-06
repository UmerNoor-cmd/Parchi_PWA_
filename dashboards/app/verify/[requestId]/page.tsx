import { redirect } from "next/navigation"
import type { Metadata } from "next"

// A partner (e.g. Inside Karachi) shows a QR code that encodes
// https://www.parchipakistan.com/verify/{requestId}.
// - App installed: iOS Universal Links / Android App Links open the Parchi app directly
//   and this page is never rendered.
// - App not installed, or the QR was read by the system camera on a device that does not
//   claim the link: the browser lands here. We send the person to the landing page with
//   the download links. The request id is intentionally not echoed or used here.

export const metadata: Metadata = {
  title: "Confirm with Parchi",
  description: "Open the Parchi app to confirm your student status.",
  robots: { index: false, follow: false },
}

export default function VerifyPage() {
  redirect("/")
}
