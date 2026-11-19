// controllers/sellerController.js
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const crypto     = require("crypto");
const Razorpay   = require("razorpay");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const { pool }   = require("../config/db");
require("dotenv").config();

// ── Validate required environment variables at startup ─────────────
const REQUIRED_ENV = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "JWT_SECRET",
];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// ── Cloudinary config ──────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Razorpay instance ──────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Nodemailer transporter ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,                // smtp.hostinger.com
  port: parseInt(process.env.EMAIL_PORT),      // 465
  secure: true,                                // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helpers ────────────────────────────────────────────────────────

/** Generate a 6-digit OTP */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Returns OTP expiry time (UTC + 10 minutes) as a MySQL DATETIME string.
 * Uses Date.now() to guarantee UTC regardless of server timezone.
 */
const otpExpiry = () => {
  const d = new Date(Date.now() + 10 * 60 * 1000);
  return d.toISOString().slice(0, 19).replace("T", " ");
};

/** Upload a file buffer to Cloudinary and return the secure URL */
const uploadToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(fileBuffer);
  });

/**
 * Decides whether the shop address should be used as pickup.
 * Pickup counts as "provided" only when a pickup street is filled in.
 */
const resolveSameAsShop = (sameAsShop, pickupStreet) => {
  const pickupProvided = !!(pickupStreet && String(pickupStreet).trim());
  const isTrue = sameAsShop === "true" || sameAsShop === true;
  return isTrue || !pickupProvided ? 1 : 0;
};

// ══════════════════════════════════════════════════════════════════
// 1. SEND OTP
// POST /api/seller/send-otp
// Body: { email }
// ══════════════════════════════════════════════════════════════════
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id FROM sellers WHERE email = ?",
      [email]
    );
    if (rows.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp       = generateOtp();
    const expiresAt = otpExpiry();

    // Invalidate any existing unused OTPs for this email
    await pool.execute(
      "UPDATE email_otps SET used = 1 WHERE email = ? AND used = 0",
      [email]
    );

    await pool.execute(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // Email failure is logged but does NOT block the response
    try {
      const info = await transporter.sendMail({
        from: `"Maharashtra Bazaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Maharashtra Bazaar Kart Seller OTP",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;padding:32px">
            <h2 style="color:#2d5a1b;margin:0 0 8px">Verify Your Email</h2>
            <p style="color:#6b7280;margin:0 0 24px">Use this OTP to verify your email address for seller registration.</p>
            <div style="background:#f0fdf4;border:2px dashed #3a7d1e;border-radius:10px;text-align:center;padding:20px 0;margin-bottom:24px">
              <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2d5a1b">${otp}</span>
            </div>
            <p style="color:#9ca3af;font-size:13px">Valid for <strong>10 minutes</strong>. Do not share this with anyone.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2026 Maharashtra Bazaar</p>
          </div>
        `,
      });
      console.log("OTP email sent:", info.response);
    } catch (mailErr) {
      console.error("OTP email failed (OTP still saved in DB):", mailErr.message);
    }

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
};

// ══════════════════════════════════════════════════════════════════
// 2. VERIFY OTP
// POST /api/seller/verify-otp
// Body: { email, otp }
// ══════════════════════════════════════════════════════════════════
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id FROM email_otps
       WHERE email = ?
         AND otp = ?
         AND used = 0
         AND expires_at > UTC_TIMESTAMP()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, String(otp)]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await pool.execute(
      "UPDATE email_otps SET used = 1 WHERE id = ?",
      [rows[0].id]
    );

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Verification failed. Try again." });
  }
};

// ══════════════════════════════════════════════════════════════════
// 3. REGISTER SELLER
// POST /api/seller/register  (multipart/form-data)
// ══════════════════════════════════════════════════════════════════
const registerSeller = async (req, res) => {
  try {
    // ── Verify Razorpay payment first ──────────────────────────────
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment not completed. Please pay the registration fee." });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Please contact support." });
    }

    const {
      fullName, email, mobile, password, dob,
      shopName, shopCategory, shopStreet, shopCity, shopState, shopPincode,
      deliveryCharge, shopDescription,
      panNumber, aadharNumber,
      sameAsShop, pickupStreet, pickupCity, pickupState, pickupPincode,
      workingHoursFrom, workingHoursTo,
      termsAccepted, commissionAccepted,
    } = req.body;

    // ── Validate required fields (PAN is optional) ─────────────────
    const requiredFields = {
      fullName, email, mobile, password,
      shopName, shopCategory, shopStreet, shopCity, shopState, shopPincode,
      aadharNumber,
    };
    const missing = Object.keys(requiredFields).filter(
      (k) => !requiredFields[k] || String(requiredFields[k]).trim() === ""
    );
    if (missing.length) {
      return res.status(400).json({
        message: `Required fields missing: ${missing.join(", ")}`,
      });
    }

    // ── Check email OTP was verified ───────────────────────────────
    const [otpVerified] = await pool.execute(
      `SELECT id FROM email_otps
       WHERE email = ? AND used = 1
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );
    if (!otpVerified.length) {
      return res.status(403).json({
        message: "Email not verified. Please complete OTP verification first.",
      });
    }

    // ── Check for duplicate email ──────────────────────────────────
    const [exists] = await pool.execute(
      "SELECT id FROM sellers WHERE email = ?",
      [email]
    );
    if (exists.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // ── Validate PAN only if provided ──────────────────────────────
    const panClean = panNumber ? String(panNumber).toUpperCase().trim() : "";
    if (panClean && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panClean)) {
      return res.status(400).json({ message: "Invalid PAN number format" });
    }

    // ── Validate Aadhaar (12 digits) ───────────────────────────────
    const aadharClean = String(aadharNumber).replace(/\s/g, "");
    if (!/^\d{12}$/.test(aadharClean)) {
      return res.status(400).json({ message: "Invalid Aadhar number. Must be 12 digits." });
    }

    // ── Upload PAN card image (optional) ───────────────────────────
    let panCardUrl = null;
    if (req.file) {
      try {
        panCardUrl = await uploadToCloudinary(
          req.file.buffer,
          "gramin_cart/pan_cards"
        );
      } catch (uploadErr) {
        console.error("PAN card upload failed:", uploadErr.message);
        return res.status(500).json({
          message: "Failed to upload PAN card image. Please try again.",
        });
      }
    }

    // ── Hash password ──────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Mask Aadhaar (store only last 4 digits) ────────────────────
    const maskedAadhar = "XXXX-XXXX-" + aadharClean.slice(-4);

    // ── Pickup logic ───────────────────────────────────────────────
    const sameAsShopBool = resolveSameAsShop(sameAsShop, pickupStreet);

    // If pickup is same as shop, use shop address for pickup columns.
    // Otherwise use the pickup values (street is guaranteed to exist here).
    const pickupStreetFinal  = sameAsShopBool ? shopStreet.trim()  : pickupStreet.trim();
    const pickupCityFinal    = sameAsShopBool ? shopCity.trim()    : (pickupCity?.trim()    || null);
    const pickupStateFinal   = sameAsShopBool ? shopState.trim()   : (pickupState?.trim()   || null);
    const pickupPincodeFinal = sameAsShopBool ? shopPincode.trim() : (pickupPincode?.trim() || null);

    // ── Insert seller record ───────────────────────────────────────
    await pool.execute(
      `INSERT INTO sellers (
        full_name, email, mobile, password_hash, dob,
        shop_name, shop_category, shop_street, shop_city, shop_state, shop_pincode,
        delivery_charge, shop_description,
        pan_number, aadhar_number, pan_card_url,
        same_as_shop, pickup_street, pickup_city, pickup_state, pickup_pincode,
        working_hours_from, working_hours_to,
        terms_accepted, commission_accepted
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        fullName.trim(),
        email.trim().toLowerCase(),
        mobile.trim(),
        passwordHash,
        dob || null,
        shopName.trim(),
        shopCategory.trim(),
        shopStreet.trim(),
        shopCity.trim(),
        shopState.trim(),
        shopPincode.trim(),
        parseFloat(deliveryCharge) || 0,
        shopDescription ? shopDescription.trim() : null,
        panClean || null,
        maskedAadhar,
        panCardUrl,
        sameAsShopBool,
        pickupStreetFinal,
        pickupCityFinal,
        pickupStateFinal,
        pickupPincodeFinal,
        workingHoursFrom || "09:00:00",
        workingHoursTo   || "18:00:00",
        termsAccepted      === "true" ? 1 : 0,
        commissionAccepted === "true" ? 1 : 0,
      ]
    );

    // ── Send welcome email (non-blocking) ──────────────────────────
    try {
      await transporter.sendMail({
        from: `"Maharashtra Bazaar" <${process.env.EMAIL_USER}>`,
        to: email.trim().toLowerCase(),
        subject: "Welcome to Maharashtra Bazaar — Registration Received",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;padding:32px">
            <h2 style="color:#2d5a1b">Welcome, ${fullName}!</h2>
            <p>Your seller registration on <strong>Maharashtra Bazaar</strong> has been received.</p>
            <p>Our team will review your details and <strong>approve your account within 24–48 hours</strong>. You will receive a confirmation email once approved.</p>
            <p style="color:#9ca3af;font-size:13px">Questions? Write to us at rahul.gawali1414@gmail.com</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2026 Maharashtra Bazaar</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Welcome email failed:", mailErr.message);
    }

    // ── Issue token for the new seller ─────────────────────────────
    const [newSeller] = await pool.execute(
      "SELECT id, email, shop_name FROM sellers WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    const token = jwt.sign(
      {
        sellerId: newSeller[0].id,
        email:    newSeller[0].email,
        shopName: newSeller[0].shop_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      token,
    });
  } catch (err) {
    console.error("registerSeller error:", err);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

// ══════════════════════════════════════════════════════════════════
// 4. LOGIN
// POST /api/seller/login
// Body: { email, password }
// ══════════════════════════════════════════════════════════════════
const loginSeller = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM sellers WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const seller = rows[0];

    if (!seller.is_active) {
      return res.status(403).json({
        message: "Account has been deactivated. Please contact support.",
      });
    }

    // Approval check intentionally disabled — re-enable when admin approval flow is ready
    // if (!seller.is_approved) {
    //   return res.status(403).json({
    //     message: "Your account is pending admin approval. Please wait 24–48 hours.",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, seller.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        sellerId: seller.id,
        email:    seller.email,
        shopName: seller.shop_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      seller: {
        id:           seller.id,
        fullName:     seller.full_name,
        email:        seller.email,
        shopName:     seller.shop_name,
        shopCategory: seller.shop_category,
        isApproved:   seller.is_approved,
      },
    });
  } catch (err) {
    console.error("loginSeller error:", err);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ══════════════════════════════════════════════════════════════════
// 5. GET PROFILE  (protected)
// GET /api/seller/profile
// ══════════════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         id, full_name, email, mobile, dob,
         shop_name, shop_category,
         shop_street, shop_city, shop_state, shop_pincode,
         delivery_charge, shop_description,
         same_as_shop,
         pickup_street, pickup_city, pickup_state, pickup_pincode,
         working_hours_from, working_hours_to,
         is_approved, profile_pic_url, created_at
       FROM sellers
       WHERE id = ?`,
      [req.sellerId]
    );
    // pan_number, aadhar_number, pan_card_url are intentionally excluded.

    if (!rows.length) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.json({ seller: rows[0] });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ══════════════════════════════════════════════════════════════════
// 6. UPDATE PROFILE  (protected)
// PUT /api/seller/profile
// Body: JSON — any updatable field
// ══════════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const {
      fullName, mobile, dob,
      shopName, shopCategory,
      shopStreet, shopCity, shopState, shopPincode,
      deliveryCharge, shopDescription,
      sameAsShop, pickupStreet, pickupCity, pickupState, pickupPincode,
      workingHoursFrom, workingHoursTo,
    } = req.body;

    const sameAsShopBool = resolveSameAsShop(sameAsShop, pickupStreet);

    await pool.execute(
      `UPDATE sellers SET
        full_name          = COALESCE(?, full_name),
        mobile             = COALESCE(?, mobile),
        dob                = COALESCE(?, dob),
        shop_name          = COALESCE(?, shop_name),
        shop_category      = COALESCE(?, shop_category),
        shop_street        = COALESCE(?, shop_street),
        shop_city          = COALESCE(?, shop_city),
        shop_state         = COALESCE(?, shop_state),
        shop_pincode       = COALESCE(?, shop_pincode),
        delivery_charge    = COALESCE(?, delivery_charge),
        shop_description   = COALESCE(?, shop_description),
        same_as_shop       = ?,
        pickup_street      = COALESCE(?, pickup_street),
        pickup_city        = COALESCE(?, pickup_city),
        pickup_state       = COALESCE(?, pickup_state),
        pickup_pincode     = COALESCE(?, pickup_pincode),
        working_hours_from = COALESCE(?, working_hours_from),
        working_hours_to   = COALESCE(?, working_hours_to)
      WHERE id = ?`,
      [
        fullName?.trim()        || null,
        mobile?.trim()          || null,
        dob                     || null,
        shopName?.trim()        || null,
        shopCategory?.trim()    || null,
        shopStreet?.trim()      || null,
        shopCity?.trim()        || null,
        shopState?.trim()       || null,
        shopPincode?.trim()     || null,
        deliveryCharge != null  ? parseFloat(deliveryCharge) : null,
        shopDescription?.trim() || null,
        sameAsShopBool,
        pickupStreet?.trim()    || null,
        pickupCity?.trim()      || null,
        pickupState?.trim()     || null,
        pickupPincode?.trim()   || null,
        workingHoursFrom        || null,
        workingHoursTo          || null,
        req.sellerId,
      ]
    );

    return res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Update failed. Please try again." });
  }
};

// ══════════════════════════════════════════════════════════════════
// 7. UPLOAD PROFILE PIC  (protected)
// POST /api/seller/profile/pic
// multipart/form-data — field: profilePic
// ══════════════════════════════════════════════════════════════════
const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let profilePicUrl;
    try {
      profilePicUrl = await uploadToCloudinary(
        req.file.buffer,
        "gramin_cart/profile_pics"
      );
    } catch (uploadErr) {
      console.error("Profile pic upload failed:", uploadErr.message);
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }

    await pool.execute(
      "UPDATE sellers SET profile_pic_url = ? WHERE id = ?",
      [profilePicUrl, req.sellerId]
    );

    return res.json({ message: "Profile picture updated", profilePicUrl });
  } catch (err) {
    console.error("updateProfilePic error:", err);
    return res.status(500).json({ message: "Failed to update profile picture." });
  }
};

// ══════════════════════════════════════════════════════════════════
// 8. GET SELLER ORDERS  (protected)
// ══════════════════════════════════════════════════════════════════
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    // Step 1: product IDs belonging to this seller
    const [productRows] = await pool.execute(
      `SELECT id FROM products WHERE seller_id = ?`,
      [sellerId]
    );

    if (productRows.length === 0) {
      return res.json({ success: true, orders: [], total: 0 });
    }

    const productIds = productRows.map((p) => p.id);
    const placeholders = productIds.map(() => "?").join(",");

    // Step 2: order IDs containing any of these products
    const [orderIdRows] = await pool.execute(
      `SELECT DISTINCT order_id FROM order_items WHERE product_id IN (${placeholders})`,
      productIds
    );

    if (orderIdRows.length === 0) {
      return res.json({ success: true, orders: [], total: 0 });
    }

    const orderIds = orderIdRows.map((r) => r.order_id);
    const orderPlaceholders = orderIds.map(() => "?").join(",");

    // Step 3: order details (delivery location only, no customer PII)
    const [rows] = await pool.execute(
      `SELECT
          o.id, o.orderNumber, o.status, o.paymentMethod, o.paymentStatus,
          o.subtotal, o.discount, o.shippingCharge, o.tax, o.total,
          o.couponCode, o.couponDiscount,
          o.note, o.createdAt, o.estimatedDeliveryAt,
          o.deliveredAt, o.cancelledAt,
          o.addr_city    AS delivery_city,
          o.addr_state   AS delivery_state,
          o.addr_pincode AS delivery_pincode,
          o.addr_type    AS delivery_type
       FROM orders o
       WHERE o.id IN (${orderPlaceholders})
       ORDER BY o.createdAt DESC`,
      orderIds
    );

    // Step 4: items (only this seller's) and status history per order
    const ordersWithItems = await Promise.all(rows.map(async (row) => {
      const [items] = await pool.execute(
        `SELECT
            oi.id, oi.name, oi.image, oi.price, oi.quantity, oi.total, oi.unit,
            pv.label AS variantLabel
         FROM order_items oi
         LEFT JOIN product_variants pv ON pv.id = oi.variant_id
         WHERE oi.order_id = ? AND oi.product_id IN (${placeholders})`,
        [row.id, ...productIds]
      );

      const [history] = await pool.execute(
        `SELECT status, note, changedAt
         FROM order_status_history
         WHERE order_id = ?
         ORDER BY changedAt ASC`,
        [row.id]
      );

      return {
        id:                  row.id,
        orderNumber:         row.orderNumber,
        status:              row.status,
        paymentMethod:       row.paymentMethod,
        paymentStatus:       row.paymentStatus,
        subtotal:            row.subtotal,
        discount:            row.discount,
        shippingCharge:      row.shippingCharge,
        tax:                 row.tax,
        total:               row.total,
        couponCode:          row.couponCode,
        couponDiscount:      row.couponDiscount,
        note:                row.note,
        createdAt:           row.createdAt,
        estimatedDeliveryAt: row.estimatedDeliveryAt,
        deliveredAt:         row.deliveredAt,
        cancelledAt:         row.cancelledAt,
        shippingAddress: {
          city:    row.delivery_city,
          state:   row.delivery_state,
          pincode: row.delivery_pincode,
          type:    row.delivery_type,
        },
        items,
        statusHistory: history,
      };
    }));

    return res.json({
      success: true,
      orders:  ordersWithItems,
      total:   ordersWithItems.length,
    });
  } catch (err) {
    console.error("[GET /api/seller/orders]", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// ══════════════════════════════════════════════════════════════════
// 9. CREATE PAYMENT ORDER  (registration fee)
// POST /api/seller/create-order
// ══════════════════════════════════════════════════════════════════
const createPaymentOrder = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT setting_value FROM platform_settings WHERE setting_key = 'seller_registration_fee' LIMIT 1"
    );
    const fee = rows.length ? parseFloat(rows[0].setting_value) : 499;

    const order = await razorpay.orders.create({
      amount:   Math.round(fee * 100), // paise
      currency: "INR",
      receipt:  `seller_reg_${Date.now()}`,
    });
    return res.json({ orderId: order.id, amount: order.amount, fee });
  } catch (err) {
    console.error("createPaymentOrder error:", err);
    return res.status(500).json({ message: "Failed to create payment order. Try again." });
  }
};

module.exports = {
  sendOtp, verifyOtp, registerSeller, loginSeller,
  getProfile, updateProfile, updateProfilePic, getSellerOrders,
  createPaymentOrder,
};