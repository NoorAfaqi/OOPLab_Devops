import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface SectionProps extends BoxProps {
  children: React.ReactNode;
  background?: 'default' | 'paper' | 'gradient' | 'image';
  gradientColors?: string[];
  backgroundImage?: string;
  padding?: number | { xs?: number; sm?: number; md?: number };
  minHeight?: string | number;
  fullHeight?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  background = 'default',
  gradientColors,
  backgroundImage,
  padding = 8,
  minHeight,
  fullHeight = false,
  sx,
  ...props
}) => {
  const getBackgroundStyle = () => {
    switch (background) {
      case 'gradient':
        return {
          background: gradientColors 
            ? `linear-gradient(135deg, ${gradientColors.join(', ')})`
            : 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
        };
      case 'image':
        return {
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      case 'paper':
        return {
          backgroundColor: 'background.paper',
        };
      default:
        return {
          backgroundColor: 'background.default',
        };
    }
  };

  return (
    <Box
      sx={{
        py: padding,
        minHeight: fullHeight ? '100vh' : minHeight,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...getBackgroundStyle(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
