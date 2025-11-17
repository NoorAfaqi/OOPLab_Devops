"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  GitHub,
  LinkedIn,
  Facebook,
  Email,
  LocationOn,
  Phone,
  Home,
  Info,
  ShoppingCart,
  Article,
  ContactMail,
} from "@mui/icons-material";
import Image from "next/image";
import { useTheme as useMacTheme } from "../../theme/MacThemeProvider";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isDarkMode: globalDarkMode } = useMacTheme();
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin' || pathname?.startsWith('/admin/');
  
  // Use admin dark mode if on admin page, otherwise use global theme
  const [adminDarkMode, setAdminDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    if (isAdminPage) {
      // Get dark mode state from the admin page using a custom event or storage
      const checkDarkMode = () => {
        const darkModeSetting = localStorage.getItem('adminDarkMode');
        if (darkModeSetting !== null) {
          setAdminDarkMode(darkModeSetting === 'true');
        }
      };
      checkDarkMode();
      const interval = setInterval(checkDarkMode, 100);
      return () => clearInterval(interval);
    }
  }, [isAdminPage]);
  
  const isDarkMode = isAdminPage ? adminDarkMode : globalDarkMode;

  const socialLinks = [
    {
      icon: <GitHub sx={{ fontSize: 20 }} />,
      href: "https://github.com/NoorAfaqi",
      label: "GitHub",
    },
    {
      icon: <LinkedIn sx={{ fontSize: 20 }} />,
      href: "https://linkedin.com/company/ooplab",
      label: "LinkedIn",
    },
    {
      icon: <Facebook sx={{ fontSize: 20 }} />,
      href: "https://www.facebook.com/noor.afaqi.77",
      label: "Facebook",
    },
    {
      icon: <Email sx={{ fontSize: 20 }} />,
      href: "mailto:contact@ooplab.org",
      label: "Email",
    },
  ];

  const quickLinks = [
    { name: "Home", href: "/", icon: <Home sx={{ fontSize: 16 }} /> },
    { name: "About", href: "/about", icon: <Info sx={{ fontSize: 16 }} /> },
    { name: "Products", href: "/products", icon: <ShoppingCart sx={{ fontSize: 16 }} /> },
    { name: "Blogs", href: "/blogs", icon: <Article sx={{ fontSize: 16 }} /> },
    { name: "Contact", href: "/contact", icon: <ContactMail sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
        borderTop: "1px solid",
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        mt: "auto",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Main Footer Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "flex-start" },
            gap: 6,
            mb: 3,
          }}
        >
          {/* Logo and Description */}
          <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "400px" } }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Image
                src={isDarkMode ? "/logo-resized-dark.png" : "/logo-resized.png"}
                alt="OOPLab Logo"
                width={48}
                height={27}
                style={{ marginRight: '12px' }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                lineHeight: 1.5,
                mb: 3,
              }}
            >
              Building innovative web solutions with modern technologies and object-oriented programming principles.
            </Typography>
            
            {/* Social Links */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component={Link}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    "&:hover": {
                      color: "#007AFF",
                      backgroundColor: isDarkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.04)',
                    },
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ minWidth: "150px", display: "flex", flexDirection: "column" }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: isDarkMode ? '#ffffff' : '#000000',
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.5,
              columnGap: 2,
            }}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 122, 255, 0.05)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box sx={{ 
                      color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        color: "#007AFF",
                      },
                    }}>
                      {link.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        "&:hover": {
                          color: "#007AFF",
                        },
                        transition: "color 0.2s ease-in-out",
                      }}
                    >
                      {link.name}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          </Box>

          {/* Contact */}
          <Box sx={{ minWidth: "220px", display: "flex", flexDirection: "column" }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: isDarkMode ? '#ffffff' : '#000000',
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Contact Info
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ 
                  color: "#007AFF",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <Email sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    fontSize: "0.875rem",
                    fontWeight: 400,
                  }}
                >
                  contact@ooplab.org
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ 
                  color: "#007AFF",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <LocationOn sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    fontSize: "0.875rem",
                    fontWeight: 400,
                  }}
                >
                  Paris, France
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            }}
          >
            © {currentYear} OOPLab. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link href="/privacy" style={{ textDecoration: "none" }}>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  "&:hover": {
                    color: "#007AFF",
                  },
                  transition: "color 0.2s ease-in-out",
                }}
              >
                Privacy Policy
              </Typography>
            </Link>
            <Link href="/terms" style={{ textDecoration: "none" }}>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  "&:hover": {
                    color: "#007AFF",
                  },
                  transition: "color 0.2s ease-in-out",
                }}
              >
                Terms of Service
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
