"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  CardMedia,
  Divider,
} from "@mui/material";
import {
  Code,
  Palette,
  BusinessCenter,
  Group,
  TrendingUp,
  Support,
  Star,
  Timeline,
  Lightbulb,
  Grade,
  Handshake,
  Visibility,
  EmojiEvents,
  TrendingUp as GrowthIcon,
} from "@mui/icons-material";
import { HeroSection } from "../../components";
import { Analytics } from "@vercel/analytics/next";

export default function About() {
  const teamMembers = [
    {
      name: "Muhammad Noor Afaqi",
      designation: "Founder & CEO",
      image: "/persons/team-5.jpg",
      quote: "Oversee your organization, make pivotal decisions, and take strategic moves, that's how leadership works",
      color: '#007AFF',
    },
    {
      name: "Muhammad Zaraiz",
      designation: "Project Manager",
      image: "/persons/ivana-squares.jpg",
      quote: "Management is how you you lead the team towards achieving goals within constraints.",
      color: '#FF9500',
    },
    {
      name: "Asawir Shafiq",
      designation: "AI Engineer",
      image: "/persons/ivana-square.jpeg",
      quote: "Redefine the impossible, build intelligence that shapes the future!",
      color: '#34C759',
    },
    {
      name: "Rehan Tariq",
      designation: "Cheif Designer",
      image: "/persons/bruce-mars.jpg",
      quote: "Keep your designs ahead of the curve, ignite new ideas, and set bold new standards.",
      color: '#5856D6',
    },
  ];

  const whyChooseUs = [
    {
      icon: <Group sx={{ fontSize: 48, color: '#007AFF' }} />,
      text: "Expert development team",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#34C759' }} />,
      text: "Modern technology stack",
    },
    {
      icon: <Code sx={{ fontSize: 48, color: '#5856D6' }} />,
      text: "Agile development process",
    },
    {
      icon: <Support sx={{ fontSize: 48, color: '#FF9500' }} />,
      text: "24/7 support and maintenance",
    },
  ];

  const companyValues = [
    {
      name: 'Innovation',
      description: 'We embrace cutting-edge technologies and creative solutions to deliver exceptional results.',
      icon: <Lightbulb sx={{ fontSize: 48, color: '#007AFF' }} />,
    },
    {
      name: 'Quality',
      description: 'We maintain the highest standards in everything we do, ensuring excellence in every project.',
      icon: <Grade sx={{ fontSize: 48, color: '#34C759' }} />,
    },
    {
      name: 'Collaboration',
      description: 'We work closely with our clients as partners, fostering open communication and teamwork.',
      icon: <Handshake sx={{ fontSize: 48, color: '#5856D6' }} />,
    },
    {
      name: 'Transparency',
      description: 'We believe in clear communication, honest feedback, and transparent processes.',
      icon: <Visibility sx={{ fontSize: 48, color: '#FF9500' }} />,
    },
    {
      name: 'Excellence',
      description: 'We strive for perfection in every detail, delivering solutions that exceed expectations.',
      icon: <EmojiEvents sx={{ fontSize: 48, color: '#FF2D92' }} />,
    },
    {
      name: 'Growth',
      description: 'We continuously learn, adapt, and evolve to stay ahead in the ever-changing tech landscape.',
      icon: <GrowthIcon sx={{ fontSize: 48, color: '#30D158' }} />,
    },
  ];


  const stats = [
    { number: "50+", label: "Projects Completed", icon: <Code />, color: '#34C759' },
    { number: "25+", label: "Happy Clients", icon: <Group />, color: '#FF9500' },
    { number: "5+", label: "Years Experience", icon: <Timeline />, color: '#5856D6' },
    { number: "99%", label: "Client Satisfaction", icon: <Star />, color: '#FF2D92' },
  ];

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>
      {/* Hero Section with Background Image */}
      <HeroSection
        title="About"
        subtitle="OOPLab"
        description="We are a technology company focused on innovative solutions and cutting-edge development. Our mission is to transform ideas into powerful digital experiences that drive business success."
        primaryAction={{
          label: "Our Services",
          href: "/products",
        }}
        secondaryAction={{
          label: "Contact Us",
          href: "/contact",
        }}
        backgroundImage="/bg-about-us.jpg"
        textColor="white"
      />
      <Analytics />
      {/* Stats Section */}
      <Box sx={{ 
        py: 10, 
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0F0F0F' : '#F9F9F9',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
              }}
            >
              Our Impact
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: '1.25rem',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              Numbers that speak to our commitment to excellence and client success.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 4,
              justifyContent: 'center',
            }}
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                sx={{
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(0, 0, 0, 0.4)'
                      : '0 8px 25px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  p: 0,
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: stat.color,
                        mx: 'auto',
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: '2.5rem',
                      color: stat.color,
                      textAlign: 'center',
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ 
        py: 12, 
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#FFFFFF',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 4,
                color: 'text.primary',
              }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: '1.25rem',
                maxWidth: '900px',
                mx: 'auto',
                lineHeight: 1.8,
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              We deliver high-quality software solutions that help businesses grow and succeed in the digital world. Our team combines technical expertise with creative problem-solving to build applications that make a difference.
            </Typography>
          </Box>
        </Container>
      </Box>


      {/* Team Section */}
      <Box sx={{ 
        py: 12, 
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0F0F0F' : '#F9F9F9',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
              }}
            >
              Our Team
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: '1.25rem',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              Meet the talented individuals who make OOPLab a leading technology company.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 4,
              maxWidth: '1200px',
              mx: 'auto',
            }}
          >
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: 4,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 16px 48px rgba(0, 0, 0, 0.5)'
                      : '0 16px 48px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .member-image': {
                      transform: 'scale(1.1)',
                    },
                    '& .member-overlay': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Image Container with Modern Gradient */}
                <Box sx={{ 
                  position: 'relative', 
                  height: { xs: '300px', sm: '350px', md: '400px' }, 
                  overflow: 'hidden' 
                }}>
                  <Box
                    className="member-image"
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url('${member.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  
                  {/* Color to Transparent Gradient Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}40 30%, transparent 70%)`,
                      opacity: 0.8,
                    }}
                  />
                  
                  {/* Quote Overlay */}
                  <Box
                    className="member-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${member.color}CC, ${member.color}99, ${member.color}66)`,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        textAlign: 'center',
                        px: 3,
                        fontSize: '0.95rem',
                        lineHeight: 1.4,
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      "{member.quote}"
                  </Typography>
                  </Box>
                  
                  {/* Bottom Gradient for Text Readability */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: `linear-gradient(transparent, ${member.color}20, ${member.color}40)`,
                    }}
                  />
                </Box>

                <CardContent sx={{ 
                  p: 3,
                  background: `linear-gradient(180deg, transparent 0%, ${member.color}05 100%)`,
                  position: 'relative',
                }}>
                  {/* Name and Designation */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        fontSize: '1.25rem',
                        color: 'text.primary',
                        background: `linear-gradient(135deg, ${member.color}, ${member.color}CC)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: member.color,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: `linear-gradient(90deg, ${member.color}, ${member.color}80)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {member.designation}
                  </Typography>
                  </Box>

                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ 
        py: 12, 
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#FFFFFF',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
              }}
            >
              Why Choose Us?
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: '1.25rem',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              We bring together the best of technology and innovation to deliver exceptional results.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 4,
              justifyContent: 'center',
            }}
          >
            {whyChooseUs.map((item, index) => (
              <Card
                key={index}
                sx={{
                  textAlign: 'center',
                  p: 5,
                  borderRadius: 4,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '220px',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                      : '0 16px 48px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  p: 0,
                }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                  }}>
                    {item.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.text}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ 
        py: 12, 
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0F0F0F' : '#F9F9F9',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
                color: 'text.primary',
              }}
            >
              Our Values
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: '1.25rem',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              The principles that guide everything we do.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
              maxWidth: '1000px',
              mx: 'auto',
            }}
          >
            {companyValues.map((value, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  borderRadius: 3,
                  p: 5,
                  textAlign: 'center',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(0, 0, 0, 0.4)'
                      : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {value.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.25rem',
                    color: 'text.primary',
                  }}
                >
                  {value.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: '0.9rem',
                  }}
                >
                  {value.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bg-coworking.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                color: 'white',
              }}
            >
              Ready to Work With Us?
            </Typography>
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                mb: 4,
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.4,
                color: 'white',
              }}
            >
              Let's discuss your project and see how we can help bring your vision to life.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Box
                component="a"
                href="/contact"
                sx={{
                  display: 'inline-block',
                  px: 4,
                  py: 2,
                  backgroundColor: 'white',
                  color: '#007AFF',
                  borderRadius: 2,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#F2F2F7',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                Start Your Project
              </Box>
              <Box
                component="a"
                href="/products"
                sx={{
                  display: 'inline-block',
                  px: 4,
                  py: 2,
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: 2,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                View Our Services
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}