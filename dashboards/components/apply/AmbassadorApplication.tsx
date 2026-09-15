"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { YEAR_OF_STUDY_OPTIONS, ambassadorApplicationSchema, fieldErrors } from "@/lib/applications"
import { Field, SelectField, SuccessPanel, TextAreaField, TextField } from "./application-fields"

const EMPTY = {
    fullName: "",
    email: "",
    phone: "",
    institute: "",
    yearOfStudy: "",
    city: "Karachi",
    instagram: "",
    motivation: "",
}

const PERKS = [
    { title: "Earn as you grow", desc: "Performance-based rewards tied to sign-ups and redemptions you drive on campus." },
    { title: "Real experience", desc: "Marketing, partnerships and events work you can actually put on a CV." },
    { title: "Insider access", desc: "First look at new brands, early features, and the Parchi ambassador network." },
]

export function AmbassadorApplication() {
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

        const parsed = ambassadorApplicationSchema.safeParse(values)
        if (!parsed.success) {
            setErrors(fieldErrors(parsed.error))
            toast.error("Please check the highlighted fields")
            return
        }

        setSubmitting(true)
        setErrors({})
        try {
            const res = await fetch("/api/applications/ambassador", {
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
            toast.success("Application received — welcome aboard!")
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
                        <p className="mb-5 flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="inline-block h-px w-7 bg-black/25" />
                            Campus Programme
                        </p>
                        <h1 className="mb-4 font-heading text-4xl font-extrabold leading-[0.95] tracking-tighter text-primary sm:text-5xl">
                            Become a Campus<br />
                            <span className="text-primary">Ambassador.</span>
                        </h1>
                        <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                            Run Parchi on your campus. Bring the brands your friends already love onto the
                            platform, grow the network where you study, and get paid for it.
                        </p>

                        <div className="flex flex-col gap-6">
                            {PERKS.map((p, i) => (
                                <div key={p.title} className="flex gap-4">
                                    <span className="font-heading text-[13px] font-extrabold tabular-nums text-primary">
                                        0{i + 1}
                                    </span>
                                    <div>
                                        <h3 className="mb-1 font-heading text-[15px] font-extrabold leading-tight text-black">
                                            {p.title}
                                        </h3>
                                        <p className="text-[13px] leading-[1.7] text-muted-foreground">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    {done ? (
                        <SuccessPanel
                            title="You're on the list"
                            body="Our campus team reviews ambassador applications every week. Keep an eye on your inbox and WhatsApp — we'll reach out with next steps."
                            onReset={() => setDone(false)}
                            resetLabel="Submit another application"
                        />
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8"
                        >
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Field label="Full name" htmlFor="fullName" error={errors.fullName} required className="sm:col-span-2">
                                    <TextField id="fullName" value={values.fullName} onChange={set("fullName")} error={errors.fullName} placeholder="Your name" autoComplete="name" />
                                </Field>

                                <Field label="Email" htmlFor="email" error={errors.email} required>
                                    <TextField id="email" type="email" value={values.email} onChange={set("email")} error={errors.email} placeholder="you@university.edu.pk" autoComplete="email" />
                                </Field>

                                <Field label="Phone / WhatsApp" htmlFor="phone" error={errors.phone} required>
                                    <TextField id="phone" type="tel" value={values.phone} onChange={set("phone")} error={errors.phone} placeholder="03XX XXXXXXX" autoComplete="tel" />
                                </Field>

                                <Field label="University / College" htmlFor="institute" error={errors.institute} required className="sm:col-span-2">
                                    <TextField id="institute" value={values.institute} onChange={set("institute")} error={errors.institute} placeholder="e.g. IBA Karachi" autoComplete="organization" />
                                </Field>

                                <Field label="Year of study" htmlFor="yearOfStudy" error={errors.yearOfStudy} required>
                                    <SelectField id="yearOfStudy" value={values.yearOfStudy} onChange={set("yearOfStudy")} error={errors.yearOfStudy} options={YEAR_OF_STUDY_OPTIONS} placeholder="Select year" />
                                </Field>

                                <Field label="City" htmlFor="city" error={errors.city} required>
                                    <TextField id="city" value={values.city} onChange={set("city")} error={errors.city} placeholder="Karachi" autoComplete="address-level2" />
                                </Field>

                                <Field label="Instagram handle" htmlFor="instagram" error={errors.instagram} className="sm:col-span-2">
                                    <TextField id="instagram" value={values.instagram} onChange={set("instagram")} error={errors.instagram} placeholder="@yourhandle" />
                                </Field>

                                <Field label="Why you?" htmlFor="motivation" error={errors.motivation} required className="sm:col-span-2">
                                    <TextAreaField id="motivation" value={values.motivation} onChange={set("motivation")} error={errors.motivation} placeholder="Societies you're part of, events you've run, or why you'd be great at this." />
                                </Field>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-7 w-full rounded-lg bg-primary px-6 py-3.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Submitting…" : "Apply to be an ambassador"}
                            </button>

                            <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
                                Applications are reviewed weekly. You must be currently enrolled to apply.
                            </p>
                        </form>
                    )}

                </div>
            </div>
        </section>
    )
}
