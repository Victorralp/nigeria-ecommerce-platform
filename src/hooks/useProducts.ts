import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, Product } from '@/services/products';

export function useProducts() {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const featuredProducts = products.filter(product => product.featured);

  const filterProducts = (
    searchTerm: string,
    category: string,
    priceRange: [number, number],
    sortBy: string
  ) => {
    return [...products]
      .filter(product => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        const matchesPrice =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  };

  return {
    products,
    featuredProducts,
    isLoading,
    error,
    filterProducts,
  };
} 