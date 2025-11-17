import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface HeadingProps extends Omit<TypographyProps, 'component'> {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'inherit';
  align?: 'left' | 'center' | 'right';
  gutterBottom?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  variant = 'h2',
  color = 'textPrimary',
  align = 'left',
  gutterBottom = true,
  sx,
  ...props
}) => {
  return (
    <Typography
      variant={variant}
      color={color}
      align={align}
      gutterBottom={gutterBottom}
      sx={{
        fontWeight: 700,
        lineHeight: 1.2,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};
