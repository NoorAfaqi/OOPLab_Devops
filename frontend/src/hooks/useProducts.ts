import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProducts } from '../lib/api';
import { DatabaseProduct, DisplayProduct } from '../types';

// Color palette for different products
const PRODUCT_COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#5856D6', // Purple
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#5AC8FA', // Light Blue
  '#FF2D92', // Pink
  '#32D74B', // Light Green
];

// Transform database product to display product
const transformProduct = (dbProduct: DatabaseProduct, index: number): DisplayProduct => {
  return {
    id: dbProduct.PID,
    name: dbProduct.NAME,
    description: dbProduct.DESCRIPTION,
    features: dbProduct.features.map(feature => feature.DESCRIPTION),
    url: dbProduct.P_URL,
    logo: dbProduct.LOGO,
    color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
    category: 'Product', // Default category
  };
};

export interface UseProductsReturn {
  products: DisplayProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchProducts();
      
      if (response.success && response.data.products) {
        const transformedProducts = response.data.products.map((product, index) => 
          transformProduct(product, index)
        );
        setProducts(transformedProducts);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    products,
    loading,
    error,
    refetch,
  };
}
