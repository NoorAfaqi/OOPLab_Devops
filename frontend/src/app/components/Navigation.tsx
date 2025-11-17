"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Brightness4,
  Brightness7,
  Person,
  Home,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useTheme as useMacTheme } from "../../theme/MacThemeProvider";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { user, isLoading, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkMode, toggleTheme } = useMacTheme();
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
  ];

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    // Blur any focused elements to prevent accessibility issues
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setUserMenuAnchorEl(null);
  };

  const handleSignIn = () => {
    // Redirect to our custom sign-in page
    window.location.href = '/auth/signin';
    handleUserMenuClose();
  };

  const handleSignOut = () => {
    // Close the menu first to avoid accessibility issues
    handleUserMenuClose();
    // Use setTimeout to ensure the menu closes before logout
    setTimeout(() => {
      logout();
    }, 100);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          borderBottom: 'none',
          boxShadow: 'none',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Toolbar
          sx={{
            minHeight: '64px !important',
            padding: '8px 24px',
            backgroundColor: isDarkMode ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            margin: '8px 16px',
            maxWidth: '1200px',
            mx: 'auto',
            width: 'calc(100% - 32px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image
                src={isDarkMode ? "/logo-resized-dark.png" : "/logo-resized.png"}
                alt="OOPLab Logo"
                width={64}
                height={36}
                priority
              />
            </Link>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname === item.href + '/';
                return (
                  <Button
                    key={item.name}
                    component={Link}
                    href={item.href}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontWeight: isActive ? 600 : 500,
                      textTransform: 'none',
                      backgroundColor: isActive ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.04)',
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              ml: 1,
              color: 'text.primary',
            }}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* User Avatar / Sign In */}
          <Box sx={{ ml: 2 }}>
            {isLoading ? (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'grey.300',
                  color: 'text.primary',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                ...
              </Avatar>
            ) : user ? (
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  src={user.profilePicture || undefined}
                  onError={(e) => {
                    // If image fails to load, hide the src and show initials
                    (e.currentTarget as HTMLImageElement).src = '';
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: user.profilePicture ? 'transparent' : '#007AFF',
                    color: user.profilePicture ? 'inherit' : 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
                >
                  {!user.profilePicture && (user.firstName?.charAt(0) || user.email?.charAt(0) || 'U')}
                </Avatar>
              </IconButton>
            ) : (
              <Button
                onClick={handleSignIn}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'text.primary',
                  color: 'text.primary',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                Sign In
              </Button>
            )}
          </Box>

          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="end"
              aria-label="menu"
              onClick={handleMenuToggle}
              sx={{ 
                ml: 1,
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 122, 255, 0.04)',
                },
              }}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        TransitionProps={{
          unmountOnExit: true,
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.04)',
            },
          }}
        >
          <ListItemText
            primary={`Welcome, ${user?.firstName || user?.email || 'User'}`}
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: 500,
                fontSize: '0.875rem',
              },
            }}
          />
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/blogs/${user?.username}`}
          onClick={handleUserMenuClose}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.04)',
            },
          }}
        >
          <Home sx={{ mr: 2, fontSize: 20 }} />
          <ListItemText
            primary="My Space"
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: 500,
              },
            }}
          />
        </MenuItem>
        <MenuItem
          component={Link}
          href="/profile/settings"
          onClick={handleUserMenuClose}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.04)',
            },
          }}
        >
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          <ListItemText
            primary="Profile Settings"
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: 500,
              },
            }}
          />
        </MenuItem>
        <MenuItem
          onClick={handleSignOut}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.04)',
            },
          }}
        >
          <Logout sx={{ mr: 2, fontSize: 20 }} />
          <ListItemText
            primary="Sign Out"
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: 500,
              },
            }}
          />
        </MenuItem>
      </Menu>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={handleMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: 'background.paper',
            borderRadius: '16px 0 0 16px',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Menu
          </Typography>
          <List>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname === item.href + '/';
              return (
                <ListItem
                  key={item.name}
                  component={Link}
                  href={item.href}
                  onClick={handleMenuClose}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: isActive ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.04)',
                    },
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'primary.main' : 'text.primary',
                      },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
          
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {user ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Welcome, {user.firstName || user.email}
                </Typography>
                <Button
                  onClick={handleSignOut}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: 'text.secondary',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = '/auth/signin';
                  handleMenuClose();
                }}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: 'text.primary',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}