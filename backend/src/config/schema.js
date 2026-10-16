import { sql } from '../config/db.js';

export const initializeDatabase = async () => {
  if (!sql) {
    console.warn('⚠️ Skipping DB table initialization: DATABASE_URL is not configured.');
    return;
  }

  try {
    // 1. Queries / Contact submissions table
    await sql`
      CREATE TABLE IF NOT EXISTS queries (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        "from" TEXT,
        "to" TEXT,
        date VARCHAR(50),
        trip VARCHAR(100),
        vehicle VARCHAR(100),
        passengers VARCHAR(50),
        message TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure email & message columns exist if the table was created previously without them
    await sql`ALTER TABLE queries ADD COLUMN IF NOT EXISTS email VARCHAR(255);`;
    await sql`ALTER TABLE queries ADD COLUMN IF NOT EXISTS message TEXT;`;

    // 2. Bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50) NOT NULL,
        package_id VARCHAR(100),
        package_title VARCHAR(255),
        travel_date DATE,
        pickup_location TEXT,
        passengers INT DEFAULT 1,
        total_amount NUMERIC(10, 2),
        payment_status VARCHAR(50) DEFAULT 'unpaid',
        payment_txnid VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Fleets table
    await sql`
      CREATE TABLE IF NOT EXISTS fleets (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        seats VARCHAR(50),
        bags VARCHAR(50),
        image TEXT,
        local VARCHAR(100),
        local_long VARCHAR(100),
        local_km_short VARCHAR(50),
        local_km_long VARCHAR(50),
        extra_hr VARCHAR(50),
        outstation VARCHAR(50),
        minimum VARCHAR(50),
        fuel VARCHAR(50),
        features JSONB,
        use TEXT,
        slug VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Tours table
    await sql`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        duration VARCHAR(100),
        route TEXT,
        price VARCHAR(100),
        image TEXT,
        prices JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Destinations table
    await sql`
      CREATE TABLE IF NOT EXISTS destinations (
        slug VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "desc" TEXT,
        image TEXT,
        price VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Blogs table
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        author VARCHAR(255),
        date VARCHAR(100),
        read_time VARCHAR(50),
        image TEXT,
        snippet TEXT,
        full_content JSONB,
        highlights JSONB,
        quick_facts JSONB,
        tags JSONB,
        views VARCHAR(50),
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Cab Routes table (for all 12 Cab Distance Pages)
    await sql`
      CREATE TABLE IF NOT EXISTS cab_routes (
        slug VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_title VARCHAR(255),
        image TEXT,
        distance VARCHAR(100),
        time VARCHAR(100),
        starting VARCHAR(100),
        route TEXT,
        highlights JSONB,
        description TEXT,
        prices JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 8. Service Pages table (for all 13 Taxi & Package Landing Pages)
    await sql`
      CREATE TABLE IF NOT EXISTS service_pages (
        slug VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        eyebrow VARCHAR(255),
        image TEXT,
        intro TEXT,
        why_title VARCHAR(255),
        why_intro TEXT,
        vehicles JSONB,
        outstation TEXT,
        highlights JSONB,
        feature_details JSONB,
        package_note TEXT,
        steps JSONB,
        faqs JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 9. Payments table (Easebuzz transactions)
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        txnid VARCHAR(255) UNIQUE NOT NULL,
        easebuzz_id VARCHAR(255),
        amount NUMERIC(10, 2) NOT NULL,
        firstname VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        productinfo TEXT NOT NULL,
        return_url TEXT,
        status VARCHAR(50) DEFAULT 'initiated',
        payment_mode VARCHAR(100),
        error_message TEXT,
        raw_response JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 10. Admins table for persistent credentials
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Administrator',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed default admin if table is empty (admin / admin123)
    await sql`
      INSERT INTO admins (username, password_hash, role)
      VALUES ('admin', 'admin123', 'Administrator')
      ON CONFLICT (username) DO NOTHING;
    `;

    console.log('✅ Neon DB comprehensive tables initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error.message);
  }
};
