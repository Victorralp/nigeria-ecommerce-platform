import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/components/products/ProductGrid';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredProducts = MOCK_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input 
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsSearching(e.target.value.length > 0);
          }}
          onFocus={() => setIsSearching(searchTerm.length > 0)}
          onBlur={() => setTimeout(() => setIsSearching(false), 200)}
          className="
            w-full 
            pl-10 
            pr-10 
            py-2 
            rounded-full 
            border 
            border-gray-300 
            focus:border-primary 
            focus:ring-2 
            focus:ring-primary-light 
            transition-all 
            duration-300
          "
        />
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
        />
        {searchTerm && (
          <X 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-primary" 
          />
        )}
      </div>

      <AnimatePresence>
        {isSearching && filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute 
              top-full 
              mt-2 
              w-full 
              bg-white 
              rounded-xl 
              shadow-lg 
              z-50 
              max-h-96 
              overflow-y-auto
            "
          >
            {filteredProducts.map(product => (
              <Link 
                key={product.id}
                to={`/product/${product.id}`}
                className="
                  flex 
                  items-center 
                  p-4 
                  hover:bg-gray-100 
                  transition-colors 
                  border-b 
                  last:border-b-0
                "
              >
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h3 className="font-bold text-text-primary">{product.name}</h3>
                  <p className="text-text-secondary text-sm">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 