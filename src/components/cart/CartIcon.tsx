import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';

export function CartIcon() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative">
      <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white 
              rounded-full w-5 h-5 flex items-center justify-center 
              text-xs font-bold"
          >
            {totalItems}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
} 