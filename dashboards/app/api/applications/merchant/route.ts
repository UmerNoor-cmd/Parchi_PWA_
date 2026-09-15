import { NextResponse } from "next/server"
import { fieldErrors, merchantApplicationSchema } from "@/lib/applications"
import { insertApplication } from "@/lib/applications-store"

export async function POST(request: Request) {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const parsed = merchantApplicationSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Please check the highlighted fields", errors: fieldErrors(parsed.error) },
            { status: 422 },
        )
    }

    const d = parsed.data
    const result = await insertApplication("merchant_applications", {
        business_name: d.businessName,
        contact_name: d.contactName,
        email: d.email.toLowerCase(),
        phone: d.phone,
        city: d.city,
        category: d.category,
        branch_count: d.branchCount,
        website: d.website || null,
        message: d.message || null,
        status: "new",
    })

    if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ message: "Application received" }, { status: 201 })
}
