"use client";

import Head from 'next/head';
import { SEOConfig } from '@/utils/seo';
import { generateMetaTags, generateStructuredData } from '@/utils/seo';

interface SEOProps {
  config: SEOConfig;
  schema?: object;
}

export function SEO({ config, schema }: SEOProps) {
  const metaTags = generateMetaTags(config);

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="title" content={metaTags.title} />
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="author" content={metaTags.author} />
      <meta name="robots" content={metaTags.robots} />
      <meta name="googlebot" content={metaTags.googlebot} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={metaTags['og:type']} />
      <meta property="og:url" content={metaTags['og:url']} />
      <meta property="og:title" content={metaTags['og:title']} />
      <meta property="og:description" content={metaTags['og:description']} />
      <meta property="og:image" content={metaTags['og:image']} />
      <meta property="og:image:width" content={metaTags['og:image:width']} />
      <meta property="og:image:height" content={metaTags['og:image:height']} />
      <meta property="og:site_name" content={metaTags['og:site_name']} />
      <meta property="og:locale" content={metaTags['og:locale']} />

      {/* Article Metadata */}
      {metaTags['article:published_time'] && (
        <>
          <meta property="article:published_time" content={metaTags['article:published_time']} />
          <meta property="article:modified_time" content={metaTags['article:modified_time']} />
          <meta property="article:author" content={metaTags['article:author']} />
        </>
      )}

      {/* Canonical URL */}
      {metaTags.link && (
        <link rel="canonical" href={config.canonical || metaTags['og:url']} />
      )}

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  );
}

