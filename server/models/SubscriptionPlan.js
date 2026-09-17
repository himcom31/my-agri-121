const { pool } = require('../config/db');

const SubscriptionPlan = {
    create: async ({ name, price, durationDays }) => {
        const [result] = await pool.query(
            `INSERT INTO subscription_plans (name, price, durationDays) VALUES (?, ?, ?)`,
            [name, price, durationDays]
        );
        const [rows] = await pool.query(`SELECT * FROM subscription_plans WHERE id = ?`, [result.insertId]);
        return rows[0];
    },

    findAllActive: async () => {
        const [rows] = await pool.query(`SELECT * FROM subscription_plans WHERE isActive = true ORDER BY price ASC`);
        return rows;
    },

    findAll: async () => {
        const [rows] = await pool.query(`SELECT * FROM subscription_plans ORDER BY createdAt DESC`);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM subscription_plans WHERE id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    },

    update: async (id, data) => {
        const allowed = ['name', 'price', 'durationDays', 'isActive'];
        const fields = Object.keys(data).filter(f => allowed.includes(f));
        if (fields.length === 0) return await SubscriptionPlan.findById(id);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await pool.query(`UPDATE subscription_plans SET ${setClause} WHERE id = ?`, [...fields.map(f => data[f]), id]);
        return await SubscriptionPlan.findById(id);
    },

    remove: async (id) => {
        await pool.query(`DELETE FROM subscription_plans WHERE id = ?`, [id]);
    },
};

module.exports = SubscriptionPlan;