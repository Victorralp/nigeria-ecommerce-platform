import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { CreateProductPage } from '@/pages/admin/CreateProductPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { CartPage } from '@/pages/CartPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { SecretAdminAccess } from '@/components/admin/SecretAdminAccess';
import { EditProductPage } from '@/pages/EditProductPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';

// Layout component to handle conditional rendering of header and footer
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || 
                    location.pathname === '/' || 
                    location.pathname === '/bolt-admin';

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export function AppRoutes() {
  return (
    <>
      <SecretAdminAccess />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bolt-admin" element={<AdminLoginPage />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/new" element={<CreateProductPage />} />
              <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </>
  );
} 