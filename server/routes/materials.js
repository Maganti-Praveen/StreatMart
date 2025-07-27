import express from 'express';
import Material from '../models/Material.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all materials with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, search, page = 1, limit = 20 } = req.query;
    
    let query = { isAvailable: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const materials = await Material.find(query)
      .populate('supplierId', 'name businessName rating totalRatings location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by location if provided
    let filteredMaterials = materials;
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      filteredMaterials = materials.filter(material => {
        const distance = calculateDistance(
          lat, lng,
          material.supplierId.location.lat,
          material.supplierId.location.lng
        );
        return distance <= material.deliveryRadiusKm;
      });
    }

    const total = await Material.countDocuments(query);

    res.json({
      materials: filteredMaterials,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Server error fetching materials' });
  }
});

// Get material by ID
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('supplierId', 'name businessName rating totalRatings location phone');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Server error fetching material' });
  }
});

// Add new material (suppliers only)
router.post('/', authenticate, requireRole(['supplier']), async (req, res) => {
  try {
    const {
      name, category, unitPrice, unit, stock, minOrderQuantity,
      image, description, deliveryRadiusKm, qualityGrade
    } = req.body;

    if (!name || !category || !unitPrice || !unit || stock === undefined || !deliveryRadiusKm) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const material = new Material({
      supplierId: req.user._id,
      name,
      category,
      unitPrice,
      unit,
      stock,
      minOrderQuantity: minOrderQuantity || 1,
      image,
      description,
      deliveryRadiusKm,
      qualityGrade: qualityGrade || 'B'
    });

    await material.save();
    await material.populate('supplierId', 'name businessName rating totalRatings location');

    res.status(201).json({
      message: 'Material added successfully',
      material
    });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ message: 'Server error adding material' });
  }
});

// Update material (suppliers only)
router.put('/:id', authenticate, requireRole(['supplier']), async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      supplierId: req.user._id
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found or unauthorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        material[key] = updates[key];
      }
    });

    await material.save();
    await material.populate('supplierId', 'name businessName rating totalRatings location');

    res.json({
      message: 'Material updated successfully',
      material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Server error updating material' });
  }
});

// Delete material (suppliers only)
router.delete('/:id', authenticate, requireRole(['supplier']), async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({
      _id: req.params.id,
      supplierId: req.user._id
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found or unauthorized' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Server error deleting material' });
  }
});

// Get supplier's materials
router.get('/supplier/my-materials', authenticate, requireRole(['supplier']), async (req, res) => {
  try {
    const materials = await Material.find({ supplierId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    console.error('Get supplier materials error:', error);
    res.status(500).json({ message: 'Server error fetching materials' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default router;