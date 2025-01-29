import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, adminUser } = useAdminAuth();
  const [email, setEmail] = useState(() => localStorage.getItem('adminEmail') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('adminPassword') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('adminRememberMe') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Auto-login effect
  useEffect(() => {
    const storedEmail = localStorage.getItem('adminEmail');
    const storedPassword = localStorage.getItem('adminPassword');
    const shouldRemember = localStorage.getItem('adminRememberMe') === 'true';
    const wasManualLogout = sessionStorage.getItem('adminManualLogout') === 'true';

    if (shouldRemember && storedEmail && storedPassword && !isAuthenticated && !wasManualLogout) {
      console.log('Attempting auto-login...');
      handleLogin(storedEmail, storedPassword, true);
    }

    // Clear the manual logout flag when component unmounts
    return () => {
      sessionStorage.removeItem('adminManualLogout');
    };
  }, []);

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, adminUser });
    if (isAuthenticated && adminUser) {
      console.log('User is authenticated, navigating to dashboard...');
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, adminUser, navigate]);

  const handleLogin = async (loginEmail: string, loginPassword: string, remember: boolean) => {
    setIsLoading(true);
    console.log('Starting admin login attempt with remember me:', remember);

    try {
      const success = await login(loginEmail, loginPassword, remember);
      console.log('Login result:', success);
      console.log('isAuthenticated after login:', isAuthenticated);
      
      if (success) {
        console.log('Login successful');
        if (remember) {
          localStorage.setItem('adminEmail', loginEmail);
          localStorage.setItem('adminPassword', loginPassword);
          localStorage.setItem('adminRememberMe', 'true');
        } else {
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('adminPassword');
          localStorage.removeItem('adminRememberMe');
        }
        toast.success('Welcome back, Admin!');
      } else {
        console.log('Login failed - invalid credentials');
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password, rememberMe);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400">Enter your credentials to access the admin panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to store
          </button>
        </div>
      </motion.div>
    </div>
  );
} 