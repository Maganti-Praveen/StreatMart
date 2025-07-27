import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  vendorId?: {
    name: string;
    phone: string;
    address: string;
  };
  supplierId?: {
    name: string;
    businessName: string;
    phone: string;
    rating: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  supplierNotes?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      const endpoint = user?.role === 'vendor' 
        ? '/api/orders/vendor/my-orders' 
        : '/api/orders/supplier/my-orders';
      
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await axios.get(`${endpoint}${params}`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const response = await axios.patch(`/api/orders/${orderId}/status`, {
        status: newStatus,
        supplierNotes: notes
      });
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(response.data.order);
      }
      
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
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

  const getNextStatus = (currentStatus: string) => {
    const transitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };
    return transitions[currentStatus] || [];
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {user?.role === 'vendor' ? 'My Orders' : 'Orders to Fulfill'}
          </h1>
          
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.role === 'vendor' 
                          ? (order.supplierId?.businessName || order.supplierId?.name)
                          : order.vendorId?.name
                        }
                      </h3>
                      <p className="text-sm text-gray-600">
                        Order #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">{order.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">₹{order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'vendor' ? 'Supplier Phone' : 'Vendor Phone'}
                    </p>
                    <p className="font-medium">
                      {user?.role === 'vendor' 
                        ? order.supplierId?.phone 
                        : order.vendorId?.phone
                      }
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items:</h4>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {item.name} ({item.quantity} {item.unit})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Supplier Actions */}
                {user?.role === 'supplier' && getNextStatus(order.status).length > 0 && (
                  <div className="flex space-x-2">
                    {getNextStatus(order.status).map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={() => updateOrderStatus(order._id, nextStatus)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          nextStatus === 'cancelled'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        Mark as {formatStatus(nextStatus)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {user?.role === 'vendor' 
                ? "You haven't placed any orders yet"
                : "No orders to fulfill at the moment"
              }
            </p>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Order ID:</span> #{selectedOrder._id.slice(-6)}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {formatStatus(selectedOrder.status)}
                        </span>
                      </p>
                      {user?.role === 'vendor' && (
                        <p><span className="font-medium">Supplier:</span> {selectedOrder.supplierId?.businessName || selectedOrder.supplierId?.name}</p>
                      )}
                      {user?.role === 'supplier' && (
                        <p><span className="font-medium">Vendor:</span> {selectedOrder.vendorId?.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.unitPrice}/{item.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.quantity} {item.unit}</p>
                            <p className="text-sm text-gray-600">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pricing</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{selectedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>₹{selectedOrder.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                        <span>Total:</span>
                        <span>₹{selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress}</p>
                      {selectedOrder.supplierNotes && (
                        <p><span className="font-medium">Supplier Notes:</span> {selectedOrder.supplierNotes}</p>
                      )}
                      {selectedOrder.estimatedDeliveryTime && (
                        <p><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimatedDeliveryTime).toLocaleString()}</p>
                      )}
                      {selectedOrder.actualDeliveryTime && (
                        <p><span className="font-medium">Delivered At:</span> {new Date(selectedOrder.actualDeliveryTime).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}