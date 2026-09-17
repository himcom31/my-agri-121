// models/Enquiry.js
const { pool } = require('../config/db');

const createEnquiryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id                  INT AUTO_INCREMENT PRIMARY KEY,
      product_id          INT           NOT NULL,
      variant_id          INT           DEFAULT NULL,
      seller_id           INT           DEFAULT NULL,
      buyer_id            INT           DEFAULT NULL,
      buyer_name          VARCHAR(150)  NOT NULL,
      buyer_phone         VARCHAR(20)   NOT NULL,
      buyer_email         VARCHAR(150)  DEFAULT NULL,
      message             TEXT          DEFAULT NULL,
      buyer_address       TEXT          DEFAULT NULL,
      buyer_location_url  VARCHAR(500)  DEFAULT NULL,
      status              ENUM('New','Contacted','Closed') DEFAULT 'New',
      createdAt           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE SET NULL
    )
  `);
};
createEnquiryTable();

const BASE_SELECT = `
  SELECT
    e.*,
    p.name          AS productName,
    p.thumbnail     AS productImage,
    p.sellingPrice  AS productPrice,
    p.unit          AS productUnit,
    pv.label        AS variantLabel,
    pv.sellingPrice AS variantPrice,
    s.full_name     AS sellerName,
    s.shop_name     AS shopName,
    s.shop_category AS shopCategory,
    s.mobile        AS sellerWhatsapp,
    s.email         AS sellerEmail,
    s.shop_city     AS shopCity,
    s.shop_state    AS shopState
  FROM enquiries e
  LEFT JOIN products         p  ON p.id  = e.product_id
  LEFT JOIN product_variants pv ON pv.id = e.variant_id
  LEFT JOIN sellers          s  ON s.id  = e.seller_id
`;

const shape = (row) => {
  if (!row) return null;
  return {
    id:        row.id,
    status:    row.status,
    message:   row.message,
    createdAt: row.createdAt,

    buyer: {
      id:          row.buyer_id      ?? null,
      name:        row.buyer_name,
      phone:       row.buyer_phone,
      email:       row.buyer_email   ?? null,
      address:     row.buyer_address ?? null,
      locationUrl: row.buyer_location_url ?? null,
    },

    product: {
      id:    row.product_id,
      name:  row.productName,
      image: row.productImage,
      price: row.productPrice,
      unit:  row.productUnit,
    },

    variant: row.variant_id ? {
      id:    row.variant_id,
      label: row.variantLabel,
      price: row.variantPrice,
    } : null,

    seller: row.seller_id ? {
      id:       row.seller_id,
      name:     row.sellerName,
      shopName: row.shopName,
      category: row.shopCategory,
      whatsapp: row.sellerWhatsapp,
      email:    row.sellerEmail,
      city:     row.shopCity,
      state:    row.shopState,
    } : null,
  };
};

const Enquiry = {

  // ── Buyer: create enquiry ─────────────────────────────────────────────────
  create: async (data) => {
    const {
      productId, variantId, sellerId, buyerId,
      name, phone, email, message,
      address, locationUrl,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO enquiries
         (product_id, variant_id, seller_id, buyer_id,
          buyer_name, buyer_phone, buyer_email, message,
          buyer_address, buyer_location_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        variantId    ?? null,
        sellerId     ?? null,
        buyerId      ?? null,
        name,
        phone,
        email        ?? null,
        message      ?? null,
        address      ?? null,
        locationUrl  ?? null,
      ]
    );
    return result.insertId;
  },

  // ── Buyer: fetch their own enquiry history ────────────────────────────────
  findByBuyer: async (buyerId) => {
    const [rows] = await pool.query(
      `${BASE_SELECT} WHERE e.buyer_id = ? ORDER BY e.createdAt DESC`,
      [buyerId]
    );
    return rows.map(shape);
  },

  // ── Seller: fetch their leads ─────────────────────────────────────────────
  findBySeller: async (sellerId) => {
    const [rows] = await pool.query(
      `${BASE_SELECT} WHERE e.seller_id = ? ORDER BY e.createdAt DESC`,
      [sellerId]
    );
    return rows.map(shape);
  },

  // ── Admin: all enquiries (paginated + filtered) ───────────────────────────
  adminFind: async ({ status, search, page = 1, limit = 20 }) => {
    const where = [];
    const vals  = [];

    if (status && status !== 'All') {
      where.push(`e.status = ?`);
      vals.push(status);
    }

    if (search?.trim()) {
      where.push(`(
        e.buyer_name  LIKE ? OR
        e.buyer_phone LIKE ? OR
        p.name        LIKE ? OR
        s.shop_name   LIKE ?
      )`);
      const like = `%${search.trim()}%`;
      vals.push(like, like, like, like);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset   = (Number(page) - 1) * Number(limit);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM enquiries e
       LEFT JOIN products p ON p.id = e.product_id
       LEFT JOIN sellers  s ON s.id = e.seller_id
       ${whereSQL}`,
      vals
    );

    const [rows] = await pool.query(
      `${BASE_SELECT} ${whereSQL} ORDER BY e.createdAt DESC LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );

    return { enquiries: rows.map(shape), total: Number(total) };
  },

  // ── Admin: single enquiry ─────────────────────────────────────────────────
  findById: async (id) => {
    const [rows] = await pool.query(
      `${BASE_SELECT} WHERE e.id = ? LIMIT 1`,
      [id]
    );
    return shape(rows[0] ?? null);
  },

  // ── Admin: status update ──────────────────────────────────────────────────
  updateStatus: async (id, status) => {
    await pool.query(
      `UPDATE enquiries SET status = ? WHERE id = ?`,
      [status, id]
    );
    return Enquiry.findById(id);
  },
};

module.exports = Enquiry;