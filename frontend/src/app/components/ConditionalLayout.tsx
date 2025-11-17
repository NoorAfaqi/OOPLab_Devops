"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Navigation from "./Navigation";
import Footer from "./Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Check if we're on the admin page
  const isAdminPage = pathname === '/admin' || pathname?.startsWith('/admin/');
  
  if (isAuthPage || isAdminPage) {
    // For auth pages and admin pages, just render children (they have their own navbars)
    return <>{children}</>;
  }
  
  // For all other pages, render with regular navbar and footer
  return (
    <>
      <Navigation />
      <Box
        sx={{
          minHeight: "100vh",
          marginTop: 0,
        }}
      >
        {children}
      </Box>
      <Footer />
    </>
  );
}
