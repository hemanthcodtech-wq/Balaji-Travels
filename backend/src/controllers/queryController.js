import { sql } from '../config/db.js';

export const createQuery = async (req, res) => {
  try {
    const { name, email, phone, service_type, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    if (!sql) {
      return res.status(503).json({ success: false, message: 'Database is not configured yet. Please set DATABASE_URL.' });
    }

    const result = await sql`
      INSERT INTO queries (name, email, phone, service_type, message)
      VALUES (${name}, ${email || null}, ${phone}, ${service_type || null}, ${message || null})
      RETURNING *;
    `;

    res.status(201).json({
      success: true,
      message: 'Inquiry received successfully.',
      data: result[0],
    });
  } catch (error) {
    console.error('Error in createQuery:', error);
    res.status(500).json({ success: false, message: 'Server error saving query.' });
  }
};

export const getAllQueries = async (req, res) => {
  try {
    if (!sql) {
      return res.status(503).json({ success: false, message: 'Database is not configured yet.' });
    }

    const queries = await sql`
      SELECT * FROM queries ORDER BY created_at DESC;
    `;

    res.status(200).json({ success: true, count: queries.length, data: queries });
  } catch (error) {
    console.error('Error in getAllQueries:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving queries.' });
  }
};

export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await sql`
      UPDATE queries SET status = ${status} WHERE id = ${id} RETURNING *;
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM queries WHERE id = ${id};`;
    res.json({ success: true, message: 'Query deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
