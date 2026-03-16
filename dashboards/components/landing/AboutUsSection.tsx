const STATS = [
    { num: "50", sup: "k+", label: "Students saving" },
    { num: "200", sup: "+", label: "Partner restaurants" },
    { num: "40", sup: "+", label: "Cities nationwide" },
]

const PILLARS = [
    {
        num: "01",
        title: "Verified Exclusivity",
        desc: "Parchi stays a sanctuary for students only. Our verification system ensures that — no exceptions.",
    },
    {
        num: "02",
        title: "National Reach",
        desc: "From Karachi to Kashmir — one unified network that recognizes your student status everywhere you go.",
    },
    {
        num: "03",
        title: "Purpose-Driven",
        desc: "Your student ID should be the most powerful card in your wallet. We built everything around that belief.",
    },
]

export function AboutUsSection() {
    return (
        <section className="w-full overflow-hidden bg-background">

            {/* ── BAND 1: Yellow hero ── */}
            <div className="relative overflow-hidden bg-secondary px-6 pb-14 pt-16 md:px-14 md:pb-16 md:pt-20">
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full border-[56px] border-black/[0.05]" />

                <p className="mb-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-black/40">
                    <span className="inline-block h-px w-7 bg-black/30" />
                    Pakistan's first student ecosystem
                </p>

                <h2 className="mb-10 max-w-3xl font-heading text-[clamp(52px,8vw,96px)] font-extrabold leading-[0.92] tracking-[-0.04em] text-black">
                    Your ID.<br />
                    Your <span className="text-primary">Edge.</span>
                </h2>

                <div className="flex flex-wrap items-end justify-between gap-6">
                    <p className="max-w-lg text-[15px] leading-[1.85] text-black/60">
                        Parchi is Pakistan's first closed-loop ecosystem built exclusively for students —
                        connecting the country's most ambitious demographic directly to the nation's leading
                        brands. Not just deals. Infrastructure.
                    </p>
                    <span className="flex-shrink-0 rounded-sm bg-primary px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        Est. 2024 · Karachi
                    </span>
                </div>
            </div>

            {/* ── BAND 2: Midnight Stats ── */}
            <div className="grid grid-cols-3 divide-x divide-white/5 bg-primary">
                {STATS.map((s, i) => (
                    <div key={i} className="flex flex-col items-center px-4 py-10 text-center md:px-14 md:py-16">
                        <div className="font-heading text-[clamp(24px,5.5vw,62px)] font-extrabold leading-none tracking-[-0.04em] text-secondary">
                            {s.num}
                            <sup className="align-super text-[0.4em] text-white">{s.sup}</sup>
                        </div>
                        <div className="mx-auto mt-3 max-w-[80px] font-mono text-[9px] uppercase leading-tight tracking-[0.1em] text-white/40 md:max-w-none md:text-[11px]">
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── BAND 3: Pillars ── */}
            <div className="grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {PILLARS.map((p, i) => (
                    <div
                        key={i}
                        className="group relative overflow-hidden px-10 py-11 md:px-14"
                    >
                        {/* Hover accent line */}
                        <div className="absolute left-0 right-0 top-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />

                        <span className="mb-5 block font-mono text-[10px] tracking-[0.14em] text-muted-foreground/50">
                            {p.num}
                        </span>
                        <h3 className="mb-3 font-heading text-[17px] font-extrabold leading-[1.2] tracking-[-0.01em] text-foreground">
                            {p.title}
                        </h3>
                        <p className="text-[13px] leading-[1.85] text-muted-foreground">
                            {p.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── BAND 4: Quote + pull stats ── */}
            <div className="grid min-h-[260px] grid-cols-1 sm:grid-cols-2">

                {/* Left: blue quote */}
                <div className="flex flex-col justify-between gap-8 bg-primary px-10 py-12 md:px-14">
                    <div>
                        <div className="-mb-3 font-serif text-[72px] leading-none text-white/20">"</div>
                        <p className="font-heading text-[clamp(18px,2.4vw,26px)] font-extrabold italic leading-[1.35] tracking-[-0.01em] text-white">
                            More than an app.<br />
                            The <span className="text-secondary">new standard</span><br />
                            for the Pakistani student.
                        </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                        — Parchi Mission Statement
                    </p>
                </div>

                {/* Right: yellow pull stats */}
                <div className="flex flex-col justify-center bg-secondary px-8 py-12 md:px-14">
                    <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-black/40 md:text-left">
                        Why it matters
                    </p>

                    <div className="grid grid-cols-2 gap-8 md:flex md:flex-col md:gap-7">
                        <div className="flex flex-col items-center text-center md:items-start md:text-left">
                            <div className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-none tracking-[-0.04em] text-black">
                                ₨2<span className="text-primary">M+</span>
                            </div>
                            <div className="mt-2 max-w-[110px] text-[11px] leading-tight tracking-[0.02em] text-black/50 md:max-w-none md:text-[12px]">
                                Saved by students this month alone
                            </div>
                        </div>

                        <div className="hidden h-px w-10 bg-black/15 md:block" />

                        <div className="flex flex-col items-center text-center md:items-start md:text-left">
                            <div className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-none tracking-[-0.04em] text-black">
                                1 <span className="text-primary">ID</span>
                            </div>
                            <div className="mt-2 max-w-[110px] text-[11px] leading-tight tracking-[0.02em] text-black/50 md:max-w-none md:text-[12px]">
                                That's all it takes to start saving
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </section>
    )
}