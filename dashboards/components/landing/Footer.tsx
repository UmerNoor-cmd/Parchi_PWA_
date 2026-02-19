import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="w-full py-8 bg-primary text-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid gap-8 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {/* Placeholder for white logo version if available */}
                            <span className="text-2xl font-bold font-heading">Parchi</span>
                        </div>
                        <p className="text-sm text-blue-100">
                            Pakistan's first student exclusive discount ecosystem.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Company</h3>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><Link href="#" className="hover:text-white">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Legal</h3>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white">Merchant Agreement</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Download App</h3>
                        <div className="flex flex-col gap-3">
                            <Link href="#" className="transition-transform hover:scale-105 w-fit">
                                <Image
                                    src="/app-store-badge.svg"
                                    alt="Download on the App Store"
                                    width={120}
                                    height={36}
                                    className="h-10 w-auto"
                                />
                            </Link>
                            <Link href="#" className="transition-transform hover:scale-105 w-fit">
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

                <div className="border-t border-blue-600 mt-8 pt-8 text-center text-sm text-blue-200">
                    © {new Date().getFullYear()} Parchi Technologies. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
