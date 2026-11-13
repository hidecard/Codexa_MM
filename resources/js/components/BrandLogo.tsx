import { Link } from "@inertiajs/react";

type BrandLogoProps = {
    href?: string;
    variant?: "mark" | "wordmark" | "dark";
    className?: string;
};

export function BrandLogo({
    href = "/",
    variant = "wordmark",
    className = "",
}: BrandLogoProps) {
    const asset =
        variant === "mark"
            ? "/brand/codexa-mark.svg"
            : variant === "dark"
              ? "/brand/codexa-wordmark-dark.svg"
              : "/brand/codexa-wordmark.svg";
    const width = variant === "mark" ? 42 : 174;
    const image = (
        <img
            src={asset}
            width={width}
            alt="Codexa MM — Learn. Build. Innovate."
            className={`block h-auto ${className}`}
        />
    );

    return href ? (
        <Link href={href} aria-label="Codexa MM home">
            {image}
        </Link>
    ) : (
        image
    );
}
