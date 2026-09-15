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

// Square, rounded tile shared by logos and skeletons so every brand reads the same size
const LOGO_TILE = "mx-3 h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-2xl md:mx-5 md:h-[96px] md:w-[96px]"

// Marquee pace: seconds for one logo to travel one tile width. Higher = slower.
// Speed stays the same no matter how many brands a row holds.
const SECONDS_PER_LOGO_A = 6
const SECONDS_PER_LOGO_B = 7.2

/**
 * Logo as a 1:1 rounded tile (app-icon style). The image covers the tile so
 * wide and square logos end up the same visual size.
 */
function BrandLogo({ brand, apiBaseUrl }: { brand: Brand; apiBaseUrl: string }) {
    const src = brand.logoPath
        ? brand.logoPath.startsWith("http")
            ? brand.logoPath
            : `${apiBaseUrl}/public/${brand.logoPath}`
        : null

    return (
        <div className={`parchi-brand-logo ${LOGO_TILE} flex items-center justify-center bg-white ring-1 ring-black/5 select-none`}>
            {src ? (
                <Image
                    src={src}
                    alt={brand.businessName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover transition-opacity duration-300"
                    unoptimized
                />
            ) : (
                <span className="px-2 text-center font-heading text-[10px] font-extrabold uppercase leading-tight tracking-[0.04em] text-black/35 md:text-[12px]">
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
    secondsPerLogo,
}: {
    brands: Brand[]
    apiBaseUrl: string
    reverse?: boolean
    secondsPerLogo: number
}) {
    // Repeat enough times that the lane stays full on wide screens even with few
    // brands. Must stay even so the -50% keyframe lands on an exact seam.
    const reps = Math.max(4, Math.ceil(16 / Math.max(brands.length, 1)) * 2)
    const items = Array.from({ length: reps }).flatMap(() => brands)
    // One loop scrolls half the track
    const duration = (items.length / 2) * secondsPerLogo

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
                            <MarqueeTrack brands={rowA} apiBaseUrl={apiBaseUrl} reverse={false} secondsPerLogo={SECONDS_PER_LOGO_A} />
                        )}
                        {rowB.length > 0 && (
                            <MarqueeTrack brands={rowB} apiBaseUrl={apiBaseUrl} reverse={true} secondsPerLogo={SECONDS_PER_LOGO_B} />
                        )}
                    </div>
                ) : (
                    /* Skeleton placeholder shown locally when API is unreachable */
                    <div className="flex flex-col gap-2 md:gap-4">
                        {[SECONDS_PER_LOGO_A * 12, SECONDS_PER_LOGO_B * 12].map((dur, row) => (
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
                                            className={`${LOGO_TILE} animate-pulse bg-gray-200`}
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
