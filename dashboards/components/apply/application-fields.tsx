"use client"

import type { ReactNode } from "react"

/**
 * Shared field primitives for the two landing-page application forms.
 * Native inputs (rather than Radix Select) so the whole thing submits and
 * validates as one plain form with no extra client state.
 */

const BASE_CONTROL =
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"

function controlClass(hasError?: boolean) {
    return `${BASE_CONTROL} ${hasError ? "border-red-400" : "border-black/12"}`
}

export function Field({
    label,
    htmlFor,
    error,
    required,
    className = "",
    children,
}: {
    label: string
    htmlFor: string
    error?: string
    required?: boolean
    className?: string
    children: ReactNode
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label
                htmlFor={htmlFor}
                className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-black/45"
            >
                {label}
                {!required && <span className="ml-1.5 normal-case tracking-normal text-black/25">optional</span>}
            </label>
            {children}
            {error && (
                <p role="alert" className="text-[12px] leading-tight text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}

export function TextField({
    id,
    error,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
    return (
        <input
            id={id}
            name={id}
            aria-invalid={!!error}
            className={controlClass(!!error)}
            {...props}
        />
    )
}

export function TextAreaField({
    id,
    error,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string }) {
    return (
        <textarea
            id={id}
            name={id}
            aria-invalid={!!error}
            className={`${controlClass(!!error)} min-h-[110px] resize-y leading-relaxed`}
            {...props}
        />
    )
}

export function SelectField({
    id,
    error,
    options,
    placeholder,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
    id: string
    error?: string
    options: string[]
    placeholder: string
}) {
    return (
        <select
            id={id}
            name={id}
            aria-invalid={!!error}
            className={`${controlClass(!!error)} appearance-none bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10`}
            style={{
                backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23999' stroke-width='1.6'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
            }}
            {...props}
        >
            <option value="">{placeholder}</option>
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    )
}

export function SuccessPanel({
    title,
    body,
    onReset,
    resetLabel,
}: {
    title: string
    body: string
    onReset: () => void
    resetLabel: string
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white px-8 py-14 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            </div>
            <h3 className="mb-2 font-heading text-[22px] font-extrabold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="mb-6 max-w-sm text-[14px] leading-relaxed text-muted-foreground">{body}</p>
            <button
                type="button"
                onClick={onReset}
                className="font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-primary underline-offset-4 hover:underline"
            >
                {resetLabel}
            </button>
        </div>
    )
}
