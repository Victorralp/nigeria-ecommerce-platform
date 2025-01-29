import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
  paymentMethod: string;
}

// Mock orders data
const orders: Order[] = [
  {
    id: '#12345',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://i.pravatar.cc/150?u=john'
    },
    date: '2024-01-10',
    total: 129.99,
    status: 'Pending',
    items: [
      { name: 'Classic Running Shoes', quantity: 1, price: 129.99 }
    ],
    shippingAddress: '123 Main St, New York, NY 10001',
    paymentMethod: 'Credit Card'
  },
  {
    id: '#12346',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://i.pravatar.cc/150?u=jane'
    },
    date: '2024-01-09',
    total: 179.98,
    status: 'Processing',
    items: [
      { name: 'Urban Streetwear Collection', quantity: 2, price: 89.99 }
    ],
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
    paymentMethod: 'PayPal'
  },
  {
    id: '#12347',
    customer: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: 'https://i.pravatar.cc/150?u=mike'
    },
    date: '2024-01-09',
    total: 199.99,
    status: 'Shipped',
    items: [
      { name: 'Sport Performance Sneakers', quantity: 1, price: 159.99 },
      { name: 'Sports Socks', quantity: 2, price: 19.99 }
    ],
    shippingAddress: '789 Pine St, Chicago, IL 60601',
    paymentMethod: 'Credit Card'
  },
  {
    id: '#12348',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      avatar: 'https://i.pravatar.cc/150?u=sarah'
    },
    date: '2024-01-08',
    total: 159.99,
    status: 'Delivered',
    items: [
      { name: 'Premium Denim Collection', quantity: 1, price: 119.99 },
      { name: 'Belt', quantity: 1, price: 39.99 }
    ],
    shippingAddress: '321 Elm St, Houston, TX 77001',
    paymentMethod: 'Credit Card'
  },
  {
    id: '#12349',
    customer: {
      name: 'Tom Brown',
      email: 'tom@example.com',
      avatar: 'https://i.pravatar.cc/150?u=tom'
    },
    date: '2024-01-08',
    total: 79.99,
    status: 'Cancelled',
    items: [
      { name: 'Classic T-Shirt', quantity: 2, price: 39.99 }
    ],
    shippingAddress: '654 Maple Dr, Seattle, WA 98101',
    paymentMethod: 'PayPal'
  }
];

export function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const handleViewOrder = (orderId: string) => {
    toast.success(`Viewing order ${orderId}`);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Processing':
        return 'bg-blue-50 text-blue-700';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700';
      case 'Delivered':
        return 'bg-green-50 text-green-700';
      case 'Cancelled':
        return 'bg-red-50 text-red-700';
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
      }
      return (a.total - b.total) * order;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export Orders
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-grow w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-96 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Order['status'] | 'All')}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => {
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="w-5 h-5" />
              Sort by {sortBy}
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Order Header */}
            <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {order.customer.avatar ? (
                    <img
                      src={order.customer.avatar}
                      alt={order.customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-medium">
                      {order.customer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{order.customer.name}</h3>
                  <p className="text-sm text-gray-600">{order.customer.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
                <div className="relative">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details (Expandable) */}
            {expandedOrder === order.id && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Details</h4>
                    <p className="text-sm text-gray-600 mb-4">{order.shippingAddress}</p>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                    <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
              </button>
              <div className="flex gap-2">
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pending">Mark as Pending</option>
                    <option value="Processing">Mark as Processing</option>
                    <option value="Shipped">Mark as Shipped</option>
                    <option value="Delivered">Mark as Delivered</option>
                    <option value="Cancelled">Mark as Cancelled</option>
                  </select>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
} 