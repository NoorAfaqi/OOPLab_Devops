import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Insights',
  description: 'Stay updated with the latest insights, tutorials, and industry trends from our development team. Discover expert knowledge and practical tips to enhance your skills.',
  keywords: ['blog', 'articles', 'tutorials', 'web development', 'programming', 'technology insights', 'Next.js', 'React', 'software development'],
  openGraph: {
    title: 'Blog & Insights - OOPLab',
    description: 'Stay updated with the latest insights, tutorials, and industry trends from our development team.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/blogs`,
    type: 'website',
    images: [{ url: '/blog-9-4.jpg' }],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/blogs`,
  },
};

