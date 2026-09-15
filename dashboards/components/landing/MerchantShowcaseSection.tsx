"use client"

import Image from "next/image"

interface Brand {
    id: string
    businessName: string
    logoPath: string | null
    category: string | null
    featuredOrder: number | null
}

interface MerchantShowcaseSectionProps {
    brands?: Brand[]
}

/**
 * Bare logo — deliberately wrapper-free (no card, border, shadow or background).
 * The logo sits directly on the section surface so the wall reads as a single
 * continuous band of brands rather than a grid of boxes.
 */
function BrandLogo({ brand, apiBaseUrl }: { brand: Brand; apiBaseUrl: string }) {
    const src = brand.logoPath
        ? brand.logoPath.startsWith("http")
            ? brand.logoPath
            : `${apiBaseUrl}/public/${brand.logoPath}`
        : null

    return (
        <div className="parchi-brand-logo flex-shrink-0 mx-7 md:mx-11 flex h-[58px] w-[132px] items-center justify-center select-none md:h-[74px] md:w-[168px]">
            {src ? (
                <Image
                    src={src}
                    alt={brand.businessName}
                    width={168}
                    height={74}
                    className="max-h-full w-auto object-contain transition-opacity duration-300"
                    unoptimized
                />
            ) : (
                <span className="text-center font-heading text-[13px] font-extrabold uppercase leading-tight tracking-[0.04em] text-black/35 md:text-[15px]">
                    {brand.businessName}
                </span>
            )}
        </div>
    )
}

function MarqueeTrack({
    brands,
    apiBaseUrl,
    reverse = false,
    duration,
}: {
    brands: Brand[]
    apiBaseUrl: string
    reverse?: boolean
    duration: number
}) {
    // Repeat enough times that the lane stays full on wide screens even with few
    // brands. Must stay even so the -50% keyframe lands on an exact seam.
    const reps = Math.max(4, Math.ceil(16 / Math.max(brands.length, 1)) * 2)
    const items = Array.from({ length: reps }).flatMap(() => brands)

    return (
        <div className="relative w-full overflow-hidden">
            {/* Edge fades — matched to the section surface (bg-gray-50 / #f9fafb) */}
            <div
                className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 md:w-40"
                style={{ background: "linear-gradient(to right, #f9fafb 0%, transparent 100%)" }}
            />
            <div
                className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 md:w-40"
                style={{ background: "linear-gradient(to left, #f9fafb 0%, transparent 100%)" }}
            />

            <div
                className={`flex items-center py-4 md:py-5 ${reverse ? "parchi-marquee-reverse" : "parchi-marquee"}`}
                style={
                    {
                        width: "max-content",
                        "--dur": `${duration}s`,
                    } as React.CSSProperties
                }
            >
                {items.map((brand, idx) => (
                    <BrandLogo key={`${brand.id}-${idx}`} brand={brand} apiBaseUrl={apiBaseUrl} />
                ))}
            </div>
        </div>
    )
}

export function MerchantShowcaseSection({ brands = [] }: MerchantShowcaseSectionProps) {
    const apiBaseUrl = (() => {
        const u = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        return u.startsWith("http") ? u : `https://${u}`
    })()

    // Split into two rows so we get two scrolling lanes
    const mid = Math.ceil(brands.length / 2)
    const rowA = brands.slice(0, mid)
    const rowB = brands.slice(mid)

    return (
        <>
            {/* Keyframe styles injected once */}
            <style>{`
                @keyframes parchi-marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                @keyframes parchi-marquee-reverse {
                    from { transform: translateX(-50%); }
                    to   { transform: translateX(0); }
                }
                .parchi-marquee {
                    animation: parchi-marquee var(--dur, 95s) linear infinite;
                }
                .parchi-marquee-reverse {
                    animation: parchi-marquee-reverse var(--dur, 115s) linear infinite;
                }
                .parchi-marquee:hover,
                .parchi-marquee-reverse:hover {
                    animation-play-state: paused;
                }
                .parchi-brand-logo img { opacity: 0.78; }
                .parchi-brand-logo:hover img { opacity: 1; }
                @media (prefers-reduced-motion: reduce) {
                    .parchi-marquee,
                    .parchi-marquee-reverse { animation: none; }
                }
            `}</style>

            <section className="w-full overflow-hidden bg-gray-50 py-16 md:py-24">
                {/* Heading */}
                <div className="container mx-auto mb-12 px-4 text-center md:mb-16 md:px-6">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/50">
                        Partner Network
                    </p>
                    <h2 className="mb-3 font-heading text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
                        Trusted by Brands
                    </h2>
                    <p className="mx-auto max-w-[580px] text-muted-foreground md:text-lg/relaxed">
                        From your morning coffee to your late-night cravings, Parchi has you covered.
                    </p>
                </div>

                {/* Carousel rows */}
                {brands.length > 0 ? (
                    <div className="flex flex-col gap-2 md:gap-4">
                        {rowA.length > 0 && (
                            <MarqueeTrack brands={rowA} apiBaseUrl={apiBaseUrl} reverse={false} duration={95} />
                        )}
                        {rowB.length > 0 && (
                            <MarqueeTrack brands={rowB} apiBaseUrl={apiBaseUrl} reverse={true} duration={115} />
                        )}
                    </div>
                ) : (
                    /* Skeleton placeholder shown locally when API is unreachable */
                    <div className="flex flex-col gap-2 md:gap-4">
                        {[95, 115].map((dur, row) => (
                            <div key={row} className="relative w-full overflow-hidden">
                                <div
                                    className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 md:w-40"
                                    style={{ background: "linear-gradient(to right, #f9fafb 0%, transparent 100%)" }}
                                />
                                <div
                                    className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 md:w-40"
                                    style={{ background: "linear-gradient(to left, #f9fafb 0%, transparent 100%)" }}
                                />
                                <div
                                    className={`flex items-center py-4 md:py-5 ${row % 2 === 0 ? "parchi-marquee" : "parchi-marquee-reverse"}`}
                                    style={
                                        {
                                            width: "max-content",
                                            "--dur": `${dur}s`,
                                        } as React.CSSProperties
                                    }
                                >
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="mx-7 h-[58px] w-[132px] flex-shrink-0 animate-pulse rounded-lg bg-gray-200 md:mx-11 md:h-[74px] md:w-[168px]"
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    )
}
