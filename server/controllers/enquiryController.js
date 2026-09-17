// controllers/enquiryController.js
const Enquiry = require('../models/Enquiry');
const { pool } = require('../config/db');

// ── POST /api/enquiry — buyer submits ────────────────────────────────────────
// controllers/enquiryController.js — createEnquiry function

const createEnquiry = async (req, res) => {
  try {
    const { productId, variantId, name, phone, message, address, locationUrl } = req.body; // ← address, locationUrl add kiya

    if (!productId || !name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'productId, name and phone are required.',
      });
    }

    const [productRows] = await pool.query(
      `SELECT id, name, seller_id FROM products WHERE id = ? LIMIT 1`,
      [productId]
    );
    if (!productRows.length) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const sellerId  = productRows[0].seller_id;
    const enquiryId = await Enquiry.create({
      productId,
      variantId:   variantId || null,
      sellerId,
      buyerId:     req.userId || null,
      name:        name.trim(),
      phone:       phone.trim(),
      email:       null,
      message:     message?.trim() || null,
      address:     address?.trim() || null,      // ← new
      locationUrl: locationUrl?.trim() || null,  // ← new
    });

    const [sellerRows] = await pool.query(
      `SELECT full_name AS name, mobile AS whatsapp, email
       FROM sellers WHERE id = ? LIMIT 1`,
      [sellerId]
    );

    return res.status(201).json({
      success: true,
      enquiryId,
      seller: sellerRows[0] || null,
    });

  } catch (err) {
    console.error('[POST /api/enquiry]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/enquiry/my — logged-in buyer's enquiry history ──────────────────
const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findByBuyer(req.userId);
    return res.status(200).json({ success: true, enquiries });
  } catch (err) {
    console.error('[GET /api/enquiry/my]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/enquiry/seller — seller's leads dashboard ───────────────────────
const getSellerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findBySeller(req.sellerId);
    return res.status(200).json({ success: true, enquiries });
  } catch (err) {
    console.error('[GET /api/enquiry/seller]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/enquiry/admin/all — admin: all enquiries ────────────────────────
const adminGetAllEnquiries = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const result = await Enquiry.adminFind({ status, search, page, limit });
    return res.status(200).json({
      success: true,
      ...result,
      page:  Number(page),
      pages: Math.ceil(result.total / Number(limit)),
    });
  } catch (err) {
    console.error('[GET /api/enquiry/admin/all]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/enquiry/admin/:id — admin: single enquiry ───────────────────────
const adminGetEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    return res.status(200).json({ success: true, enquiry });
  } catch (err) {
    console.error('[GET /api/enquiry/admin/:id]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PATCH /api/enquiry/admin/:id/status — admin: update status ───────────────
const adminUpdateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['New', 'Contacted', 'Closed'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }
    const enquiry = await Enquiry.updateStatus(req.params.id, status);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    return res.status(200).json({ success: true, enquiry });
  } catch (err) {
    console.error('[PATCH /api/enquiry/admin/:id/status]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getSellerEnquiries,
  adminGetAllEnquiries,
  adminGetEnquiryById,
  adminUpdateEnquiryStatus,
};