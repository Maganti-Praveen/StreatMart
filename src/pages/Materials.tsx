import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, ShoppingCart, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Material {
  _id: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  stock: number;
  description?: string;
  supplierId: {
    _id: string;
    name: string;
    businessName: string;
    rating: number;
    totalRatings: number;
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface CartItem {
  materialId: string;
  name: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  supplierId: string;
  supplierName: string;
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'oils', label: 'Oils' },
    { value: 'spices', label: 'Spices' },
    { value: 'grains', label: 'Grains' },
    { value: 'meat', label: 'Meat' },
    { value: 'others', label: 'Others' }
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, selectedCategory]);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/materials');
      setMaterials(response.data.materials);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplierId.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplierId.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    setFilteredMaterials(filtered);
  };

  const addToCart = (material: Material, quantity: number) => {
    const existingItem = cart.find(item => item.materialId === material._id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.materialId === material._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        materialId: material._id,
        name: material.name,
        unitPrice: material.unitPrice,
        unit: material.unit,
        quantity,
        supplierId: material.supplierId._id,
        supplierName: material.supplierId.businessName || material.supplierId.name
      }]);
    }

    toast.success(`Added ${quantity} ${material.unit} of ${material.name} to cart`);
  };

  const removeFromCart = (materialId: string) => {
    setCart(cart.filter(item => item.materialId !== materialId));
  };

  const updateCartQuantity = (materialId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(materialId);
      return;
    }

    setCart(cart.map(item =>
      item.materialId === materialId
        ? { ...item, quantity }
        : item
    ));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      // Group cart items by supplier
      const ordersBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.supplierId]) {
          acc[item.supplierId] = {
            supplierId: item.supplierId,
            supplierName: item.supplierName,
            items: []
          };
        }
        acc[item.supplierId].items.push({
          materialId: item.materialId,
          quantity: item.quantity
        });
        return acc;
      }, {} as any);

      // Place orders for each supplier
      const orderPromises = Object.values(ordersBySupplier).map(async (orderGroup: any) => {
        return axios.post('/api/orders/place', {
          supplierId: orderGroup.supplierId,
          items: orderGroup.items,
          deliveryAddress: 'Default delivery address' // You can make this dynamic
        });
      });

      await Promise.all(orderPromises);
      
      setCart([]);
      setShowCart(false);
      toast.success('Orders placed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Raw Materials</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search materials or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material._id}
              material={material}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-colors z-40"
          >
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="bg-white text-orange-500 rounded-full px-2 py-1 text-sm font-bold">
                {getTotalItems()}
              </span>
            </div>
          </button>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {cart.length > 0 ? (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.materialId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.supplierName}</p>
                            <p className="text-sm text-gray-900">₹{item.unitPrice}/{item.unit}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.materialId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.materialId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.materialId)}
                              className="ml-2 text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">Total: ₹{getTotalAmount().toFixed(2)}</span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      >
                        Place Order
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MaterialCardProps {
  material: Material;
  onAddToCart: (material: Material, quantity: number) => void;
}

function MaterialCard({ material, onAddToCart }: MaterialCardProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
          <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
            {material.category}
          </span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">
            {material.supplierId.businessName || material.supplierId.name}
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm text-gray-600">
                {material.supplierId.rating.toFixed(1)} 
                ({material.supplierId.totalRatings} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
            ₹{material.unitPrice}
            <span className="text-sm text-gray-600 font-normal">/{material.unit}</span>
          </p>
          <p className="text-sm text-gray-600">Stock: {material.stock} {material.unit}</p>
        </div>

        {material.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>
        )}

        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-3 py-1 border-x border-gray-300">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(material.stock, quantity + 1))}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onAddToCart(material, quantity)}
            disabled={material.stock === 0}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}