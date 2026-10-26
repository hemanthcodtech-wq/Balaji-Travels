import { useState } from 'react';
import { Luggage, Wind, ShieldCheck, Clock3, Fuel, Users, MapPin, CreditCard, Check } from 'lucide-react';
import Page from './PageTemplate';
import { images, whatsapp } from '../data/siteData';
import { fleetCategories } from '../data/fleetData';
import { getVehicleInfo } from '../data/packageData';
import StatsBanner from '../components/StatsBanner';
import ScrollReveal from '../components/ScrollReveal';
import EasebuzzModal from '../components/EasebuzzModal';
import SEO from '../components/SEO';
import { useData } from '../context/DataContext';
import './Fleet.css';
import './FleetOverride.css';
import './FleetMobileOrder.css';

function FleetCardItem({ vehicle, onBook }) {
  const { selectBooking } = useData();
  const [selectedRate, setSelectedRate] = useState('local'); // 'local' | 'localLong' | 'outstation'

  const vInfo = getVehicleInfo(vehicle.name || vehicle.id) || vehicle;
  const rawExtraHr = (vehicle.extraHr && vehicle.extraHr !== 'extra hr') ? vehicle.extraHr : (vInfo.extraHr || '₹200/hr');
  const rawOutstation = vehicle.outstation || vInfo.outstation || '₹15/km';

  const extraHrStr = rawExtraHr.replace(/\/hr?$/i, '/hr');
  const extraKmStr = `${rawOutstation.replace(/\/km?$/i, '')}/extra km`;
  const localExtraInfo = `${extraHrStr} & ${extraKmStr}`;
  const outstationExtraInfo = vehicle.minimum ? (vehicle.minimum.toLowerCase().startsWith('min') ? vehicle.minimum : `Min ${vehicle.minimum}`) : 'Min 300 km/day';

  const cleanPrice = (p) => p ? p.split('/')[0].trim() : '';

  const rateOptions = [
    { key: 'local', label: 'Local 8h / 80km', price: cleanPrice(vehicle.local), subText: localExtraInfo },
    { key: 'localLong', label: 'Local 12h / 150km', price: cleanPrice(vehicle.localLong), subText: localExtraInfo },
    { key: 'outstation', label: 'Outstation', price: vehicle.outstation, subText: outstationExtraInfo }
  ];

  const currentOption = rateOptions.find(r => r.key === selectedRate) || rateOptions[0];

  const waMessage = `Hi, I want to book ${vehicle.name} in Tirupati for ${currentOption.label} (${currentOption.price}). Please share availability.`;

  const handleBookClick = () => {
    const isOutstation = selectedRate === 'outstation';
    const tripType = isOutstation ? 'Outstation Tour' : 'Local Sightseeing';
    const defaultDest = isOutstation ? 'Outstation Tour (Arunachalam / Vellore)' : 'Tirupati Local Sightseeing (8h / 80km)';

    selectBooking({
      vehicle: vehicle.name,
      trip: tripType,
      to: defaultDest,
      price: currentOption.price
    });

    onBook({ 
      name: vehicle.name, 
      service: `${vehicle.name} - ${currentOption.label} (${currentOption.price})`, 
      price: currentOption.price,
      selectedRateKey: selectedRate,
      type: 'vehicle'
    });
  };

  return (
    <article className="rental-card">
      <div className="vehicle-media">
        <img src={vehicle.image} alt={`${vehicle.name} rental in Tirupati`} loading="lazy" />
        <span className="media-type">{vehicle.category}</span>
        <div className="media-bottom">
          <span className="media-rate">{currentOption.price}</span>
          <span className="media-seats"><Users size={14} /> {vehicle.seats}</span>
        </div>
      </div>

      <div className="rental-info">
        <div className="vehicle-heading">
          <div>
            <span className="vehicle-category">{vehicle.category}</span>
            <h3>{vehicle.name}</h3>
          </div>
          <span className="vehicle-capacity">{vehicle.seats} seats</span>
        </div>

        <p className="vehicle-summary">{vehicle.use}</p>

        <div className="vehicle-features">
          {Array.isArray(vehicle.features) ? (
            vehicle.features.map(feature => (
              <span key={feature}><Wind size={13} /> {feature}</span>
            ))
          ) : (
            <span><Wind size={13} /> {vehicle.features}</span>
          )}
          <span><Luggage size={13} /> {vehicle.bags} bags</span>
          <span><Fuel size={13} /> {vehicle.fuel}</span>
        </div>

        {/* SELECTABLE RATES SECTION */}
        <div className="selectable-rates-container" style={{ marginTop: '0.85rem', marginBottom: '0.85rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
            SELECT RATE PLAN:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            {rateOptions.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedRate(opt.key)}
                style={{
                  padding: '0.55rem 0.35rem',
                  borderRadius: 10,
                  border: selectedRate === opt.key ? '2px solid #d97706' : '1.5px solid #cbd5e1',
                  background: selectedRate === opt.key ? '#fffdf5' : '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: selectedRate === opt.key ? '0 4px 12px rgba(217, 119, 6, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <small style={{ fontSize: '0.65rem', fontWeight: 800, color: selectedRate === opt.key ? '#d97706' : '#64748b', textTransform: 'uppercase' }}>
                  {opt.label}
                </small>
                <b style={{ fontSize: '0.82rem', fontWeight: 800, color: '#060c2c', whiteSpace: 'nowrap' }}>
                  {opt.price}
                </b>
                <small style={{ fontSize: '0.58rem', fontWeight: 700, color: '#d97706', display: 'block', marginTop: '1px', lineHeight: 1.2 }}>
                  {opt.subText}
                </small>
              </button>
            ))}
          </div>
        </div>

        <p className="vehicle-minimum"><MapPin size={14} /> Outstation minimum {vehicle.minimum}</p>

        <div className="rent-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
          <a
            className="button"
            style={{ flex: 1 }}
            href={`${whatsapp}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noreferrer"
          >
            Book on WhatsApp
          </a>
          <button
            type="button"
            className="button"
            style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderColor: '#0284c7' }}
            onClick={handleBookClick}
          >
            Book 💳
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Fleet() {
  const { fleets } = useData();
  const [selectedPayVehicle, setSelectedPayVehicle] = useState(null);

  return (
    <Page
      eyebrow="FLEET & RENTALS"
      title="Choose the right vehicle for your journey."
      text="From economical Tirupati cabs to premium Urbania, Tempo Travellers and large buses, choose the space, comfort and price point that fits your trip."
      image={images.hero}
    >
      <SEO
        title="Cab Fleet & Vehicle Rental Tariff in Tirupati | Taxi in Tirupati"
        description="View our clean AC vehicle fleet: Sedans, Ertiga, Innova Crysta, Fortuner, Tempo Travellers, Force Urbania and luxury buses with transparent rate cards."
        canonical="https://taxi-in-tirupati.com/fleet"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taxi-in-tirupati.com/' },
            { '@type': 'ListItem', position: 2, name: 'Fleet', item: 'https://taxi-in-tirupati.com/fleet' }
          ]
        }}
      />
      <section className="content" id="rentals">
        {(() => {
          const startingLocal = fleets.find(f => f.local)?.local?.split('/')[0]?.trim() || '₹2,880';
          const startingLocalLong = fleets.find(f => f.localLong)?.localLong?.split('/')[0]?.trim() || '₹3,650';
          const startingOutstation = fleets.find(f => f.outstation)?.outstation || '₹15/km';

          return (
            <div className="fleet-pricing-strip">
              <div>
                <span>LOCAL • 8 HOURS / 80 KM</span>
                <strong>From {startingLocal}</strong>
              </div>
              <div>
                <span>LOCAL • 12 HOURS / 150 KM</span>
                <strong>From {startingLocalLong}</strong>
              </div>
              <div>
                <span>OUTSTATION</span>
                <strong>From {startingOutstation} • 300 km/day min</strong>
              </div>
            </div>
          );
        })()}

        {(() => {
          // Define category definitions with matching criteria
          const baseGroups = [
            {
              key: 'cars',
              eyebrow: 'CARS & TAXIS',
              label: 'Sedans, MUVs & Premium SUVs',
              note: 'Local packages below are 8 hours / 80 km and 12 hours / 150 km. Outstation pricing is charged per km.',
              matches: (v) => {
                const cat = (v.category || '').toUpperCase();
                const id = (v.id || '').toLowerCase();
                const name = (v.name || '').toLowerCase();
                return ['sedan', 'ertiga', 'innova-crysta', 'hycross', 'fortuner'].includes(id) ||
                  cat.includes('SEDAN') || cat.includes('MUV') || cat.includes('SUV') || cat.includes('CAR') ||
                  name.includes('sedan') || name.includes('etios') || name.includes('dzire') || name.includes('ertiga') || name.includes('innova') || name.includes('hycross') || name.includes('fortuner');
              }
            },
            {
              key: 'tempo',
              eyebrow: 'TEMPO TRAVELLERS',
              label: 'Tempo Travellers (12, 16, 20 Seater)',
              note: 'Spacious AC push-back tempo travellers ideal for family pilgrimages and group outstation tours.',
              matches: (v) => {
                const cat = (v.category || '').toUpperCase();
                const id = (v.id || '').toLowerCase();
                const name = (v.name || '').toLowerCase();
                return ['tempo-12', 'tempo-16', 'tempo-20'].includes(id) ||
                  (cat.includes('TEMPO') && !cat.includes('URBANIA')) ||
                  (name.includes('tempo') && !name.includes('urbania'));
              }
            },
            {
              key: 'urbania',
              eyebrow: 'PREMIUM GROUP TRAVEL',
              label: 'Force Urbania Luxury Vans',
              note: 'Ultimate luxury and comfort with individual AC vents, push-back executive seating and panoramic windows.',
              matches: (v) => {
                const cat = (v.category || '').toUpperCase();
                const id = (v.id || '').toLowerCase();
                const name = (v.name || '').toLowerCase();
                return ['urbania-12', 'urbania-16'].includes(id) ||
                  cat.includes('URBANIA') || name.includes('urbania');
              }
            },
            {
              key: 'bus',
              eyebrow: 'LARGE GROUP TRAVEL',
              label: 'Mini Buses & Luxury Coaches',
              note: 'Heavy-duty 27 to 45 seater luxury AC buses for large group darshans, weddings and institutional tours.',
              matches: (v) => {
                const cat = (v.category || '').toUpperCase();
                const id = (v.id || '').toLowerCase();
                const name = (v.name || '').toLowerCase();
                return ['bus-27', 'bus-40', 'bus-45'].includes(id) ||
                  cat.includes('BUS') || cat.includes('COACH') || name.includes('bus') || name.includes('coach');
              }
            }
          ];

          // Track which vehicles got matched
          const matchedIds = new Set();
          const groupsWithItems = baseGroups.map(group => {
            const items = fleets.filter(v => {
              if (group.matches(v)) {
                matchedIds.add(v.id);
                return true;
              }
              return false;
            });
            return { ...group, items };
          });

          // Any other vehicles added by admin with a custom category
          const remainingVehicles = fleets.filter(v => !matchedIds.has(v.id));
          if (remainingVehicles.length > 0) {
            // Group the remaining vehicles by their custom category
            const customCats = {};
            remainingVehicles.forEach(v => {
              const catName = v.category || 'Special Vehicles';
              if (!customCats[catName]) customCats[catName] = [];
              customCats[catName].push(v);
            });

            Object.entries(customCats).forEach(([catName, items]) => {
              groupsWithItems.push({
                key: `custom-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                eyebrow: 'SPECIAL FLEET',
                label: catName,
                note: 'Special vehicle options configured in fleet management.',
                items
              });
            });
          }

          return groupsWithItems.map(category => {
            const items = category.items;
            if (!items || items.length === 0) return null;

            return (
              <section className="fleet-group" id={category.key} key={category.key} style={{ marginTop: '2.5rem' }}>
                <div className="fleet-group-heading">
                  <div>
                    <span className="eyebrow">{category.eyebrow}</span>
                    <h3>{category.label}</h3>
                    {category.note && (
                      <p className="fleet-category-note">
                        {category.note}
                      </p>
                    )}
                  </div>
                  <span>{items.length} options</span>
                </div>

                <div className="vehicle-slider">
                  {items.map((v, idx) => (
                    <ScrollReveal key={v.id} direction="up" delay={idx * 0.06}>
                      <FleetCardItem 
                        vehicle={v} 
                        onBook={(payload) => setSelectedPayVehicle(payload)} 
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            );
          });
        })()}

        <ScrollReveal direction="up">
          <div className="fleet-intro">
            <div>
              <p className="eyebrow">OUR FLEET</p>
              <h2>Comfort for small groups. Space for everyone.</h2>
              <p className="fleet-subcopy">
                Local rates are shown for 8-hour / 80-km and 12-hour / 150-km packages. Outstation travel uses the published per-kilometre rate with a 300 km/day minimum.
              </p>
            </div>
            <div className="fleet-trust">
              <span><ShieldCheck /> Professional drivers</span>
              <span><Wind /> AC vehicles</span>
              <span><Clock3 /> 24/7 support</span>
            </div>
          </div>
        </ScrollReveal>

        <StatsBanner title="Extensive Vehicle Availability" subtitle="FLEET ADVANTAGE" />

        <div className="fleet-pricing-note" style={{ marginTop: '3rem' }}>
          <strong>Pricing note</strong>
          <span>
            Rates are based on the supplied fleet rate sheet. Tolls, parking, permits, state taxes and other trip-specific charges may apply. Final pricing is confirmed on WhatsApp.
          </span>
        </div>
      </section>

      {/* Easebuzz Checkout Modal */}
      {selectedPayVehicle && (
        <EasebuzzModal 
          isOpen={Boolean(selectedPayVehicle)}
          onClose={() => setSelectedPayVehicle(null)}
          initialData={{
            type: 'vehicle',
            service: selectedPayVehicle.service || `${selectedPayVehicle.name} Booking`,
            vehicle: selectedPayVehicle.name,
            selectedRateKey: selectedPayVehicle.selectedRateKey || 'local',
            amount: '1000',
            fullAmount: selectedPayVehicle.price || '2880'
          }}
        />
      )}
    </Page>
  );
}
