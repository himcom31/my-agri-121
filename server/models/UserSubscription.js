const { pool } = require('../config/db');

const UserSubscription = {
    create: async ({ userId, planId, amount, razorpay_order_id }) => {
        const [result] = await pool.query(
            `INSERT INTO user_subscriptions (user_id, plan_id, amount, razorpay_order_id, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [userId, planId, amount, razorpay_order_id]
        );
        const [rows] = await pool.query(`SELECT * FROM user_subscriptions WHERE id = ?`, [result.insertId]);
        return rows[0];
    },

    findByOrderId: async (razorpay_order_id) => {
        const [rows] = await pool.query(
            `SELECT * FROM user_subscriptions WHERE razorpay_order_id = ? LIMIT 1`,
            [razorpay_order_id]
        );
        return rows[0] ?? null;
    },

    // ── Latest subscription for a user (pending/active/failed/expired), newest first ──
    getLatestForUser: async (userId) => {
        const [rows] = await pool.query(
            `SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        return rows[0] ?? null;
    },

    activate: async (id, { razorpay_payment_id, startDate, endDate }) => {
        await pool.query(
            `UPDATE user_subscriptions SET status = 'active', razorpay_payment_id = ?, startDate = ?, endDate = ? WHERE id = ?`,
            [razorpay_payment_id, startDate, endDate, id]
        );
    },

    // ── Used by the cron job: all subscriptions that are 'active' but past their endDate ──
    findOverdueActive: async () => {
        const [rows] = await pool.query(
            `SELECT * FROM user_subscriptions WHERE status = 'active' AND endDate < NOW()`
        );
        return rows;
    },

    markExpiredByIds: async (ids) => {
        if (!ids.length) return;
        await pool.query(`UPDATE user_subscriptions SET status = 'expired' WHERE id IN (?)`, [ids]);
    },
};

module.exports = UserSubscription;