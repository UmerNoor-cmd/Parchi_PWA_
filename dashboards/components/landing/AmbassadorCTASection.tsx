import Link from "next/link"

// Closing CTA. Ambassador-only by design — merchants already get their call to
// action inside MerchantSection, so repeating it here just split the ask.
const POINTS = ["Performance rewards", "CV-ready experience", "Insider access"]

export function AmbassadorCTASection() {
    return (
        <section id="ambassador" className="w-full scroll-mt-16 bg-primary py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center lg:gap-16">

                    {/* Pitch */}
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-block w-fit rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-sm text-white">
                            Campus Programme
                        </div>

                        <h2 className="mb-4 font-heading text-3xl font-bold tracking-tighter text-white sm:text-4xl">
                            Become a Campus Ambassador.
                        </h2>

                        <p className="mb-7 max-w-lg text-blue-100 md:text-lg/relaxed">
                            Run Parchi where you study. Bring the brands your friends already love onto the
                            platform, grow the network on your campus, and get paid for it.
                        </p>

                        <ul className="flex flex-wrap gap-2">
                            {POINTS.map((p) => (
                                <li
                                    key={p}
                                    className="rounded-full border border-white/20 px-3.5 py-1.5 font-sans text-[12px] font-medium text-blue-100"
                                >
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/campus-ambassador"
                        className="group inline-flex w-full flex-shrink-0 items-center justify-center gap-2.5 rounded-lg bg-white px-8 py-4 font-sans text-[15px] font-bold text-primary transition-colors hover:bg-blue-50 sm:w-auto"
                    >
                        Apply as an ambassador
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>

                </div>
            </div>
        </section>
    )
}
