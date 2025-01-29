import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Star,
  Share2,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  Check,
  Minus,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Mock product data
const product = {
  id: "d0dc6c55-cfb6-4e26-a6ba-0b61cb1f3332",
  name: 'Classic Running Shoes',
  price: 129.99,
  rating: 4.5,
  reviews: 128,
  description: 'Experience ultimate comfort and style with our Classic Running Shoes. Featuring advanced cushioning technology and breathable materials, these shoes are perfect for both athletic performance and casual wear.',
  images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
    'https://images.unsplash.com/photo-1539185441755-769473a23570',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a'
  ],
  colors: ['Black', 'White', 'Blue', 'Red'],
  sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
  features: [
    'Breathable mesh upper',
    'Responsive cushioning',
    'Durable rubber outsole',
    'Removable insole'
  ],
  specifications: {
    'Material': 'Synthetic mesh, rubber',
    'Weight': '280g (Size US 9)',
    'Heel Drop': '10mm',
    'Arch Support': 'Neutral',
    'Closure': 'Lace-up'
  },
  stock: 15,
  category: 'Shoes',
  brand: 'SportFlex'
};

export function ProductDetailPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = () => {
    toast.success('Added to wishlist!');
  };

  const handleShare = () => {
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Home
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => navigate('/products')}
            className="text-gray-600 hover:text-gray-900"
          >
            Products
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-white"
          >
            <img 
                src={product.images[selectedImage]}
              alt={product.name} 
                className="w-full h-full object-cover"
            />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl overflow-hidden bg-white border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
            ))}
          </div>
        </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{product.category}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {product.stock} in stock
              </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-900 hover:border-gray-900'
                    }`}
                  >
                    {color}
                  </button>
                ))}
            </div>
          </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-900 hover:border-gray-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <div className="p-2 bg-white rounded-lg">
                  <Truck className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Free Shipping</h3>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <div className="p-2 bg-white rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">2 Year Warranty</h3>
                  <p className="text-sm text-gray-600">100% guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <div className="p-2 bg-white rounded-lg">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Free Returns</h3>
                  <p className="text-sm text-gray-600">Within 30 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <div className="p-2 bg-white rounded-lg">
                  <Check className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Secure Payment</h3>
                  <p className="text-sm text-gray-600">100% protected</p>
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 