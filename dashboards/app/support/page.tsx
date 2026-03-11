import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Mail, Clock, ShieldCheck, HelpCircle, Info } from "lucide-react"


export const metadata: Metadata = {
    title: "Support | Parchi",
    description: "Support and FAQs for Parchi Student App. Connect with us for help.",
}

export default function SupportPage() {
    const faqs = [
        {
            question: "How do I upload my CNIC/Student ID?",
            answer: "Go to your Profile settings, select 'Verification', and follow the prompts to upload a clear photo of your CNIC or Student ID. Ensure all details are legible and the photo is well-lit."
        },
        {
            question: "Why is my reward not showing up?",
            answer: "Rewards typically appear instantly after a successful redemption. If it's missing, try refreshing the app. If it still doesn't show, ensure you have a stable internet connection and that the merchant has confirmed the transaction."
        },
        {
            question: "How do I use a deal at a restaurant or shop?",
            answer: "Find your deal in the Parchi app, show your digital Parchi ID at the counter, and let the merchant scan or verify it. Your discount will be applied immediately."
        },
        {
            question: "My institute isn't listed. What should I do?",
            answer: "We are expanding daily! Select 'Request Institute' in the signup or profile menu, and our team will prioritize adding your campus to our network."
        },
        {
            question: "Is my data shared with brands?",
            answer: "No. We provide brands with anonymous, aggregated insights only. Your personal information is never sold or shared for marketing purposes."
        },
    ]

    return (
        <main className="flex flex-col min-h-screen bg-slate-50">
            {/* Header / Hero Section */}
            <div className="bg-primary text-white py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-3 rounded-2xl shadow-lg">
                            <Image
                                src="/Parchi-Icon-with-new-blue.png"
                                alt="Parchi Icon"
                                width={60}
                                height={60}
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">
                        Parchi Student Support
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                        Need help with your rewards or verification? We're here to ensure you have the best student experience.
                    </p>
                    <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/30 border border-blue-400/50 text-sm font-medium">
                        App Version v1.1 • Active Support
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Left Column: Contact info & Troubleshooting */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Direct Contact */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <Mail className="w-6 h-6" />
                                <h2 className="text-xl font-bold font-heading">Direct Contact</h2>
                            </div>
                            <p className="text-slate-600 mb-6">
                                Reach out to our dedicated support team for any account-related issues.
                            </p>
                            <a
                                href="mailto:support@parchi.pk"
                                className="block w-full py-3 px-4 bg-primary text-white text-center rounded-xl font-bold transition-transform active:scale-95 hover:bg-primary/90"
                            >
                                Email: parchipakistan@gmail.com
                            </a>
                            <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span>Response Time: 24-48 hours</span>
                            </div>
                        </section>

                        {/* Troubleshooting */}
                        <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-4 text-blue-700">
                                <HelpCircle className="w-6 h-6" />
                                <h2 className="text-xl font-bold font-heading">Troubleshooting</h2>
                            </div>
                            <ul className="space-y-3 text-sm text-blue-800/80">
                                <li className="flex gap-2">
                                    <span className="font-bold">•</span>
                                    <span>Ensure you have the latest version of the app from the Store.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">•</span>
                                    <span>Try clearing your app cache if images are not loading.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">•</span>
                                    <span>Check if Camera permissions are enabled for verification.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">•</span>
                                    <span>Restart the app if a redemption seems stuck.</span>
                                </li>
                            </ul>
                        </section>

                        {/* Legal Quick Links */}
                        <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="w-6 h-6 text-blue-400" />
                                <h2 className="text-xl font-bold font-heading text-blue-100">Compliance</h2>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                Your privacy and security are paramount. Review our official policies below.
                            </p>
                            <Link
                                href="/privacy-policy"
                                className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors group"
                            >
                                <span className="text-sm font-medium">Privacy Policy</span>
                                <Info className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            </Link>
                        </section>
                    </div>

                    {/* Right Column: FAQs */}
                    <div className="lg:col-span-2">
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-3xl font-bold font-heading text-primary mb-8">
                                Frequently Asked Questions
                            </h2>
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-100">
                                        <AccordionTrigger className="text-left font-bold text-lg py-5 hover:text-primary transition-colors">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                <p className="text-slate-500 text-sm italic">
                                    Can't find what you're looking for? Scroll back up to email us directly.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Footer space filler */}
            <div className="mt-auto py-12 text-center text-slate-400 text-sm">
                © {new Date().getFullYear()} Parchi Technologies. Bringing value to every student.
            </div>
        </main>
    )
}
