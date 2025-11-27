import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
}

export default function SEO({ title, description, name = 'Ripework', type = 'website', image }: SEOProps) {
    const fullTitle = title ? `${title} | Ripework` : 'Ripework - Premium Digital Marketplace';
    const fullDescription = description || 'Buy and sell premium digital assets with secure crypto payments on Base chain.';

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={fullDescription} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
}
