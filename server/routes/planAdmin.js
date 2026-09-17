// routes/Admin/subscriptionPlan.routes.js
const express = require('express');
const router  = express.Router();

const { protect, isAdmin } = require('../middleware/authMiddleware');

const {
  createPlan,
  listAllPlansAdmin,
  updatePlan,
  deletePlan,
} = require('../controllers/SubscriptionController');


// ── Admin-only Subscription Plan Routes ──────────────
// protect  → verifies JWT, attaches req.user
// isAdmin  → checks req.user.role === 'admin' (ya jo bhi aapka field/check hai)

router.post('/plans',       protect,  createPlan);
router.get('/plans',        protect,  listAllPlansAdmin);
router.put('/plans/:id',    protect,  updatePlan);
router.delete('/plans/:id', protect,  deletePlan);


module.exports = router;