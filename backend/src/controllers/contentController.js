import { sql } from '../config/db.js';

// --- FLEETS ---
export const getFleets = async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM fleets ORDER BY created_at ASC;`;
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createFleet = async (req, res) => {
  try {
    const v = req.body;
    const id = v.id || `vehicle-${Date.now()}`;
    const result = await sql`
      INSERT INTO fleets (
        id, name, category, seats, bags, image, local, local_long,
        local_km_short, local_km_long, extra_hr, outstation, minimum, fuel, features, "use", slug
      ) VALUES (
        ${id}, ${v.name}, ${v.category}, ${v.seats}, ${v.bags}, ${v.image},
        ${v.local}, ${v.localLong || v.local_long}, ${v.localKmShort || v.local_km_short || '80 km'},
        ${v.localKmLong || v.local_km_long || '150 km'}, ${v.extraHr || v.extra_hr}, ${v.outstation},
        ${v.minimum}, ${v.fuel}, ${JSON.stringify(v.features || [])}, ${v.use}, ${v.slug || ''}
      )
      RETURNING *;
    `;
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFleet = async (req, res) => {
  try {
    const { id } = req.params;
    const v = req.body;
    const result = await sql`
      UPDATE fleets SET
        name = COALESCE(${v.name}, name),
        category = COALESCE(${v.category}, category),
        seats = COALESCE(${v.seats}, seats),
        bags = COALESCE(${v.bags}, bags),
        image = COALESCE(${v.image}, image),
        local = COALESCE(${v.local}, local),
        local_long = COALESCE(${v.localLong || v.local_long}, local_long),
        extra_hr = COALESCE(${v.extraHr || v.extra_hr}, extra_hr),
        outstation = COALESCE(${v.outstation}, outstation),
        minimum = COALESCE(${v.minimum}, minimum),
        fuel = COALESCE(${v.fuel}, fuel),
        features = COALESCE(${JSON.stringify(v.features)}, features),
        "use" = COALESCE(${v.use}, "use"),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `;
    res.json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteFleet = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM fleets WHERE id = ${id};`;
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- TOURS ---
export const getTours = async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM tours ORDER BY id ASC;`;
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTour = async (req, res) => {
  try {
    const t = req.body;
    const result = await sql`
      INSERT INTO tours (title, duration, route, price, image, prices)
      VALUES (
        ${t.title || t[0]},
        ${t.duration || t[1]},
        ${t.route || t[2]},
        ${t.price || t[3]},
        ${t.image || t[4]},
        ${JSON.stringify(t.prices || [])}
      )
      RETURNING *;
    `;
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    const result = await sql`
      UPDATE tours SET
        title = COALESCE(${t.title || t[0]}, title),
        duration = COALESCE(${t.duration || t[1]}, duration),
        route = COALESCE(${t.route || t[2]}, route),
        price = COALESCE(${t.price || t[3]}, price),
        image = COALESCE(${t.image || t[4]}, image),
        prices = CASE WHEN ${t.prices !== undefined} THEN ${JSON.stringify(t.prices || [])}::jsonb ELSE prices END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `;
    res.json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM tours WHERE id = ${id};`;
    res.json({ success: true, message: 'Tour deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- DESTINATIONS ---
export const getDestinations = async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM destinations ORDER BY created_at ASC;`;
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDestination = async (req, res) => {
  try {
    const d = req.body;
    const slug = d.slug || d[0] || d.name?.toLowerCase().replace(/\s+/g, '-');
    const result = await sql`
      INSERT INTO destinations (slug, name, "desc", image, price)
      VALUES (${slug}, ${d.name || d[1]}, ${d.desc || d[2]}, ${d.image || d[3]}, ${d.price || d[4]})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        "desc" = EXCLUDED."desc",
        image = EXCLUDED.image,
        price = EXCLUDED.price,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const { slug } = req.params;
    const d = req.body;
    const result = await sql`
      UPDATE destinations SET
        name = COALESCE(${d.name || d[1]}, name),
        "desc" = COALESCE(${d.desc || d[2]}, "desc"),
        image = COALESCE(${d.image || d[3]}, image),
        price = COALESCE(${d.price || d[4]}, price),
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = ${slug}
      RETURNING *;
    `;
    res.json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const { slug } = req.params;
    await sql`DELETE FROM destinations WHERE slug = ${slug};`;
    res.json({ success: true, message: 'Destination deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- BLOGS ---
export const getBlogs = async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM blogs ORDER BY created_at DESC;`;
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `blog-${Date.now()}`;
    const slug = b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = await sql`
      INSERT INTO blogs (
        id, slug, title, category, author, date, read_time,
        image, snippet, full_content, highlights, quick_facts, tags, views, featured
      ) VALUES (
        ${id}, ${slug}, ${b.title}, ${b.category || 'Pilgrimage'},
        ${b.author || 'Balaji Travels'}, ${b.date || '2026'}, ${b.readTime || '5 MIN READ'},
        ${b.image}, ${b.snippet}, ${JSON.stringify(b.fullContent || {})},
        ${JSON.stringify(b.highlights || [])}, ${JSON.stringify(b.quickFacts || {})},
        ${JSON.stringify(b.tags || [])}, ${b.views || '1,000+'}, ${b.featured || false}
      )
      RETURNING *;
    `;
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    const result = await sql`
      UPDATE blogs SET
        title = COALESCE(${b.title}, title),
        slug = COALESCE(${b.slug}, slug),
        category = COALESCE(${b.category}, category),
        image = COALESCE(${b.image}, image),
        snippet = COALESCE(${b.snippet}, snippet),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} OR slug = ${id}
      RETURNING *;
    `;
    res.json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM blogs WHERE id = ${id} OR slug = ${id};`;
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- CAB ROUTES & SERVICE PAGES READ APIs ---
export const getCabRoutes = async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM cab_routes ORDER BY created_at ASC;`;
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getServicePages = async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM service_pages ORDER BY created_at ASC;`;
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
