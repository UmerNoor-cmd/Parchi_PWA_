import { NextResponse } from "next/server"

// Android App Links configuration.
// Google fetches this from https://parchipakistan.com/.well-known/assetlinks.json
//
// sha256_cert_fingerprints: the SHA-256 fingerprint of your RELEASE signing keystore.
// Get it by running:
//   keytool -list -v -keystore <your.jks> -alias <key-alias>
// OR from Play Console → Setup → App Signing → "App signing key certificate"
// It looks like: "AB:CD:EF:..."  — include ALL characters including colons.
// package_name must match Android applicationId in app/build.gradle(.kts).
const ASSET_LINKS = [
  {
    relation: [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.get_login_creds",
    ],
    target: {
      namespace: "android_app",
      package_name: "com.parchi.student",
      sha256_cert_fingerprints: [
        "B1:A0:64:08:E7:C5:22:7D:E0:5F:C0:93:CC:FA:22:DF:9B:6C:F5:A3:C9:3F:01:BF:01:1B:C3:2A:CE:8B:F0:93",
      ],
    },
  },
]

export async function GET() {
  return new NextResponse(JSON.stringify(ASSET_LINKS), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
