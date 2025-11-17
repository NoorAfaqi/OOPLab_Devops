/**
 * SEO Utilities
 * Provides utilities for generating metadata, structured data, and SEO helpers
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: object;
  noIndex?: boolean;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export function generateMetaTags(config: SEOConfig): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org';
  const title = config.title
    ? `${config.title} | OOPLab - Modern Web Development Solutions`
    : 'OOPLab - Modern Web Development Solutions';
  
  const description = config.description || 'We build innovative web solutions using modern technologies and object-oriented programming principles.';
  
  const keywords = config.keywords
    ? config.keywords.join(', ')
    : 'web development, mobile apps, API development, cloud solutions, Next.js, React, Node.js, TypeScript, software development, digital transformation';
  
  const ogImage = config.ogImage || `${siteUrl}/logo.png`;
  const canonical = config.canonical || siteUrl;

  return {
    'title': title,
    'description': description,
    'keywords': keywords,
    'author': config.author || 'OOPLab Team',
    'robots': config.noIndex ? 'noindex,nofollow' : 'index,follow',
    'googlebot': config.noIndex ? 'noindex,nofollow' : 'index,follow',
    
    // Open Graph tags
    'og:title': title,
    'og:description': description,
    'og:type': config.ogType || 'website',
    'og:url': canonical,
    'og:image': ogImage,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:site_name': 'OOPLab',
    'og:locale': 'en_US',
    
    // Article metadata (if applicable)
    'article:published_time': config.publishedTime || '',
    'article:modified_time': config.modifiedTime || '',
    'article:author': config.author || 'OOPLab Team',
    
    // Canonical URL
    'link': `<link rel="canonical" href="${canonical}" />`,
  };
}

export function generateStructuredData(config: {
  type: 'Organization' | 'WebSite' | 'Article' | 'BlogPosting' | 'Product';
  data: Record<string, any>;
}): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org';
  
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': config.type,
  };

  switch (config.type) {
    case 'Organization':
      return {
        ...baseSchema,
        ...config.data,
        'url': config.data.url || siteUrl,
        'logo': config.data.logo || `${siteUrl}/logo.png`,
        'contactPoint': config.data.contactPoint || {
          '@type': 'ContactPoint',
          'telephone': '+33759152423',
          'contactType': 'Customer Support',
          'email': 'noorafaqi@ooplab.org',
        },
        'sameAs': config.data.sameAs || [
          'https://linkedin.com/company/ooplab',
        ],
      };

    case 'WebSite':
      return {
        ...baseSchema,
        'url': config.data.url || siteUrl,
        'name': config.data.name || 'OOPLab',
        'description': config.data.description || 'Modern Web Development Solutions',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${siteUrl}/blogs?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };

    case 'BlogPosting':
    case 'Article':
      return {
        ...baseSchema,
        'headline': config.data.headline,
        'description': config.data.description,
        'image': config.data.image,
        'datePublished': config.data.datePublished,
        'dateModified': config.data.dateModified || config.data.datePublished,
        'author': {
          '@type': 'Person',
          'name': config.data.author?.name || 'OOPLab Team',
          'url': config.data.author?.url || siteUrl,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'OOPLab',
          'logo': {
            '@type': 'ImageObject',
            'url': `${siteUrl}/logo.png`,
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': config.data.url || siteUrl,
        },
      };

    case 'Product':
      return {
        ...baseSchema,
        'name': config.data.name,
        'description': config.data.description,
        'image': config.data.image,
        'brand': {
          '@type': 'Organization',
          'name': 'OOPLab',
        },
        'aggregateRating': config.data.rating ? {
          '@type': 'AggregateRating',
          'ratingValue': config.data.rating.value,
          'reviewCount': config.data.rating.count,
        } : undefined,
      };

    default:
      return {
        ...baseSchema,
        ...config.data,
      };
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .substring(0, 160); // Limit to 160 characters for meta descriptions
}

export function generateCanonicalUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${cleanPath}`;
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function formatDateForSchema(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString();
}

export const defaultSEOConfig = {
  title: 'OOPLab - Modern Web Development Solutions',
  description: 'We build innovative web solutions using modern technologies and object-oriented programming principles. Expert development team specializing in Next.js, React, Node.js, and cloud solutions.',
  keywords: [
    'web development',
    'mobile apps',
    'API development',
    'cloud solutions',
    'Next.js',
    'React',
    'Node.js',
    'TypeScript',
    'software development',
    'digital transformation',
    'agile development',
    'full stack development',
    'backend development',
    'frontend development',
  ],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org',
  organizationName: 'OOPLab',
};

