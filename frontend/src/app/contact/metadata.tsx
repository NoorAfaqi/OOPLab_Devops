import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team to discuss your project needs. We\'re here to help you bring your ideas to life with innovative technology solutions.',
  keywords: ['contact', 'get in touch', 'reach out', 'project consultation', 'support'],
  openGraph: {
    title: 'Contact Us - OOPLab',
    description: 'Get in touch with our team to discuss your project needs.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/contact`,
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

