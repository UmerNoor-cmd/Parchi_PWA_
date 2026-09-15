import { NextResponse } from "next/server"
import { ambassadorApplicationSchema, fieldErrors } from "@/lib/applications"
import { insertApplication } from "@/lib/applications-store"

export async function POST(request: Request) {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const parsed = ambassadorApplicationSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Please check the highlighted fields", errors: fieldErrors(parsed.error) },
            { status: 422 },
        )
    }

    const d = parsed.data
    const result = await insertApplication("ambassador_applications", {
        full_name: d.fullName,
        email: d.email.toLowerCase(),
        phone: d.phone,
        institute: d.institute,
        year_of_study: d.yearOfStudy,
        city: d.city,
        instagram: d.instagram || null,
        motivation: d.motivation,
        status: "new",
    })

    if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ message: "Application received" }, { status: 201 })
}
