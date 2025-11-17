import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh, ErrorOutline } from '@mui/icons-material';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
        textAlign: 'center',
      }}
    >
      <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="h6" color="error">
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '400px' }}>
        {message}
      </Typography>
      {showRetry && onRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};
