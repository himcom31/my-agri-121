const express = require('express');
const router  = express.Router();
const upload = require('../../config/cloudinary');

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../../controllers/User/UserController');

const {
  listPlans,
  createOrder,
  verifyPayment,getMySubscription
} = require('../../controllers/SubscriptionController');

// ← authOnlyToken add karo import mein
const { protectUser, authOnlyToken } = require('../../middleware/authMiddleware');


// ── Public Routes ────────────────────────────────────
router.post('/register',        register);
router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.get('/plans',            listPlans);


// ── Subscribe Routes (isActive check nahi) ──────────
router.post('/subscribe/create-order', authOnlyToken, createOrder);  // ← changed
router.post('/subscribe/verify',       authOnlyToken, verifyPayment); // ← changed


// ── Protected Routes (JWT + isActive required) ───────
router.get('/me',              protectUser, getMe);
router.put('/update-profile',  protectUser, upload.single('image'), updateProfile);
router.put('/change-password', protectUser, changePassword);
router.get('/my-subscription', protectUser, getMySubscription);


module.exports = router;