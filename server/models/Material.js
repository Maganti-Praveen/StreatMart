import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'dairy', 'oils', 'spices', 'grains', 'meat', 'others']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'liter', 'piece', 'packet', 'dozen']
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    maxlength: 500
  },
  deliveryRadiusKm: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'B'
  }
}, {
  timestamps: true
});

// Index for better query performance
materialSchema.index({ category: 1, supplierId: 1 });
materialSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Material', materialSchema);