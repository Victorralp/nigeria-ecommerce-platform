import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Users, 
  ShoppingBag,
  DollarSign, 
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

// Mock data for the dashboard
const stats = {
  revenue: {
    total: 15799.99,
    change: 12.5,
    isPositive: true
  },
  orders: {
    total: 156,
    change: 8.2,
    isPositive: true
  },
  customers: {
    total: 89,
    change: -2.4,
    isPositive: false
  },
  products: {
    total: 245,
    change: 5.7,
    isPositive: true
  }
};

const recentOrders = [
  {
    id: '#12345',
    customer: 'John Doe',
    date: '2024-01-10',
    total: 129.99,
    status: 'Pending'
  },
  {
    id: '#12346',
    customer: 'Jane Smith',
    date: '2024-01-09',
    total: 179.98,
    status: 'Processing'
  },
  {
    id: '#12347',
    customer: 'Mike Johnson',
    date: '2024-01-09',
    total: 199.99,
    status: 'Shipped'
  }
];

const topProducts = [
  {
    name: 'Classic Running Shoes',
    sales: 48,
    revenue: 6239.52,
    trend: 'up'
  },
  {
    name: 'Urban Streetwear Collection',
    sales: 35,
    revenue: 3149.65,
    trend: 'up'
  },
  {
    name: 'Sport Performance Sneakers',
    sales: 29,
    revenue: 4639.71,
    trend: 'down'
  }
];

export function AdminDashboard() {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'processing':
        return 'bg-blue-50 text-blue-700';
      case 'shipped':
        return 'bg-purple-50 text-purple-700';
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              stats.revenue.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.revenue.isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.revenue.change)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${stats.revenue.total.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Total Revenue</p>
        </motion.div>

        {/* Orders Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              stats.orders.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.orders.isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.orders.change)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.orders.total}
          </h3>
          <p className="text-gray-600 text-sm">Total Orders</p>
        </motion.div>

        {/* Customers Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              stats.customers.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.customers.isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.customers.change)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.customers.total}
          </h3>
          <p className="text-gray-600 text-sm">Total Customers</p>
        </motion.div>

        {/* Products Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              stats.products.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.products.isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.products.change)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.products.total}
          </h3>
          <p className="text-gray-600 text-sm">Total Products</p>
        </motion.div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{order.customer}</h3>
                    <p className="text-sm text-gray-600">{order.id} • {order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">
                    ${order.total}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.sales} sales</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </span>
                </div>
              </div>
          ))}
        </div>
        </motion.div>
      </div>
    </div>
  );
} 