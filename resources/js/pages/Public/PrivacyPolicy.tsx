import { Head } from "@inertiajs/react";
import { PublicLayout } from "@/components/shared/public-layout";
import { PageHeader } from "@/components/ui/page-header";

export default function PrivacyPolicy() {
    return (
        <PublicLayout>
            <Head title="Privacy Policy" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader
                    eyebrow="Legal"
                    title="Privacy Policy"
                    description="How Codexa MM collects, uses, and protects your information."
                />
                <div className="prose prose-slate mt-10 max-w-none space-y-6 text-slate-700">
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Information we collect
                        </h2>
                        <p className="mt-2 leading-7">
                            We collect information you provide when registering,
                            enrolling in courses, contacting us, or using our
                            services, such as your name, email, and relevant
                            account details.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            How we use information
                        </h2>
                        <p className="mt-2 leading-7">
                            We use information to provide learning and service
                            experiences, communicate updates, improve the
                            platform, and maintain security.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Data protection
                        </h2>
                        <p className="mt-2 leading-7">
                            We apply reasonable technical and organizational
                            measures to protect your data. Access to sensitive
                            information is limited to authorized purposes.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Contact
                        </h2>
                        <p className="mt-2 leading-7">
                            For privacy questions, contact us at{" "}
                            <a
                                className="font-semibold text-blue-600"
                                href="mailto:hello@codexamm.com"
                            >
                                hello@codexamm.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
