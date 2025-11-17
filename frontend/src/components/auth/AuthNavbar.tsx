"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useTheme as useMacTheme } from "../../theme/MacThemeProvider";

export default function AuthNavbar() {
  const { isDarkMode, toggleTheme } = useMacTheme();

  return (
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
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          borderRadius: 0,
          margin: { xs: 0, md: '0 24px' },
          maxWidth: 'none',
          mx: 'auto',
          width: { xs: '100%', md: 'calc(100% - 48px)' },
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Image
              src="/logo-resized-dark.png"
              alt="OOPLab Logo"
              width={64}
              height={36}
            />
          </Link>
        </Box>

        {/* Theme Toggle */}
        <IconButton
          onClick={toggleTheme}
          sx={{
            ml: 1,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
