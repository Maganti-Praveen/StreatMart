import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Add review (vendors only)
router.post('/', authenticate, requireRole(['vendor']), async (req, res) => {
  try {
    const { orderId, supplierId, rating, comment, categories } = req.body;

    if (!orderId || !supplierId || !rating) {
      return res.status(400).json({ message: 'Order ID, supplier ID, and rating are required' });
    }

    // Verify order exists and belongs to vendor
    const order = await Order.findOne({
      _id: orderId,
      vendorId: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        message: 'Order not found, unauthorized, or not delivered yet' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    const review = new Review({
      vendorId: req.user._id,
      supplierId,
      orderId,
      rating,
      comment,
      categories
    });

    await review.save();

    // Update supplier's average rating
    await updateSupplierRating(supplierId);

    await review.populate([
      { path: 'vendorId', select: 'name' },
      { path: 'supplierId', select: 'name businessName' }
    ]);

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error adding review' });
  }
});

// Get supplier reviews
router.get('/supplier/:supplierId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ supplierId: req.params.supplierId })
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ supplierId: req.params.supplierId });

    // Calculate rating statistics
    const stats = await Review.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(req.params.supplierId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      }
    ]);

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }

    if (stats.length > 0) {
      stats[0].ratings.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats[0] || { averageRating: 0, totalReviews: 0 },
      ratingDistribution
    });
  } catch (error) {
    console.error('Get supplier reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// Get vendor's reviews
router.get('/vendor/my-reviews', authenticate, requireRole(['vendor']), async (req, res) => {
  try {
    const reviews = await Review.find({ vendorId: req.user._id })
      .populate('supplierId', 'name businessName')
      .populate('orderId', 'totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// Helper function to update supplier rating
async function updateSupplierRating(supplierId) {
  try {
    const stats = await Review.aggregate([
      { $match: { supplierId: mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(supplierId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        totalRatings: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Update supplier rating error:', error);
  }
}

export default router;