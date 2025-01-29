import { Link, useLocation } from 'react-router-dom';
import { CartIcon } from '../cart/CartIcon';
import { SearchBar } from '../common/SearchBar';
import { Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items: wishlistItems } = useWishlist();

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Products', path: '/products' },
    { name: 'Cart', path: '/cart' },
    { name: 'Wishlist', path: '/wishlist' }
  ];

  return (
    <header className="bg-primary-50 border-b border-primary-100">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-6 flex-1 md:flex-initial">
          <Link 
            to="/home" 
            className="text-2xl font-bold text-primary-900 hover:text-primary-800 transition-colors"
          >
            Modern Store
          </Link>
          
          <div className="hidden md:block">
            <SearchBar />
          </div>
        </div>
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-primary-600 hover:text-primary-900"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => {
            if (item.name === 'Wishlist') {
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`
                    relative
                    text-primary-600 
                    hover:text-primary-900 
                    transition-colors 
                    ${location.pathname === item.path 
                      ? 'text-primary-900 border-b-2 border-gold-400' 
                      : ''}
                  `}
                >
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              );
            }
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`
                  text-primary-600 
                  hover:text-primary-900 
                  transition-colors 
                  ${location.pathname === item.path 
                    ? 'text-primary-900 border-b-2 border-gold-400' 
                    : ''}
                `}
              >
                {item.name}
              </Link>
            );
          })}
          <CartIcon />
        </nav>

        <div
          className={`
            absolute top-full left-0 right-0 
            bg-primary-50 shadow-lg border-t border-primary-100
            transition-transform duration-300 ease-in-out
            transform md:hidden
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}
          `}
        >
          <div className="p-4">
            <div className="mb-4">
              <SearchBar />
            </div>

            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    py-2 px-4 rounded-lg
                    text-primary-600 
                    hover:text-primary-900 
                    hover:bg-primary-100
                    transition-colors 
                    ${location.pathname === item.path 
                      ? 'text-primary-900 bg-primary-100' 
                      : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {item.name === 'Wishlist' && <Heart className="w-5 h-5" />}
                    {item.name}
                    {item.name === 'Wishlist' && wishlistItems.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              <div className="py-2 px-4">
                <CartIcon />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}