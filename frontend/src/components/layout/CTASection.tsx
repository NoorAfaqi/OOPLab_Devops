import React from 'react';
import { Box, Stack } from '@mui/material';
import { Container } from '../ui/Container';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { CustomButton } from '../ui/CustomButton';
import { CustomCard } from '../ui/CustomCard';

interface CTASectionProps {
  title: string;
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
  background?: 'gradient' | 'solid';
  gradientColors?: string[];
  backgroundImage?: string;
  textColor?: 'white' | 'dark';
  icon?: React.ReactNode;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  background = 'gradient',
  gradientColors = ['#007AFF', '#5856D6'],
  backgroundImage,
  textColor = 'white',
  icon,
}) => {
  const textColorValue = textColor === 'white' ? 'white' : 'text.primary';
  const backgroundColor = backgroundImage 
    ? `url('${backgroundImage}')`
    : background === 'gradient' 
    ? `linear-gradient(135deg, ${gradientColors.join(', ')})`
    : 'background.paper';

  return (
    <Box
      sx={{
        py: 8,
        backgroundImage: backgroundImage ? backgroundColor : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
        background: backgroundImage ? undefined : backgroundColor,
        color: textColorValue,
        position: 'relative',
        '&::before': backgroundImage ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        } : undefined,
        '& > *': backgroundImage ? {
          position: 'relative',
          zIndex: 2,
        } : undefined,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          {icon && (
            <Box sx={{ mb: 3 }}>
              {icon}
            </Box>
          )}
          <Heading
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              color: textColorValue,
            }}
          >
            {title}
          </Heading>
          {description && (
            <Text
              variant="body1"
              align="center"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
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
              justifyContent="center"
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

interface CTACardProps {
  title: string;
  description: string;
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
  icon?: React.ReactNode;
}

export const CTACard: React.FC<CTACardProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
}) => {
  return (
    <CustomCard
      sx={{
        p: 6,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
        border: '1px solid rgba(0, 122, 255, 0.1)',
      }}
    >
      {icon && (
        <Box sx={{ mb: 3 }}>
          {icon}
        </Box>
      )}
      <Heading
        variant="h3"
        align="center"
        sx={{
          fontWeight: 700,
          mb: 3,
          fontSize: '2rem',
        }}
      >
        {title}
      </Heading>
      <Text
        variant="body1"
        align="center"
        sx={{
          mb: 4,
          maxWidth: '600px',
          mx: 'auto',
          lineHeight: 1.6,
        }}
      >
        {description}
      </Text>
      {(primaryAction || secondaryAction) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          {primaryAction && (
            <CustomButton
              variant="contained"
              size="large"
              href={primaryAction.href}
              onClick={primaryAction.onClick}
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
            >
              {secondaryAction.label}
            </CustomButton>
          )}
        </Stack>
      )}
    </CustomCard>
  );
};
