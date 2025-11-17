import React from 'react';
import { 
  Box, 
  Stack, 
  Avatar, 
  Button, 
  Chip, 
  Card,
  CardContent,
  CardActions,
  Typography,
  Divider
} from '@mui/material';
import { 
  CheckCircle, 
  Launch
} from '@mui/icons-material';
import { DisplayProduct } from '../../types';

interface ApiProductCardProps {
  product: DisplayProduct;
  onLearnMore?: (product: DisplayProduct) => void;
}

const getProductIcon = (name: string, color: string) => {
  // Simple icon logic based on product name
  if (name.toLowerCase().includes('fitfuel') || name.toLowerCase().includes('fitness')) {
    return '🏃‍♂️';
  } else if (name.toLowerCase().includes('web') || name.toLowerCase().includes('app')) {
    return '💻';
  } else if (name.toLowerCase().includes('mobile')) {
    return '📱';
  } else if (name.toLowerCase().includes('api')) {
    return '🔌';
  } else if (name.toLowerCase().includes('cloud')) {
    return '☁️';
  }
  return '🚀';
};

export const ApiProductCard: React.FC<ApiProductCardProps> = ({ product, onLearnMore }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '400px',
        borderRadius: 3,
        backgroundColor: 'background.paper',
        border: (theme) => theme.palette.mode === 'dark' 
          ? `1px solid ${product.color}30` 
          : `1px solid ${product.color}20`,
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? `0 12px 30px ${product.color}40`
            : `0 12px 30px ${product.color}30`,
          border: (theme) => theme.palette.mode === 'dark'
            ? `2px solid ${product.color}50`
            : `2px solid ${product.color}40`,
        },
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Product Header with Circular Image */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? `${product.color}20` 
                : `${product.color}15`,
              border: (theme) => theme.palette.mode === 'dark'
                ? `3px solid ${product.color}40`
                : `3px solid ${product.color}30`,
              mr: 3,
              overflow: 'hidden',
            }}
          >
            {product.logo ? (
              <img
                src={product.logo}
                alt={`${product.name} logo`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = getProductIcon(product.name, product.color);
                }}
              />
            ) : (
              getProductIcon(product.name, product.color)
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.3rem',
                mb: 1,
                color: 'text.primary',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.name}
            </Typography>
            <Chip
              label={product.category}
              size="small"
              sx={{
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? `${product.color}20` 
                  : `${product.color}15`,
                color: product.color,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-label': {
                  px: 1.5,
                },
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.6,
            minHeight: '48px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>

        <Divider sx={{ 
          my: 2, 
          borderColor: (theme) => theme.palette.mode === 'dark' 
            ? `${product.color}30` 
            : `${product.color}20` 
        }} />

        {/* Features */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'text.primary',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Key Features
          </Typography>
          <Stack spacing={1.5}>
            {product.features.slice(0, 4).map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' 
                      ? `${product.color}25` 
                      : `${product.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle
                    sx={{
                      fontSize: 12,
                      color: product.color,
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  {feature}
                </Typography>
              </Box>
            ))}
            {product.features.length > 4 && (
              <Typography
                variant="caption"
                sx={{
                  color: product.color,
                  fontWeight: 600,
                  ml: 3.5,
                  fontSize: '0.75rem',
                }}
              >
                +{product.features.length - 4} more features
              </Typography>
            )}
          </Stack>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
        <Button
          variant="contained"
          endIcon={<Launch />}
          onClick={() => window.open(product.url, '_blank')}
          sx={{
            backgroundColor: product.color,
            color: 'white',
            fontWeight: 600,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.95rem',
            minWidth: '120px',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? `0 4px 14px ${product.color}50`
              : `0 4px 14px ${product.color}40`,
            '&:hover': {
              backgroundColor: product.color,
              transform: 'translateY(-2px)',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? `0 6px 20px ${product.color}60`
                : `0 6px 20px ${product.color}50`,
            },
          }}
        >
          Visit Product
        </Button>
      </CardActions>
    </Card>
  );
};

interface ApiProductsGridProps {
  products: DisplayProduct[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
  onLearnMore?: (product: DisplayProduct) => void;
}

export const ApiProductsGrid: React.FC<ApiProductsGridProps> = ({ 
  products, 
  columns = { xs: 1, sm: 1, md: 2, lg: 3 },
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
          lg: `repeat(${columns.lg || 3}, 1fr)`,
        },
        gap: { xs: 3, md: 4 },
        alignItems: 'stretch',
        justifyItems: 'center',
        px: { xs: 2, sm: 0 },
        '& > *': {
          width: '100%',
          maxWidth: { xs: '100%', sm: '400px', md: '420px' },
        },
      }}
    >
      {products.map((product) => (
        <ApiProductCard key={product.id} product={product} onLearnMore={onLearnMore} />
      ))}
    </Box>
  );
};
