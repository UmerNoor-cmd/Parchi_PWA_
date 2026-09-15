import { createClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client for public form submissions.
 *
 * Uses the service-role key so the applications tables can stay locked down
 * with RLS (no anon insert). Never import this from a client component.
 */
function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) return null

    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
}

export type SubmitResult =
    | { ok: true }
    | { ok: false; status: number; message: string }

export async function insertApplication(
    table: "merchant_applications" | "ambassador_applications",
    payload: Record<string, unknown>,
): Promise<SubmitResult> {
    const client = getServiceClient()

    if (!client) {
        console.error(
            `[applications] Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Submission to "${table}" was NOT saved.`,
        )
        return {
            ok: false,
            status: 503,
            message: "We couldn't submit your application right now. Please email support@parchi.pk and we'll pick it up.",
        }
    }

    const { error } = await client.from(table).insert(payload)

    if (error) {
        console.error(`[applications] Insert into "${table}" failed:`, error.message)
        return {
            ok: false,
            status: 500,
            message: "Something went wrong saving your application. Please try again in a moment.",
        }
    }

    return { ok: true }
}
