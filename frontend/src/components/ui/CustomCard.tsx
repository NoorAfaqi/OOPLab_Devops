import React from 'react';
import { Card, CardProps, CardContent, CardActions } from '@mui/material';

interface CustomCardProps extends CardProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hover?: boolean;
  padding?: number;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  actions,
  hover = true,
  padding = 3,
  sx,
  ...props
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        backgroundColor: 'background.paper',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.05)',
        transition: hover ? 'all 0.3s ease-in-out' : 'none',
        '&:hover': hover ? {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 8px 25px rgba(0, 0, 0, 0.4)'
            : '0 8px 25px rgba(0, 0, 0, 0.15)',
        } : {},
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: padding }}>
        {children}
      </CardContent>
      {actions && (
        <CardActions sx={{ p: padding, pt: 0 }}>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};
