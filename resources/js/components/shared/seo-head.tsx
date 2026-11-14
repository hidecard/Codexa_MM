import { Head, usePage } from '@inertiajs/react';

type SeoProps = {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
    structuredData?: Record<string, unknown>;
};

type SharedProps = { url?: string; site?: { name?: string; url?: string } };

export function SeoHead({ title = 'Codexa MM', description = 'Codexa MM brings technology education and software solutions together.', image = '/brand/codexa-wordmark-dark.svg', type = 'website', structuredData }: SeoProps) {
    const { url, site } = usePage<SharedProps>().props;
    const origin = site?.url || (typeof window !== 'undefined' ? window.location.origin : 'https://codexamm.com');
    const canonical = new URL((url || '/').split('?')[0], origin).toString();
    const imageUrl = new URL(image, origin).toString();
    const jsonLd = structuredData ?? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Codexa MM',
        url: origin,
        description,
    };

    return (
        <Head>
            <meta head-key="description" name="description" content={description} />
            <link head-key="canonical" rel="canonical" href={canonical} />
            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:title" property="og:title" content={title} />
            <meta head-key="og:description" property="og:description" content={description} />
            <meta head-key="og:url" property="og:url" content={canonical} />
            <meta head-key="og:image" property="og:image" content={imageUrl} />
            <meta head-key="og:site_name" property="og:site_name" content={site?.name || 'Codexa MM'} />
            <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta head-key="twitter:title" name="twitter:title" content={title} />
            <meta head-key="twitter:description" name="twitter:description" content={description} />
            <meta head-key="twitter:image" name="twitter:image" content={imageUrl} />
            <script head-key="structured-data" type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Head>
    );
}
