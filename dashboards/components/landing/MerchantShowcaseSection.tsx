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

function BrandCard({ brand, apiBaseUrl }: { brand: Brand; apiBaseUrl: string }) {
    const src = brand.logoPath
        ? brand.logoPath.startsWith("http")
            ? brand.logoPath
            : `${apiBaseUrl}/public/${brand.logoPath}`
        : null

    return (
        <div className="parchi-brand-card flex-shrink-0 mx-3 w-[130px] h-[80px] flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-3 overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
            {src ? (
                <div className="relative w-full h-full">
                    <Image
                        src={src}
                        alt={brand.businessName}
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
            ) : (
                <span className="text-[11px] font-bold text-gray-500 text-center leading-snug">
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
    duration = 40,
}: {
    brands: Brand[]
    apiBaseUrl: string
    reverse?: boolean
    duration?: number
}) {
    // Quadruple so the loop is completely seamless regardless of brand count
    const items = [...brands, ...brands, ...brands, ...brands]

    return (
        <div className="relative w-full overflow-hidden">
            {/* Left fade */}
            <div
                className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 z-10"
                style={{ background: "linear-gradient(to right, #f9fafb 0%, transparent 100%)" }}
            />
            {/* Right fade */}
            <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 z-10"
                style={{ background: "linear-gradient(to left, #f9fafb 0%, transparent 100%)" }}
            />

            <div
                className={`flex items-center py-3 ${reverse ? "parchi-marquee-reverse" : "parchi-marquee"}`}
                style={
                    {
                        width: "max-content",
                        "--dur": `${duration}s`,
                    } as React.CSSProperties
                }
            >
                {items.map((brand, idx) => (
                    <BrandCard key={`${brand.id}-${idx}`} brand={brand} apiBaseUrl={apiBaseUrl} />
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
                    animation: parchi-marquee var(--dur, 40s) linear infinite;
                }
                .parchi-marquee-reverse {
                    animation: parchi-marquee-reverse var(--dur, 40s) linear infinite;
                }
                .parchi-marquee:hover,
                .parchi-marquee-reverse:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <section className="w-full py-14 md:py-20 bg-gray-50 overflow-hidden">
                {/* Heading */}
                <div className="container px-4 md:px-6 mx-auto text-center mb-12">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/50 mb-3">
                        Partner Network
                    </p>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-heading text-primary mb-3">
                        Trusted by Brands
                    </h2>
                    <p className="max-w-[580px] mx-auto text-muted-foreground md:text-lg/relaxed">
                        From your morning coffee to your late-night cravings, Parchi has you covered.
                    </p>
                </div>

                {/* Carousel rows */}
                {brands.length > 0 ? (
                    <div className="flex flex-col gap-5">
                        {rowA.length > 0 && (
                            <MarqueeTrack brands={rowA} apiBaseUrl={apiBaseUrl} reverse={false} duration={38} />
                        )}
                        {rowB.length > 0 && (
                            <MarqueeTrack brands={rowB} apiBaseUrl={apiBaseUrl} reverse={true} duration={44} />
                        )}
                    </div>
                ) : (
                    /* Skeleton placeholder shown locally when API is unreachable */
                    <div className="flex flex-col gap-5">
                        {[38, 44].map((dur, row) => (
                            <div key={row} className="relative w-full overflow-hidden">
                                <div
                                    className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 z-10"
                                    style={{ background: "linear-gradient(to right, #f9fafb 0%, transparent 100%)" }}
                                />
                                <div
                                    className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 z-10"
                                    style={{ background: "linear-gradient(to left, #f9fafb 0%, transparent 100%)" }}
                                />
                                <div
                                    className={`flex items-center py-3 ${row % 2 === 0 ? "parchi-marquee" : "parchi-marquee-reverse"}`}
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
                                            className="flex-shrink-0 mx-3 w-[130px] h-[80px] rounded-2xl bg-gray-200 animate-pulse"
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
