import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, pincode, address, businessName } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !phone || !pincode || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get location from pincode (mock implementation)
    const location = await getLocationFromPincode(pincode);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      pincode,
      address,
      businessName: role === 'supplier' ? businessName : undefined,
      location
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Profile
router.get('/profile', authenticate, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Update Profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address, businessName } = req.body;
    
    const updateData = { name, phone, address };
    if (req.user.role === 'supplier' && businessName) {
      updateData.businessName = businessName;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Helper function to get location from pincode
async function getLocationFromPincode(pincode) {
  try {
    // Mock implementation - in production, use actual geolocation API
    const mockLocations = {
      '110001': { lat: 28.6139, lng: 77.2090 }, // New Delhi
      '400001': { lat: 18.9322, lng: 72.8264 }, // Mumbai
      '560001': { lat: 12.9716, lng: 77.5946 }, // Bangalore
      '600001': { lat: 13.0827, lng: 80.2707 }, // Chennai
      '700001': { lat: 22.5726, lng: 88.3639 }  // Kolkata
    };
    
    return mockLocations[pincode] || { lat: 28.6139, lng: 77.2090 };
  } catch (error) {
    return { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
  }
}

export default router;