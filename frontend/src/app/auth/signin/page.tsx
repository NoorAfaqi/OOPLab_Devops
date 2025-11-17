"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Container } from "@mui/material";
import AuthCard from "@/components/auth/AuthCard";
import AuthNavbar from "@/components/auth/AuthNavbar";
import AuthFooter from "@/components/auth/AuthFooter";

function SignInLoadingFallback() {
  return (
    <Box sx={{ maxWidth: 450, mx: "auto", textAlign: "center" }}>
      <div>Loading sign in form...</div>
    </Box>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if we should start in signup mode
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <AuthCard isSignUp={isSignUp} onToggleMode={toggleMode} />
  );
}

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/bg-sign-in-basic.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1,
        },
      }}
    >
      <AuthNavbar />
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, pt: 8, pb: 4 }}>
        <Container maxWidth="sm">
          <Suspense fallback={<SignInLoadingFallback />}>
            <SignInContent />
          </Suspense>
        </Container>
      </Box>
      <AuthFooter />
    </Box>
  );
}
