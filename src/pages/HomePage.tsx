import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Heart, Star, Eye, TrendingUp, Package, Clock, Shield, ArrowRight } from 'lucide-react';
import { getProducts, Product } from '@/services/products';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import { FilterDrawer } from '@/components/products/FilterDrawer';
import { ProductSlider } from '@/components/home/ProductSlider';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: TrendingUp,
    title: 'Trending Styles',
    description: 'Stay ahead with our latest fashion trends'
  },
  {
    icon: Package,
    title: 'Free Shipping',
    description: 'Free shipping on orders over $100'
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: '2-3 business days delivery'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment methods'
  }
];

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistStates, setWishlistStates] = useState<Record<string, boolean>>({});
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Update wishlist states when products change
    const updateWishlistStates = async () => {
      if (isAuthenticated && products.length > 0) {
        const states: Record<string, boolean> = {};
        for (const product of products) {
          states[product.id] = await isInWishlist(product.id);
        }
        setWishlistStates(states);
      }
    };
    updateWishlistStates();
  }, [products, isAuthenticated, isInWishlist]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addItem(product as import("c:/Users/Raphael/Downloads/project-bolt-bolt-vite-react-z852hj7n/project/src/types/Product").Product);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      if (wishlistStates[product.id]) {
        await removeFromWishlist(product.id);
        setWishlistStates(prev => ({ ...prev, [product.id]: false }));
      } else {
        await addToWishlist(product as import("c:/Users/Raphael/Downloads/project-bolt-bolt-vite-react-z852hj7n/project/src/types/Product").Product);
        setWishlistStates(prev => ({ ...prev, [product.id]: true }));
      }
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
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

  const filteredProducts = sortProducts(
    products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
  );

  const featuredProducts = products.filter(product => product.featured).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Slider */}
      <ProductSlider />

      {/* Features Section */}
      <div className="relative -mt-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <feature.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-2">Our most popular and highest-rated items</p>
            </div>
            <Link 
              to="/products"
              className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-80 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-lg hover:border-gray-200">
                    {/* Product Image */}
                    <div className="relative aspect-[4/5]">
                      <img
                        src={product.image || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.featured && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-3 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowQuickView(true);
                          }}
                          className="p-3 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className={`p-3 rounded-xl transition-colors ${
                            wishlistStates[product.id]
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${wishlistStates[product.id] ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && featuredProducts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No featured products found</h3>
              <p className="text-gray-600">Check back later for our featured items</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false);
          setSelectedProduct(null);
        }}
      />
      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 group z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 transform transition-transform group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
} 