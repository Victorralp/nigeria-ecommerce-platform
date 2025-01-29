import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function AdminLayout() {
  const { logout, adminUser } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      console.log('Starting logout process...');
      sessionStorage.setItem('manualLogout', 'true');
      sessionStorage.setItem('adminManualLogout', 'true');
      
      await logout();
      console.log('Logout successful, redirecting to admin login page...');
      
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPassword');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminPassword');
      localStorage.removeItem('adminRememberMe');
      
      navigate('/bolt-admin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const adminMenuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: Package 
    },
    { 
      name: 'Users', 
      path: '/admin/users', 
      icon: Users 
    },
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: ShoppingCart 
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: Settings 
    }
  ];

  return (
    <div className="flex min-h-screen bg-primary-50">
      {/* Sidebar */}
      <div className="w-64 bg-primary-900 text-primary-100">
        <div className="p-6 border-b border-primary-800">
          <h2 className="text-2xl font-bold text-gold-300">Admin Panel</h2>
          <p className="text-primary-400 text-sm mt-1">{adminUser?.email}</p>
        </div>

        <nav className="p-4">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center 
                  p-3 
                  rounded-lg 
                  mb-2 
                  transition-colors 
                  ${isActive 
                    ? 'bg-gold-400/10 text-gold-300 border border-gold-400/20' 
                    : 'text-primary-300 hover:bg-primary-800/50'
                  }
                `}
              >
                <Icon className="mr-3 w-5 h-5" />
                {item.name}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="
              w-full 
              flex items-center 
              justify-center
              p-3 
              rounded-lg 
              text-primary-900
              bg-gold-400
              hover:bg-gold-500
              transition-all
              mt-6
              font-medium
              group
            "
          >
            <LogOut className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
} 