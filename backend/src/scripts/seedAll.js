import { sql } from '../config/db.js';
import { exportedData } from '../../../tirupatibalajitours_travels-main/dist-data/exportAll.js';

const { fleet, tours, destinations, blogPosts, cabRoutes, servicePages } = exportedData;

async function seedAll() {
  if (!sql) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  console.log('🌱 Starting full data push to Neon PostgreSQL...');

  // 1. Fleets
  console.log(`Pushing ${fleet.length} vehicles to 'fleets'...`);
  for (const v of fleet) {
    await sql`
      INSERT INTO fleets (
        id, name, category, seats, bags, image, local, local_long,
        local_km_short, local_km_long, extra_hr, outstation, minimum, fuel, features, "use", slug
      ) VALUES (
        ${v.id}, ${v.name}, ${v.category}, ${v.seats}, ${v.bags}, ${v.image},
        ${v.local}, ${v.localLong}, ${v.localKmShort || '80 km'}, ${v.localKmLong || '150 km'},
        ${v.extraHr}, ${v.outstation}, ${v.minimum}, ${v.fuel},
        ${JSON.stringify(v.features || [])}, ${v.use}, ${v.slug}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        seats = EXCLUDED.seats,
        bags = EXCLUDED.bags,
        image = EXCLUDED.image,
        local = EXCLUDED.local,
        local_long = EXCLUDED.local_long,
        extra_hr = EXCLUDED.extra_hr,
        outstation = EXCLUDED.outstation,
        features = EXCLUDED.features,
        "use" = EXCLUDED."use",
        updated_at = CURRENT_TIMESTAMP;
    `;
  }
  console.log('✅ Fleets pushed.');

  // 2. Tours
  console.log(`Pushing ${tours.length} packages to 'tours'...`);
  await sql`TRUNCATE TABLE tours RESTART IDENTITY;`;
  for (const t of tours) {
    await sql`
      INSERT INTO tours (title, duration, route, price, image)
      VALUES (${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ${t[4]});
    `;
  }
  console.log('✅ Tours pushed.');

  // 3. Destinations
  console.log(`Pushing ${destinations.length} destinations to 'destinations'...`);
  for (const d of destinations) {
    await sql`
      INSERT INTO destinations (slug, name, "desc", image, price)
      VALUES (${d[0]}, ${d[1]}, ${d[2]}, ${d[3]}, ${d[4]})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        "desc" = EXCLUDED."desc",
        image = EXCLUDED.image,
        price = EXCLUDED.price,
        updated_at = CURRENT_TIMESTAMP;
    `;
  }
  console.log('✅ Destinations pushed.');

  // 4. Blogs
  console.log(`Pushing ${blogPosts.length} blog posts to 'blogs'...`);
  for (const b of blogPosts) {
    await sql`
      INSERT INTO blogs (
        id, slug, title, category, author, date, read_time,
        image, snippet, full_content, highlights, quick_facts, tags, views, featured
      ) VALUES (
        ${b.id}, ${b.slug}, ${b.title}, ${b.category || 'Pilgrimage'},
        ${b.author || 'Balaji Travels'}, ${b.date || '2026'}, ${b.readTime || '5 MIN READ'},
        ${b.image}, ${b.snippet}, ${JSON.stringify(b.fullContent || {})},
        ${JSON.stringify(b.highlights || [])}, ${JSON.stringify(b.quickFacts || {})},
        ${JSON.stringify(b.tags || [])}, ${b.views || '1,000+'}, ${b.featured || false}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        image = EXCLUDED.image,
        snippet = EXCLUDED.snippet,
        full_content = EXCLUDED.full_content,
        updated_at = CURRENT_TIMESTAMP;
    `;
  }
  console.log('✅ Blogs pushed.');

  // 5. Cab Routes
  console.log(`Pushing ${cabRoutes.length} cab routes to 'cab_routes'...`);
  for (const r of cabRoutes) {
    await sql`
      INSERT INTO cab_routes (
        slug, title, short_title, image, distance, time, starting, route, highlights, description, prices
      ) VALUES (
        ${r.slug}, ${r.title}, ${r.shortTitle}, ${r.image}, ${r.distance}, ${r.time},
        ${r.starting}, ${r.route}, ${JSON.stringify(r.highlights || [])},
        ${r.description}, ${JSON.stringify(r.prices || [])}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        short_title = EXCLUDED.short_title,
        image = EXCLUDED.image,
        distance = EXCLUDED.distance,
        time = EXCLUDED.time,
        starting = EXCLUDED.starting,
        route = EXCLUDED.route,
        highlights = EXCLUDED.highlights,
        description = EXCLUDED.description,
        prices = EXCLUDED.prices,
        updated_at = CURRENT_TIMESTAMP;
    `;
  }
  console.log('✅ Cab Routes pushed.');

  // 6. Service Pages
  const serviceKeys = Object.keys(servicePages);
  console.log(`Pushing ${serviceKeys.length} landing pages to 'service_pages'...`);
  for (const slug of serviceKeys) {
    const sp = servicePages[slug];
    await sql`
      INSERT INTO service_pages (
        slug, title, eyebrow, image, intro, why_title, why_intro,
        vehicles, outstation, highlights, feature_details, package_note, steps, faqs
      ) VALUES (
        ${slug}, ${sp.title}, ${sp.eyebrow || ''}, ${sp.image}, ${sp.intro},
        ${sp.whyTitle || ''}, ${sp.whyIntro || ''}, ${JSON.stringify(sp.vehicles || [])},
        ${sp.outstation || ''}, ${JSON.stringify(sp.highlights || [])},
        ${JSON.stringify(sp.featureDetails || [])}, ${sp.packageNote || ''},
        ${JSON.stringify(sp.steps || [])}, ${JSON.stringify(sp.faqs || [])}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        eyebrow = EXCLUDED.eyebrow,
        image = EXCLUDED.image,
        intro = EXCLUDED.intro,
        why_title = EXCLUDED.why_title,
        why_intro = EXCLUDED.why_intro,
        vehicles = EXCLUDED.vehicles,
        outstation = EXCLUDED.outstation,
        highlights = EXCLUDED.highlights,
        feature_details = EXCLUDED.feature_details,
        package_note = EXCLUDED.package_note,
        steps = EXCLUDED.steps,
        faqs = EXCLUDED.faqs,
        updated_at = CURRENT_TIMESTAMP;
    `;
  }
  console.log('✅ Service Pages pushed.');

  // 7. Seed Initial Queries
  const existingQueries = await sql`SELECT count(*) FROM queries;`;
  if (parseInt(existingQueries[0].count, 10) === 0) {
    await sql`
      INSERT INTO queries (id, name, phone, "from", "to", date, trip, vehicle, passengers, status)
      VALUES
        ('Q-101', 'Venkatesh Rao', '+91 98490 12345', 'Tirupati Railway Station', 'Tirumala Balaji Temple', '2026-09-28', 'Round Trip', 'Innova Crysta', '5', 'Confirmed'),
        ('Q-102', 'Suhasini Reddy', '+91 94401 67890', 'Tirupati Airport (TIR)', 'Srikalahasti Temple', '2026-09-30', 'One Way', 'Sedan (Dzire)', '3', 'Pending'),
        ('Q-103', 'Karthik Subbaraman', '+91 98840 99887', 'Tirupati City Hotel', 'Arunachalam (Tiruvannamalai)', '2026-10-05', 'Round Trip', 'Tempo Traveller 16 Seater', '14', 'Contacted')
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('✅ Initial enquiries seeded.');
  }

  console.log('🎉 SUCCESS: All pages and datasets pushed directly into Neon DB!');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
