import Image from "next/image"
import { Trophy, Star, Gift } from "lucide-react"

// Real app screenshots (739×1600), shown in CSS phone frames
const SCREEN_WIDTH = 739
const SCREEN_HEIGHT = 1600

function PhoneShot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
    return (
        <div
            className={`overflow-hidden rounded-[1.6rem] border-[5px] border-gray-950 bg-gray-950 shadow-2xl shadow-black/40 md:rounded-[2.2rem] md:border-[7px] ${className}`}
        >
            <Image
                src={src}
                alt={alt}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                sizes="(min-width: 768px) 240px, 160px"
                className="h-auto w-full rounded-[1.25rem] md:rounded-[1.7rem]"
            />
        </div>
    )
}

export function StudentFeaturesSection() {
    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-primary relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">

                    {/* Left Side: Content */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <div className="inline-block rounded-lg bg-white/10 px-3 py-1 text-sm text-secondary mb-2 border border-white/20">
                                For the Hustlers
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading text-white">
                                More Than Just Discounts.
                            </h2>
                            <p className="max-w-[600px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Parchi gamifies your savings. Compete with friends, earn badges, and unlock elite status.
                            </p>
                        </div>

                        <div className="grid gap-6 mt-8 text-white">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Leaderboards</h3>
                                    <p className="text-blue-100">See who's saving the most on campus. Top savers get exclusive monthly rewards.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <Star className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Leaderboard Rewards</h3>
                                    <p className="text-blue-100">Top savers get exclusive status and lifetime premium perks.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Loyalty Rewards</h3>
                                    <p className="text-blue-100">Every 5 redemptions at a partner brand unlocks a bonus freebie or massive discount.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: app screenshots — home in front, deal page and leaderboard fanned behind */}
                    <div className="relative mx-auto mt-6 flex h-[380px] w-full max-w-[340px] items-center justify-center sm:h-[460px] sm:max-w-[420px] md:h-[560px] md:max-w-[520px] lg:mt-0">
                        <PhoneShot
                            src="/app-screens/merchant.jpg"
                            alt="Parchi merchant page with a 20% off exclusive deal and loyalty progress"
                            className="absolute left-0 top-1/2 w-[38%] -translate-y-[46%] -rotate-6"
                        />
                        <PhoneShot
                            src="/app-screens/leaderboard.jpg"
                            alt="Parchi all-time student leaderboard"
                            className="absolute right-0 top-1/2 w-[38%] -translate-y-[54%] rotate-6"
                        />
                        <PhoneShot
                            src="/app-screens/home.jpg"
                            alt="Parchi home screen with the student ID card and top brands"
                            className="relative z-10 w-[46%]"
                        />
                    </div>

                </div>
            </div>
        </section>
    )
}
