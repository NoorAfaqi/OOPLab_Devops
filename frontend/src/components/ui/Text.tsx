import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface TextProps extends Omit<TypographyProps, 'component'> {
  children: React.ReactNode;
  // Reuse MUI's TypographyProps variant type to remain compatible with MUI variants
  variant?: TypographyProps['variant'];
  color?: TypographyProps['color'];
  align?: TypographyProps['align'];
  maxWidth?: string | number;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  color = 'textSecondary',
  align = 'left',
  maxWidth,
  sx,
  ...props
}) => {
  return (
    <Typography
      variant={variant}
      color={color}
      align={align}
      sx={{
        lineHeight: 1.6,
        maxWidth,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};
