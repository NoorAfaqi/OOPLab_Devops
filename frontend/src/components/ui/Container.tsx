import React from 'react';
import { Box, BoxProps } from '@mui/material';

// Omit BoxProps.maxWidth so we can provide a custom union type that matches
// the MUI Container API (which allows `false`) without conflicting with BoxProps
interface ContainerProps extends Omit<BoxProps, 'component' | 'maxWidth'> {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  sx,
  ...props
}) => {
  return (
    <Box
      component="div"
      sx={{
        width: '100%',
        maxWidth: maxWidth === false ? 'none' : theme => theme.breakpoints.values[maxWidth],
        mx: 'auto',
        px: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
