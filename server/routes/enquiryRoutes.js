// routes/enquiryRoutes.js
const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const {
  createEnquiry,
  getMyEnquiries,
  getSellerEnquiries,
  adminGetAllEnquiries,
  adminGetEnquiryById,
  adminUpdateEnquiryStatus,
} = require('../controllers/enquiryController');

const { protect } = require('../middleware/authMiddleware'); // admin middleware

// ── User auth (required) — for GET /my ───────────────────────────────────────
// Decodes the user JWT and sets req.userId from token payload field "id"
const authUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    // Support common payload field names: id, userId, _id, sub
    req.userId = decoded.id || decoded.userId || decoded._id || decoded.sub || null;
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token payload' });
    }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    return res.status(401).json({ success: false, message: `Unauthorized: ${msg}` });
  }
};

// ── User auth (optional) — for POST / ────────────────────────────────────────
// If a valid user token is present, sets req.userId so buyer_id gets saved.
// If no token or invalid token, continues without blocking (guest fallback).
const optionalAuthUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId || decoded._id || decoded.sub || null;
  } catch {
    // Invalid/expired token — ignore, buyer_id will be null
  }
  next();
};

// ── Seller auth ───────────────────────────────────────────────────────────────
const authSeller = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    req.sellerId = decoded.sellerId;
    req.email    = decoded.email;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    return res.status(401).json({ message: `Unauthorized: ${msg}` });
  }
};

// ── Routes ────────────────────────────────────────────────────────────────────

// Public — but saves buyer_id if user is logged in
router.post('/', optionalAuthUser, createEnquiry);

// Buyer (must be logged in) — enquiry history
router.get('/my', authUser, getMyEnquiries);

// Seller (must be logged in)
router.get('/seller', authSeller, getSellerEnquiries);

// Admin (must be logged in)
router.get('/admin/all',          protect, adminGetAllEnquiries);
router.get('/admin/:id',          protect, adminGetEnquiryById);
router.patch('/admin/:id/status', protect, adminUpdateEnquiryStatus);

module.exports = router;