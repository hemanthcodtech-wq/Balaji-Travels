import { sql } from '../config/db.js';

export const createBooking = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      package_id,
      package_title,
      travel_date,
      pickup_location,
      passengers,
      total_amount
    } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
    }

    if (!sql) {
      return res.status(503).json({ success: false, message: 'Database is not configured yet.' });
    }

    const result = await sql`
      INSERT INTO bookings (
        customer_name,
        customer_email,
        customer_phone,
        package_id,
        package_title,
        travel_date,
        pickup_location,
        passengers,
        total_amount
      ) VALUES (
        ${customer_name},
        ${customer_email || null},
        ${customer_phone},
        ${package_id || null},
        ${package_title || null},
        ${travel_date ? new Date(travel_date) : null},
        ${pickup_location || null},
        ${passengers || 1},
        ${total_amount || 0}
      )
      RETURNING *;
    `;

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: result[0],
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    if (!sql) {
      return res.status(503).json({ success: false, message: 'Database is not configured yet.' });
    }

    const bookings = await sql`
      SELECT * FROM bookings ORDER BY created_at DESC;
    `;

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving bookings.' });
  }
};
