import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products & Services',
  description: 'Discover our innovative technology solutions designed to transform your business. We offer comprehensive products and services tailored to your needs.',
  keywords: ['products', 'services', 'technology solutions', 'web development', 'cloud solutions', 'API development', 'digital transformation'],
  openGraph: {
    title: 'Products & Services - OOPLab',
    description: 'Discover our innovative technology solutions designed to transform your business.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/products`,
    type: 'website',
    images: [{ url: '/rotating-card-bg-back.jpeg' }],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/products`,
  },
};

