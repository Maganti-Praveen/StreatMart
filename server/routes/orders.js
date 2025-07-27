import express from 'express';
import Order from '../models/Order.js';
import Material from '../models/Material.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Place order (vendors only)
router.post('/place', authenticate, requireRole(['vendor']), async (req, res) => {
  try {
    const { supplierId, items, deliveryAddress } = req.body;

    if (!supplierId || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Validate and calculate order total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const material = await Material.findById(item.materialId);
      if (!material || !material.isAvailable) {
        return res.status(400).json({ 
          message: `Material ${item.materialId} is not available` 
        });
      }

      if (material.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${material.name}. Available: ${material.stock}` 
        });
      }

      const itemTotal = material.unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        materialId: material._id,
        name: material.name,
        quantity: item.quantity,
        unitPrice: material.unitPrice,
        unit: material.unit
      });

      // Update stock
      material.stock -= item.quantity;
      await material.save();
    }

    const deliveryFee = 50; // Fixed delivery fee
    const totalAmount = subtotal + deliveryFee;

    const order = new Order({
      vendorId: req.user._id,
      supplierId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      vendorPhone: req.user.phone
    });

    await order.save();
    await order.populate([
      { path: 'vendorId', select: 'name phone' },
      { path: 'supplierId', select: 'name businessName phone' }
    ]);

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error placing order' });
  }
});

// Get vendor orders
router.get('/vendor/my-orders', authenticate, requireRole(['vendor']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { vendorId: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('supplierId', 'name businessName phone rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get supplier orders
router.get('/supplier/my-orders', authenticate, requireRole(['supplier']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { supplierId: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('vendorId', 'name phone address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Update order status (suppliers only)
router.patch('/:orderId/status', authenticate, requireRole(['supplier']), async (req, res) => {
  try {
    const { status, supplierNotes, estimatedDeliveryTime } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      supplierId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${order.status} to ${status}` 
      });
    }

    order.status = status;
    if (supplierNotes) order.supplierNotes = supplierNotes;
    if (estimatedDeliveryTime) order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    if (status === 'delivered') order.actualDeliveryTime = new Date();

    await order.save();
    await order.populate([
      { path: 'vendorId', select: 'name phone' },
      { path: 'supplierId', select: 'name businessName phone' }
    ]);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// Get order details
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('vendorId', 'name phone address')
      .populate('supplierId', 'name businessName phone rating');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.vendorId._id.toString() !== req.user._id.toString() && 
        order.supplierId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

export default router;