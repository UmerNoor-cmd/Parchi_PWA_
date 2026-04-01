import { NextResponse } from "next/server"

// iOS Universal Links configuration.
// Apple fetches this file from https://parchipakistan.com/.well-known/apple-app-site-association
// Team ID + Bundle ID must match exactly what is in Xcode / App Store Connect.
// Team ID: find in developer.apple.com → Membership → Team ID
// Bundle ID: com.parchi.studentapp (matches PRODUCT_BUNDLE_IDENTIFIER in iOS Runner target)
const AASA = {
  applinks: {
    details: [
      {
        appIDs: ["2HSS33TUFV.com.parchi.studentapp"],
        components: [
          {
            "/": "/merchant/*",
            comment: "Match all merchant deep-link pages",
          },
        ],
      },
    ],
  },
  // Allows Handoff / Spotlight — safe to include
  activitycontinuation: {
    apps: ["2HSS33TUFV.com.parchi.studentapp"],
  },
  webcredentials: {
    apps: ["2HSS33TUFV.com.parchi.studentapp"],
  },
}

export async function GET() {
  return new NextResponse(JSON.stringify(AASA), {
    status: 200,
    headers: {
      // Must be application/json — NOT application/pkcs7-mime
      "Content-Type": "application/json",
      // Apple CDN caches this; 1 h is a safe max-age during development
      "Cache-Control": "public, max-age=3600",
    },
  })
}
