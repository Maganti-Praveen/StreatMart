import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Clock, Star, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  supplierId: {
    name: string;
    businessName: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Material {
  _id: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  stock: number;
  supplierId: {
    name: string;
    businessName: string;
    rating: number;
  };
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [featuredMaterials, setFeaturedMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, materialsRes] = await Promise.all([
        axios.get('/api/orders/vendor/my-orders?limit=5'),
        axios.get('/api/materials?limit=8')
      ]);

      setRecentOrders(ordersRes.data.orders);
      setFeaturedMaterials(materialsRes.data.materials);

      // Calculate stats
      const orders = ordersRes.data.orders;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o: Order) => o.status === 'pending' || o.status === 'confirmed').length;
      const completedOrders = orders.filter((o: Order) => o.status === 'delivered').length;
      const totalSpent = orders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

      setStats({ totalOrders, pendingOrders, completedOrders, totalSpent });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your orders and discover new suppliers for your street food business.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/materials"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Browse Materials</h3>
                <p className="text-sm text-gray-600">Find raw materials from suppliers</p>
              </div>
            </Link>

            <Link
              to="/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">View All Orders</h3>
                <p className="text-sm text-gray-600">Track your order history</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Star className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-600">Manage your account settings</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link to="/orders" className="text-orange-500 hover:text-orange-600 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {order.supplierId.businessName || order.supplierId.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items.length} items • ₹{order.totalAmount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/materials" className="text-orange-500 hover:text-orange-600 font-medium">
                    Start shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Featured Materials */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Featured Materials</h2>
                <Link to="/materials" className="text-orange-500 hover:text-orange-600 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {featuredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredMaterials.slice(0, 4).map((material) => (
                    <div key={material._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{material.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {material.supplierId.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {material.supplierId.businessName || material.supplierId.name}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{material.unitPrice}/{material.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {material.stock} {material.unit}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No materials available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}