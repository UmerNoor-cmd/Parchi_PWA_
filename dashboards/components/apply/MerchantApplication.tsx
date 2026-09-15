"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { BRANCH_COUNT_OPTIONS, fieldErrors, merchantApplicationSchema } from "@/lib/applications"
import { MERCHANT_CATEGORIES } from "@/lib/merchant-categories"
import { Field, SelectField, SuccessPanel, TextAreaField, TextField } from "./application-fields"

const EMPTY = {
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "Karachi",
    category: "",
    branchCount: "",
    website: "",
    message: "",
}

const PROOF_POINTS = [
    "Reach verified students with zero discount leakage",
    "Full merchant dashboard, branch controls and live analytics",
    "No setup fee — you only list the offers you want to run",
]

export function MerchantApplication() {
    const [values, setValues] = useState(EMPTY)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    const set = (key: keyof typeof EMPTY) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setValues((v) => ({ ...v, [key]: e.target.value }))
        setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (submitting) return

        const parsed = merchantApplicationSchema.safeParse(values)
        if (!parsed.success) {
            setErrors(fieldErrors(parsed.error))
            toast.error("Please check the highlighted fields")
            return
        }

        setSubmitting(true)
        setErrors({})
        try {
            const res = await fetch("/api/applications/merchant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed.data),
            })
            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                if (data.errors) setErrors(data.errors)
                toast.error(data.message || "Something went wrong. Please try again.")
                return
            }

            setValues(EMPTY)
            setDone(true)
            toast.success("Application received — we'll be in touch shortly.")
        } catch {
            toast.error("Network error. Please check your connection and try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="w-full bg-background pb-16 pt-28 md:pb-24 md:pt-36">
            <div className="container mx-auto px-4 md:px-6">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-1.5 font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-primary"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Parchi
                </Link>

                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">

                    {/* Pitch */}
                    <div className="flex flex-col justify-center">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/50">
                            For Businesses
                        </p>
                        <h1 className="mb-4 font-heading text-4xl font-extrabold tracking-tighter text-primary sm:text-5xl">
                            Become a Merchant.
                        </h1>
                        <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                            Put your brand in front of Karachi's student market — verified, engaged, and
                            already looking for somewhere to spend. Tell us about your business and our
                            partnerships team will take it from there.
                        </p>

                        <ul className="flex flex-col gap-3.5">
                            {PROOF_POINTS.map((p) => (
                                <li key={p} className="flex items-start gap-3">
                                    <span className="mt-[3px] flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </span>
                                    <span className="text-[14px] leading-relaxed text-foreground/75">{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Form */}
                    {done ? (
                        <SuccessPanel
                            title="Application received"
                            body="Our partnerships team reviews new merchants within two working days. We'll reach out on the email and phone number you shared."
                            onReset={() => setDone(false)}
                            resetLabel="Submit another business"
                        />
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8"
                        >
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Field label="Business name" htmlFor="businessName" error={errors.businessName} required className="sm:col-span-2">
                                    <TextField id="businessName" value={values.businessName} onChange={set("businessName")} error={errors.businessName} placeholder="e.g. Burning Brownie" autoComplete="organization" />
                                </Field>

                                <Field label="Your name" htmlFor="contactName" error={errors.contactName} required>
                                    <TextField id="contactName" value={values.contactName} onChange={set("contactName")} error={errors.contactName} placeholder="Full name" autoComplete="name" />
                                </Field>

                                <Field label="Work email" htmlFor="email" error={errors.email} required>
                                    <TextField id="email" type="email" value={values.email} onChange={set("email")} error={errors.email} placeholder="you@business.com" autoComplete="email" />
                                </Field>

                                <Field label="Phone" htmlFor="phone" error={errors.phone} required>
                                    <TextField id="phone" type="tel" value={values.phone} onChange={set("phone")} error={errors.phone} placeholder="03XX XXXXXXX" autoComplete="tel" />
                                </Field>

                                <Field label="City" htmlFor="city" error={errors.city} required>
                                    <TextField id="city" value={values.city} onChange={set("city")} error={errors.city} placeholder="Karachi" autoComplete="address-level2" />
                                </Field>

                                <Field label="Category" htmlFor="category" error={errors.category} required>
                                    <SelectField id="category" value={values.category} onChange={set("category")} error={errors.category} options={MERCHANT_CATEGORIES} placeholder="Select a category" />
                                </Field>

                                <Field label="Branches" htmlFor="branchCount" error={errors.branchCount} required>
                                    <SelectField id="branchCount" value={values.branchCount} onChange={set("branchCount")} error={errors.branchCount} options={BRANCH_COUNT_OPTIONS} placeholder="How many outlets?" />
                                </Field>

                                <Field label="Website or Instagram" htmlFor="website" error={errors.website} className="sm:col-span-2">
                                    <TextField id="website" value={values.website} onChange={set("website")} error={errors.website} placeholder="@yourbrand or yourbrand.pk" />
                                </Field>

                                <Field label="Anything else" htmlFor="message" error={errors.message} className="sm:col-span-2">
                                    <TextAreaField id="message" value={values.message} onChange={set("message")} error={errors.message} placeholder="Tell us what kind of student offer you have in mind." />
                                </Field>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-7 w-full rounded-lg bg-primary px-6 py-3.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Submitting…" : "Submit application"}
                            </button>

                            <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
                                We'll only use these details to contact you about partnering with Parchi.
                            </p>
                        </form>
                    )}

                </div>
            </div>
        </section>
    )
}
