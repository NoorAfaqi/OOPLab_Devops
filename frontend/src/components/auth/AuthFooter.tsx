"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
} from "@mui/material";
import { useTheme as useMacTheme } from "../../theme/MacThemeProvider";

export default function AuthFooter() {
  const currentYear = new Date().getFullYear();
  const { isDarkMode } = useMacTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        borderTop: 'none',
        mt: "auto",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            © {currentYear} OOPLab. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
