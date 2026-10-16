import { sql } from '../config/db.js';

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    if (!sql) {
      // Fallback if DB not connected
      if (username === 'admin' && password === 'admin123') {
        return res.json({
          success: true,
          user: { username: 'admin', role: 'Administrator' },
          token: 'token_db_fallback_' + Date.now(),
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const admins = await sql`
      SELECT id, username, password_hash, role
      FROM admins
      WHERE LOWER(username) = LOWER(${username.trim()})
      LIMIT 1;
    `;

    if (!admins || admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const admin = admins[0];

    // Check password
    if (admin.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    return res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      token: `token_${admin.id}_${Date.now()}`,
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const updateAdminCredentials = async (req, res) => {
  try {
    const { currentUsername, newUsername, newPassword } = req.body;

    if (!newUsername || !newPassword) {
      return res.status(400).json({ success: false, message: 'New username and password are required.' });
    }

    if (!sql) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    // Update the admin row
    const targetUser = currentUsername || 'admin';
    const result = await sql`
      UPDATE admins
      SET 
        username = ${newUsername.trim()},
        password_hash = ${newPassword},
        updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(username) = LOWER(${targetUser})
      RETURNING id, username, role;
    `;

    if (!result || result.length === 0) {
      // If none was updated, insert it
      const inserted = await sql`
        INSERT INTO admins (username, password_hash, role)
        VALUES (${newUsername.trim()}, ${newPassword}, 'Administrator')
        ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id, username, role;
      `;
      return res.json({
        success: true,
        message: 'Credentials updated successfully in database.',
        user: inserted[0],
      });
    }

    return res.json({
      success: true,
      message: 'Credentials updated successfully in database.',
      user: result[0],
    });
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    res.status(500).json({ success: false, message: 'Server error updating credentials.' });
  }
};
