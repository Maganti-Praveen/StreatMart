import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  categories: {
    quality: { type: Number, min: 1, max: 5 },
    delivery: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
});

// Ensure one review per order
reviewSchema.index({ orderId: 1 }, { unique: true });
reviewSchema.index({ supplierId: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);