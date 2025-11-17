"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Typography, Box, CircularProgress } from "@mui/material";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (status === "loading") {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  if (session) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Welcome, {session.user?.name}
        </Typography>
        <Button
          onClick={() => signOut()}
          variant="outlined"
          size="small"
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
    );
  }

  return (
    <Button
      onClick={() => {
        setIsSigningIn(true);
        signIn();
      }}
      disabled={isSigningIn}
      variant="outlined"
      size="small"
      sx={{
        borderColor: 'text.secondary',
        color: 'text.secondary',
        '&:hover': {
          borderColor: 'primary.main',
          color: 'primary.main',
        },
      }}
    >
      {isSigningIn ? "Signing in..." : "Admin Login"}
    </Button>
  );
}
