const { pool } = require('../config/db');

exports.getLocationSuggestions = async (req, res) => {
  try {
    const { type, q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ suggestions: [] });

    const search = `%${q.trim()}%`;
    let query = '';

    if (type === 'district') {
      query = `SELECT DISTINCT district AS value FROM products 
               WHERE district LIKE ? AND district != '' 
               ORDER BY district ASC LIMIT 8`;
    } else if (type === 'pincode') {
      query = `SELECT DISTINCT pincode AS value FROM products 
               WHERE pincode LIKE ? AND pincode != '' 
               ORDER BY pincode ASC LIMIT 8`;
    } else if (type === 'address') {
      query = `
        SELECT DISTINCT village AS value FROM products 
        WHERE village LIKE ? AND village IS NOT NULL AND village != ''
        UNION
        SELECT DISTINCT address AS value FROM products 
        WHERE address LIKE ? AND address IS NOT NULL AND address != ''
        LIMIT 8`;
    } else {
      return res.json({ suggestions: [] });
    }

    const params = type === 'address' ? [search, search] : [search];
    const [rows] = await pool.query(query, params);

    res.json({ suggestions: rows.map(r => r.value).filter(Boolean) });
  } catch (err) {
    console.error('Suggestion error:', err);
    res.json({ suggestions: [] });
  }
};