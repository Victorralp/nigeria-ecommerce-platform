import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '@/context/ProductContext';
import { ShoppingCart } from 'lucide-react';

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Classic White Tee',
    description: 'Comfortable cotton t-shirt',
    price: 29.99,
    category: 'Clothing',
    imageUrl: '/path/to/white-tee.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['white', 'black'],
    inStock: true
  },
  {
    id: '2',
    name: 'Denim Jacket',
    description: 'Vintage style denim jacket',
    price: 89.99,
    category: 'Outerwear',
    imageUrl: '/path/to/denim-jacket.jpg',
    sizes: ['M', 'L', 'XL'],
    colors: ['blue'],
    inStock: true
  },
  // Add more mock products
];

export function ProductGrid() {
  const { addProduct } = useProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {MOCK_PRODUCTS.map((product) => (
        <motion.div
          key={product.id}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)'
          }}
          className="bg-white 
            border-2 border-primary 
            rounded-xl 
            overflow-hidden 
            shadow-card 
            hover:border-secondary 
            transition-all 
            duration-300"
        >
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-64 object-cover"
            />
          </Link>
          
          <div className="p-4">
            <Link to={`/product/${product.id}`}>
              <h3 className="text-xl font-bold text-text-primary hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-primary font-semibold text-lg">
                ${product.price.toFixed(2)}
              </span>
              
              <button 
                onClick={() => addProduct(product)}
                className="
                  bg-primary 
                  text-white 
                  px-4 py-2 
                  rounded-full 
                  flex items-center 
                  hover:bg-secondary 
                  transition-colors 
                  duration-300 
                  group"
              >
                <ShoppingCart className="mr-2 group-hover:animate-bounce" />
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}