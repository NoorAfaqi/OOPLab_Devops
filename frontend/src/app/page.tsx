"use client";

import Link from "next/link";
import { Box, Stack, Chip } from "@mui/material";
import { CheckCircle, ArrowForward } from "@mui/icons-material";
import { Analytics } from "@vercel/analytics/next";
import { 
  HeroSection, 
  CTASection, 
  ServicesGrid, 
  TechnologiesCarousel,
  Container, 
  Heading, 
  Text, 
  CustomButton,
  CustomCard 
} from "../components";
import { SERVICES, TECHNOLOGIES } from "../constants";
import { useEffect } from "react";
import { generateStructuredData } from "@/utils/seo";

export default function Home() {
  useEffect(() => {
    // Add Organization structured data
    const organizationSchema = generateStructuredData({
      type: 'Organization',
      data: {
        name: 'OOPLab',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org',
        logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/logo.png`,
        description: 'We build innovative web solutions using modern technologies and object-oriented programming principles.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
        },
      },
    });

    // Add Website structured data
    const websiteSchema = generateStructuredData({
      type: 'WebSite',
      data: {
        name: 'OOPLab',
        description: 'Modern Web Development Solutions',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org',
      },
    });

    // Inject structured data
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(organizationSchema);
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(websiteSchema);
    document.head.appendChild(script2);

    return () => {
      script1.remove();
      script2.remove();
    };
  }, []);
  const features = [
    "Expert Development Team",
    "Agile Development Process",
    "24/7 Support & Maintenance",
  ];

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>
      {/* Hero Section */}
      <HeroSection
        title="OOPLab"
        description="Join our dynamic team of passionate, forward-thinking professionals and be part of shaping the future together!"
        primaryAction={{
          label: "Our Services",
          href: "/products",
        }}
        secondaryAction={{
          label: "Get Started",
          href: "/contact",
        }}
        backgroundImage="/bg-presentation.jpg"
        textColor="white"
      />
      <Analytics />
      {/* Services Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Heading variant="h2" align="center" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: 2 }}>
              Our Services
            </Heading>
            <Text 
              variant="body1" 
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto', 
                lineHeight: 1.6,
                fontSize: '1.125rem',
                textAlign: 'center'
              }}
            >
              We offer comprehensive technology solutions to help your business grow and succeed in the digital world.
            </Text>
          </Box>
          <ServicesGrid services={SERVICES} />
        </Container>
      </Box>

      {/* Technologies Carousel Section */}
      <TechnologiesCarousel technologies={TECHNOLOGIES} />

      {/* Why Choose Us Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '1fr 1fr',
              },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Box>
              <Heading variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: 3 }}>
                Why Choose OOPLab?
              </Heading>
              
              <Stack spacing={3}>
                {features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckCircle
                      sx={{
                        color: '#007AFF',
                        mr: 2,
                        mt: 0.5,
                        fontSize: '1.5rem',
                      }}
                    />
                    <Box>
                      <Heading variant="h6" sx={{ fontSize: '1.25rem', mb: 1 }}>
                        {feature}
                      </Heading>
                      <Text>
                        {feature === "Expert Development Team" && "Our experienced developers specialize in modern technologies and best practices."}
                        {feature === "Agile Development Process" && "We follow agile methodologies to ensure timely delivery and continuous improvement."}
                        {feature === "24/7 Support & Maintenance" && "Round-the-clock support and maintenance to keep your applications running smoothly."}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <CustomCard
              sx={{
                p: 4,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)'
                  : 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
                border: (theme) => theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 122, 255, 0.1)',
              }}
            >
              <Heading variant="h4" align="center" sx={{ fontSize: '1.75rem', mb: 2 }}>
                Ready to Start Your Project?
              </Heading>
              <Text variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
                Let&apos;s discuss your requirements and create a solution that meets your business needs.
              </Text>
              <Stack spacing={2}>
                <CustomButton
                  component={Link}
                  href="/contact"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: '#007AFF',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#0056CC',
                    },
                  }}
                >
                  Get Free Consultation
                </CustomButton>
                <CustomButton
                  component={Link}
                  href="/blogs"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#007AFF',
                    color: '#007AFF',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 122, 255, 0.04)',
                      borderColor: '#0056CC',
                    },
                  }}
                >
                  Read Our Blogs
                </CustomButton>
              </Stack>
            </CustomCard>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <CTASection
        title="Ready to Transform Your Business?"
        description="Join hundreds of satisfied clients who have chosen OOPLab for their technology needs."
        primaryAction={{
          label: "Start Your Project Today",
          href: "/contact",
        }}
        secondaryAction={{
          label: "Learn More About Us",
          href: "/about",
        }}
        backgroundImage="/bg-coworking.jpeg"
        textColor="white"
      />
    </Box>
  );
}