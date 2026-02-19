import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy | Parchi",
    description: "Privacy Policy for Parchi Student App.",
}

export default function PrivacyPolicyPage() {
    return (
        <main className="flex flex-col min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-bold font-heading text-primary mb-8">Privacy Policy</h1>

                <div className="prose prose-lg prose-blue max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <p className="lead">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <p>
                        Parchi Technologies ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our mobile application Parchi (the "App"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                    </p>

                    <h3>Collection of Your Information</h3>
                    <p>We may collect information about you in a variety of ways. The information we may collect via the App includes:</p>

                    <h4>Personal Data</h4>
                    <p>
                        Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the App or when you choose to participate in various activities related to the App.
                    </p>

                    <h4>Derivative Data</h4>
                    <p>
                        Information our servers automatically collect when you access the App, such as your native actions that are integral to the App, including liking, re-blogging, or replying to a post, as well as other interactions with the App and other users via server log files.
                    </p>

                    <h3>Use of Your Information</h3>
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the App to:</p>
                    <ul>
                        <li>Create and manage your account.</li>
                        <li>Process your redemptions and interactions with merchants.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Enable user-to-user communications.</li>
                        <li>Send you a newsletter.</li>
                        <li>Request feedback and contact you about your use of the App.</li>
                        <li>Resolve disputes and troubleshoot problems.</li>
                    </ul>

                    <h3>Disclosure of Your Information</h3>
                    <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>

                    <h4>By Law or to Protect Rights</h4>
                    <p>
                        If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                    </p>

                    <h3>Data Security</h3>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h3>Policy for Children</h3>
                    <p>
                        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                    </p>

                    <h3>Contact Us</h3>
                    <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
                    <p className="font-medium">
                        Parchi Technologies<br />
                        Email: support@parchi.pk
                    </p>
                </div>
            </div>
        </main>
    )
}
