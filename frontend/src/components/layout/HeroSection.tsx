import React from 'react';
import { Box, Stack } from '@mui/material';
import { Container } from '../ui/Container';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { CustomButton } from '../ui/CustomButton';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  backgroundImage?: string;
  gradientColors?: string[];
  textColor?: 'white' | 'dark';
  align?: 'left' | 'center' | 'right';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  gradientColors,
  textColor = 'white',
  align = 'center',
}) => {
  const textColorValue = textColor === 'white' ? 'white' : 'text.primary';
  const subtitleColorValue = textColor === 'white' ? '#FFD60A' : 'primary.main';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        paddingTop: '80px', // Account for fixed navigation
        backgroundImage: backgroundImage 
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`
          : gradientColors 
            ? `linear-gradient(135deg, ${gradientColors.join(', ')})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: textColorValue,
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: align }}>
          <Heading
            variant="h1"
            align={align}
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 3,
              lineHeight: 1.1,
              color: textColorValue,
            }}
          >
            {title}
          </Heading>
          
          {subtitle && (
            <Heading
              variant="h1"
              align={align}
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.1,
                color: subtitleColorValue,
              }}
            >
              {subtitle}
            </Heading>
          )}
          
          {description && (
            <Text
              variant="body1"
              align={align}
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                mb: 4,
                opacity: 0.9,
                maxWidth: '800px',
                mx: align === 'center' ? 'auto' : 0,
                lineHeight: 1.4,
                color: textColorValue,
              }}
            >
              {description}
            </Text>
          )}
          
          {(primaryAction || secondaryAction) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
              sx={{ mt: 4 }}
            >
              {primaryAction && (
                <CustomButton
                  variant="contained"
                  size="large"
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                  sx={{
                    backgroundColor: textColor === 'white' ? 'white' : 'primary.main',
                    color: textColor === 'white' ? 'primary.main' : 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: textColor === 'white' ? '#F2F2F7' : 'primary.dark',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {primaryAction.label}
                </CustomButton>
              )}
              {secondaryAction && (
                <CustomButton
                  variant="outlined"
                  size="large"
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                  sx={{
                    borderColor: textColorValue,
                    color: textColorValue,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: textColor === 'white' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 122, 255, 0.04)',
                      borderColor: textColorValue,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {secondaryAction.label}
                </CustomButton>
              )}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};
