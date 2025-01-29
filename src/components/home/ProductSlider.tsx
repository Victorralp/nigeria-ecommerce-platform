import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'shoes' | 'clothing';
  gradient: string;
  accent: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Classic Running Shoes',
    description: 'Premium comfort for your daily run. Engineered with advanced cushioning technology.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    category: 'shoes',
    gradient: 'from-slate-900 via-gray-900 to-zinc-900',
    accent: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Urban Streetwear Collection',
    description: 'Modern urban fashion essentials. Crafted for style and comfort.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    category: 'clothing',
    gradient: 'from-neutral-900 via-stone-900 to-neutral-900',
    accent: 'bg-purple-500'
  },
  {
    id: 3,
    name: 'Sport Performance Sneakers',
    description: 'Engineered for peak performance. Featuring responsive cushioning.',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
    category: 'shoes',
    gradient: 'from-zinc-900 via-neutral-900 to-stone-900',
    accent: 'bg-emerald-500'
  },
  {
    id: 4,
    name: 'Premium Denim Collection',
    description: 'Timeless style meets modern comfort. Premium quality denim.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0',
    category: 'clothing',
    gradient: 'from-stone-900 via-neutral-900 to-zinc-900',
    accent: 'bg-indigo-500'
  }
];

export function ProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    // Additional functionality or styling can be added here
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % products.length);
    // Additional functionality or styling can be added here
  };

  const currentProduct = products[currentIndex];

  return (
    <motion.div 
      className={`relative h-[600px] overflow-hidden bg-gradient-to-r ${currentProduct.gradient} transition-colors duration-700`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProduct.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-8 h-full items-center"
          >
            {/* Product Info */}
            <div className="text-white z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-12 h-1 ${currentProduct.accent} rounded-full`}></div>
                  <span className="text-sm font-medium uppercase tracking-wider text-white/70">
                    {currentProduct.category}
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {currentProduct.name}
                </h2>
                <p className="text-white/70 text-lg mb-8 leading-relaxed">
                  {currentProduct.description}
                </p>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-3xl font-bold">${currentProduct.price}</span>
                  <span className="text-white/50 line-through">${(currentProduct.price * 1.2).toFixed(2)}</span>
                </div>
                <button className={`group ${currentProduct.accent} px-8 py-4 rounded-xl font-medium inline-flex items-center gap-2 hover:opacity-90 transition-all duration-300`}>
                  Shop Collection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="relative aspect-square p-8"
            >
              <div className={`absolute inset-0 ${currentProduct.accent} opacity-10 blur-3xl rounded-full transform -rotate-12`}></div>
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="w-full h-full object-cover rounded-2xl shadow-2xl relative z-10"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="absolute -left-6 -right-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <div className="absolute -left-10">
            <button
              onClick={handlePrevious}
              className="group p-4 rounded-full bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:border-white hover:text-gray-900 transition-all duration-500 pointer-events-auto hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:-translate-x-1"
            >
              <ChevronLeft className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
            </button>
          </div>
          <div className="absolute -right-10">
            <button
              onClick={handleNext}
              className="group p-4 rounded-full bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:border-white hover:text-gray-900 transition-all duration-500 pointer-events-auto hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:translate-x-1"
            >
              <ChevronRight className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 items-center">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className="group relative"
            >
              <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? currentProduct.accent
                  : 'bg-white/20 group-hover:bg-white/30'
              }`}>
                {index === currentIndex && (
                  <motion.div
                    className="absolute inset-0 bg-white/50 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 