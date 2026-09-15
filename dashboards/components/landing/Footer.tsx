import Link from "next/link"
import Image from "next/image"

const APP_STORE = "https://apps.apple.com/app/parchi-the-student-app/id6760251460"
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.parchi.student&hl=en"

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
    {
        heading: "Company",
        links: [
            { label: "About Us", href: "/#about" },
            { label: "Partner Brands", href: "/#brands" },
            { label: "FAQ", href: "/#faq" },
            { label: "Support", href: "/support" },
        ],
    },
    {
        heading: "Join Parchi",
        links: [
            { label: "Become a Merchant", href: "/become-a-merchant" },
            { label: "Campus Ambassador", href: "/campus-ambassador" },
            { label: "Merchant Login", href: "/portal" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Delete My Account", href: "/account-deletion" },
            { label: "Contact Us", href: "mailto:support@parchi.pk" },
        ],
    },
]

export function Footer() {
    return (
        <footer className="w-full bg-primary py-12 text-white md:py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <Image
                                src="/ParchiFullTextNewBlue.svg"
                                alt="Parchi"
                                width={120}
                                height={40}
                                className="h-9 w-auto brightness-0 invert"
                            />
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-blue-100">
                            Pakistan's first student exclusive discount ecosystem.
                        </p>
                    </div>

                    {COLUMNS.map((col) => (
                        <div key={col.heading} className="space-y-4">
                            <h3 className="text-lg font-bold">{col.heading}</h3>
                            <ul className="space-y-2.5 text-sm text-blue-100">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="transition-colors hover:text-white">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Download */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Download App</h3>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={APP_STORE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-fit transition-transform hover:scale-105"
                            >
                                <Image
                                    src="/app-store-badge.svg"
                                    alt="Download on the App Store"
                                    width={120}
                                    height={36}
                                    className="h-10 w-auto"
                                />
                            </Link>
                            <Link
                                href={PLAY_STORE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-fit transition-transform hover:scale-105"
                            >
                                <Image
                                    src="/google-play-badge.svg"
                                    alt="Get it on Google Play"
                                    width={120}
                                    height={36}
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="mt-10 border-t border-blue-600 pt-8 text-center text-sm text-blue-200">
                    © {new Date().getFullYear()} Parchi Technologies. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
