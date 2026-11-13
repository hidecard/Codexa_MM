import { Head } from "@inertiajs/react";
import { PublicLayout } from "@/components/shared/public-layout";
import { PageHeader } from "@/components/ui/page-header";

export default function Terms() {
    return (
        <PublicLayout>
            <Head title="Terms of Service" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <PageHeader
                    eyebrow="Legal"
                    title="Terms of Service"
                    description="The terms that govern use of Codexa MM services and learning platforms."
                />
                <div className="prose prose-slate mt-10 max-w-none space-y-6 text-slate-700">
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Accounts
                        </h2>
                        <p className="mt-2 leading-7">
                            You are responsible for maintaining the
                            confidentiality of your account credentials and for
                            activity under your account.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Use of services
                        </h2>
                        <p className="mt-2 leading-7">
                            Use Codexa MM lawfully and respectfully. Do not
                            misuse, disrupt, or attempt unauthorized access to
                            the platform or other users’ data.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Content and intellectual property
                        </h2>
                        <p className="mt-2 leading-7">
                            Course materials, site content, and deliverables are
                            protected by applicable rights. Access is granted
                            according to your enrollment or service agreement.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-950">
                            Contact
                        </h2>
                        <p className="mt-2 leading-7">
                            Questions about these terms can be sent to{" "}
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
