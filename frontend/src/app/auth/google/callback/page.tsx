"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Container, Typography, CircularProgress, Alert } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        return;
      }

      try {
        // Get session code from URL (secure - no token in URL)
        const code = searchParams.get('code');

        if (code) {
          hasProcessed.current = true;
          
          // Exchange session code for token (secure server-side exchange)
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${API_BASE_URL}/auth/oauth/exchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange OAuth code');
          }

          const result = await response.json();
          
          if (result.success && result.data) {
            const { user: userData, token } = result.data;
            
            // Update auth context
            updateUser(userData);
            
            // Store in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Clean up URL and redirect
            window.history.replaceState({}, document.title, '/');
            
            // Redirect to home page
            router.push('/');
          } else {
            throw new Error('Invalid response from server');
          }
        } else {
          setError('Invalid callback parameters');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError('Failed to process Google authentication');
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, updateUser]);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please try signing in again.
            </Typography>
            <button
              onClick={() => router.push('/auth/signin')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              Back to Sign In
            </button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Completing Google Sign In...
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Please wait while we complete your authentication.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Loading...
            </Typography>
          </Box>
        </Container>
      </Box>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
