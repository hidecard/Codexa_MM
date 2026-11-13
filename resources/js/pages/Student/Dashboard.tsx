import PortalPlaceholder from "../PortalPlaceholder";

export default function Dashboard() {
    return (
        <PortalPlaceholder
            title="Student Dashboard"
            subtitle="Your learning hub is ready for upcoming academy features."
            links={[
                { label: "My courses", href: "/student/my-courses" },
                { label: "Assignments", href: "/student/assignments" },
                { label: "Certificates", href: "/student/certificates" },
                { label: "Profile", href: "/student/profile" },
            ]}
        />
    );
}
