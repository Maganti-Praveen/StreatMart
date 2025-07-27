import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Star, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  vendorId: {
    name: string;
    phone: string;
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
  isAvailable: boolean;
}

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: 'vegetables',
    unitPrice: '',
    unit: 'kg',
    stock: '',
    minOrderQuantity: '1',
    deliveryRadiusKm: '10',
    description: '',
    qualityGrade: 'B'
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalMaterials: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, materialsRes] = await Promise.all([
        axios.get('/api/orders/supplier/my-orders?limit=5'),
        axios.get('/api/materials/supplier/my-materials')
      ]);

      setRecentOrders(ordersRes.data.orders);
      setMaterials(materialsRes.data);

      // Calculate stats
      const orders = ordersRes.data.orders;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o: Order) => 
        o.status === 'pending' || o.status === 'confirmed' || o.status === 'out_for_delivery'
      ).length;
      const totalRevenue = orders
        .filter((o: Order) => o.status === 'delivered')
        .reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
      const totalMaterials = materialsRes.data.length;

      setStats({ totalOrders, pendingOrders, totalRevenue, totalMaterials });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/materials', {
        ...materialForm,
        unitPrice: parseFloat(materialForm.unitPrice),
        stock: parseInt(materialForm.stock),
        minOrderQuantity: parseInt(materialForm.minOrderQuantity),
        deliveryRadiusKm: parseInt(materialForm.deliveryRadiusKm)
      });

      setMaterials([response.data.material, ...materials]);
      setShowAddMaterial(false);
      resetForm();
      toast.success('Material added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add material');
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMaterial) return;

    try {
      const response = await axios.put(`/api/materials/${editingMaterial._id}`, {
        ...materialForm,
        unitPrice: parseFloat(materialForm.unitPrice),
        stock: parseInt(materialForm.stock),
        minOrderQuantity: parseInt(materialForm.minOrderQuantity),
        deliveryRadiusKm: parseInt(materialForm.deliveryRadiusKm)
      });

      setMaterials(materials.map(m => 
        m._id === editingMaterial._id ? response.data.material : m
      ));
      setEditingMaterial(null);
      resetForm();
      toast.success('Material updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`/api/materials/${materialId}`);
      setMaterials(materials.filter(m => m._id !== materialId));
      toast.success('Material deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const resetForm = () => {
    setMaterialForm({
      name: '',
      category: 'vegetables',
      unitPrice: '',
      unit: 'kg',
      stock: '',
      minOrderQuantity: '1',
      deliveryRadiusKm: '10',
      description: '',
      qualityGrade: 'B'
    });
  };

  const startEditing = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      category: material.category,
      unitPrice: material.unitPrice.toString(),
      unit: material.unit,
      stock: material.stock.toString(),
      minOrderQuantity: '1',
      deliveryRadiusKm: '10',
      description: '',
      qualityGrade: 'B'
    });
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
            Welcome back, {user?.businessName || user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your inventory and fulfill orders from street food vendors.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
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
                <Package className="h-6 w-6 text-yellow-600" />
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
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materials Listed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMaterials}</p>
              </div>
            </div>
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
                        <h3 className="font-medium text-gray-900">{order.vendorId.name}</h3>
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
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Materials Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Materials</h2>
                <button
                  onClick={() => setShowAddMaterial(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </button>
              </div>
            </div>
            <div className="p-6">
              {materials.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {materials.map((material) => (
                    <div key={material._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{material.name}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditing(material)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Category: {material.category}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{material.unitPrice}/{material.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {material.stock} {material.unit}
                      </p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          material.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {material.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No materials listed yet</p>
                  <button
                    onClick={() => setShowAddMaterial(true)}
                    className="text-orange-500 hover:text-orange-600 font-medium mt-2"
                  >
                    Add your first material
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Material Modal */}
        {(showAddMaterial || editingMaterial) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingMaterial ? 'Edit Material' : 'Add New Material'}
                </h3>
                
                <form onSubmit={editingMaterial ? handleUpdateMaterial : handleAddMaterial} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Name
                    </label>
                    <input
                      type="text"
                      required
                      value={materialForm.name}
                      onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Fresh Tomatoes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={materialForm.category}
                      onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="vegetables">Vegetables</option>
                      <option value="dairy">Dairy</option>
                      <option value="oils">Oils</option>
                      <option value="spices">Spices</option>
                      <option value="grains">Grains</option>
                      <option value="meat">Meat</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={materialForm.unitPrice}
                        onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={materialForm.unit}
                        onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="kg">Kg</option>
                        <option value="liter">Liter</option>
                        <option value="piece">Piece</option>
                        <option value="packet">Packet</option>
                        <option value="dozen">Dozen</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      value={materialForm.stock}
                      onChange={(e) => setMaterialForm({ ...materialForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      required
                      value={materialForm.deliveryRadiusKm}
                      onChange={(e) => setMaterialForm({ ...materialForm, deliveryRadiusKm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Additional details about your product..."
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 font-medium"
                    >
                      {editingMaterial ? 'Update Material' : 'Add Material'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMaterial(false);
                        setEditingMaterial(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}