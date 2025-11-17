import React from 'react';
import { Box, Stack, Avatar, Chip, Button } from '@mui/material';
import { ArrowForward, CheckCircle, Computer, PhoneAndroid, Api, CloudQueue } from '@mui/icons-material';
import { CustomCard } from '../ui/CustomCard';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { CustomButton } from '../ui/CustomButton';
import { Product } from '../../types';

interface ProductCardProps {
  product: Omit<Product, 'icon'>;
  onLearnMore?: (product: Omit<Product, 'icon'>) => void;
}

const getProductIcon = (name: string, color: string) => {
  const iconProps = { sx: { fontSize: 40, color } };
  
  if (name.includes('Web Development')) {
    return <Computer {...iconProps} />;
  } else if (name.includes('Mobile App')) {
    return <PhoneAndroid {...iconProps} />;
  } else if (name.includes('API Development')) {
    return <Api {...iconProps} />;
  } else if (name.includes('Cloud Solutions')) {
    return <CloudQueue {...iconProps} />;
  }
  return <Computer {...iconProps} />;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onLearnMore }) => {
  return (
    <CustomCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%', // Ensure full width within grid cell
        maxWidth: '400px', // Prevent cards from becoming too wide
      }}
      actions={
        <CustomButton
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={() => onLearnMore?.(product)}
          sx={{
            backgroundColor: product.color,
            '&:hover': {
              backgroundColor: product.color,
              opacity: 0.9,
            },
          }}
        >
          Learn More
        </CustomButton>
      }
    >
      {/* Product Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            backgroundColor: product.color,
            mr: 2,
          }}
        >
          {getProductIcon(product.name, product.color)}
        </Avatar>
        <Box>
          <Heading variant="h5" sx={{ fontSize: '1.25rem', mb: 0.5 }}>
            {product.name}
          </Heading>
          <Text sx={{ color: product.color, fontWeight: 600, fontSize: '1rem' }}>
            {product.price}
          </Text>
        </Box>
      </Box>

      {/* Description */}
      <Text sx={{ mb: 3 }}>
        {product.description}
      </Text>

      {/* Features */}
      <Box sx={{ mb: 3 }}>
        <Text variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          Key Features:
        </Text>
        <Stack spacing={1}>
          {product.features.map((feature, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle
                sx={{
                  fontSize: 16,
                  color: product.color,
                  mr: 1,
                }}
              />
              <Text variant="body2">
                {feature}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>
    </CustomCard>
  );
};

interface ProductsGridProps {
  products: Omit<Product, 'icon'>[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
  onLearnMore?: (product: Omit<Product, 'icon'>) => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  columns = { xs: 1, md: 2 },
  onLearnMore 
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 1}, 1fr)`,
          md: `repeat(${columns.md || 2}, 1fr)`,
          lg: `repeat(${columns.lg || 2}, 1fr)`,
        },
        gap: 4,
        alignItems: 'stretch', // Ensure all cards have equal height
        justifyItems: 'center', // Center the cards within their grid cells
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onLearnMore={onLearnMore} />
      ))}
    </Box>
  );
};
