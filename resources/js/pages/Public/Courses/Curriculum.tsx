import { Head, Link } from "@inertiajs/react";
import { PublicLayout } from "@/components/shared/public-layout";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft } from "lucide-react";

export default function Curriculum() {
    return (
        <PublicLayout>
            <Head title="Curriculum" />
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
                >
                    <ArrowLeft className="size-4" /> Back to courses
                </Link>
                <div className="mt-8">
                    <EmptyState
                        title="Curriculum view"
                        description="Detailed curriculum will be available on the course page."
                        action={
                            <Link
                                href="/courses"
                                className="text-sm font-semibold text-blue-600"
                            >
                                Browse courses
                            </Link>
                        }
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
