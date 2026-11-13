import { Head } from "@inertiajs/react";
import { PublicLayout } from "@/components/shared/public-layout";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

export default function Categories() {
    return (
        <PublicLayout>
            <Head title="Course Categories" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <EmptyState
                    icon={<BookOpen className="size-10" />}
                    title="Course categories"
                    description="Browse courses by category from the main courses page."
                    action={
                        <a
                            href="/courses"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            View all courses →
                        </a>
                    }
                />
            </div>
        </PublicLayout>
    );
}
