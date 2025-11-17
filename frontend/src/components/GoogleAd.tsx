"use client";

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Campaign } from '@mui/icons-material';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

// Set to true when Google Ads is approved
const ENABLE_REAL_ADS = false;

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block' },
  className,
  responsive = true
}) => {
  React.useEffect(() => {
    // Only load Google AdSense if ads are enabled
    if (ENABLE_REAL_ADS) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.setAttribute('data-ad-client', process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-1234567890123456');
      document.head.appendChild(script);

      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.warn('Google AdSense not available:', error);
      }

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [adSlot]);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        textAlign: 'center',
        backgroundColor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        minHeight: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        ...adStyle,
      }}
      className={className}
    >
      {ENABLE_REAL_ADS ? (
        <ins
          className="adsbygoogle"
          style={adStyle}
          data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-1234567890123456'}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Campaign sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Advertisement
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Ad space available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GoogleAd;
