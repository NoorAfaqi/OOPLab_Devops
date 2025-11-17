import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'We are a technology company focused on innovative solutions and cutting-edge development. Our mission is to transform ideas into powerful digital experiences that drive business success.',
  keywords: ['about', 'company', 'team', 'mission', 'technology company', 'software development', 'web development team'],
  openGraph: {
    title: 'About Us - OOPLab',
    description: 'Learn about our mission to transform ideas into powerful digital experiences.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/about`,
    type: 'website',
    images: [{ url: '/bg-about-us.jpg' }],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/about`,
  },
};

