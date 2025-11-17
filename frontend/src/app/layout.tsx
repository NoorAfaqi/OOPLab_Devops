import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { MacThemeProvider } from "../theme/MacThemeProvider";
import ConditionalLayout from "./components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'),
  title: {
    default: "OOPLab - Modern Web Development Solutions",
    template: "%s | OOPLab"
  },
  description: "We build innovative web solutions using modern technologies and object-oriented programming principles. Expert development team specializing in Next.js, React, Node.js, and cloud solutions.",
  keywords: ["web development", "mobile apps", "API development", "cloud solutions", "Next.js", "React", "Node.js", "TypeScript", "software development", "digital transformation"],
  authors: [
    { name: "Muhammad Noor Afaqi", url: "https://ooplab.org/about" },
    { name: "OOPLab Team", url: "https://ooplab.org/about" }
  ],
  creator: "Muhammad Noor Afaqi",
  publisher: "OOPLab.org",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ooplab.org",
    title: "OOPLab - Modern Web Development Solutions",
    description: "We build innovative web solutions using modern technologies and object-oriented programming principles.",
    siteName: "OOPLab",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "OOPLab Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OOPLab - Modern Web Development Solutions",
    description: "We build innovative web solutions using modern technologies and object-oriented programming principles.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://ooplab.org",
  },
  category: "Technology",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OOPLab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MacThemeProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </MacThemeProvider>
      </body>
    </html>
  );
}
