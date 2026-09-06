// client/src/pages/patient/tabs/HospitalsMapTab.jsx
// Nawaloka Hospital location on OpenStreetMap via Leaflet.js (no API key needed)
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const HOSPITALS = [
  {
    id: 1,
    name: 'Nawaloka General Hospital',
    code: 'NWL01',
    lat: 6.9142,
    lng: 79.8567,
    address: '23 Deshamanya H. K. Dharmadasa Mw, Colombo 2',
    phone: '+94 11 254 4444',
    emergency: '+94 11 254 4444 ext. 0',
    specialties: ['Cardiology', 'Paediatrics', 'General Medicine', 'Orthopaedics', 'Neurology'],
    beds: 300,
    isActive: true,
  },
  {
    id: 2,
    name: 'National Hospital of Sri Lanka',
    code: 'NHSL',
    lat: 6.9178,
    lng: 79.8640,
    address: 'Regent Street, Colombo 10',
    phone: '+94 11 269 1111',
    emergency: '+94 11 269 1111',
    specialties: ['All specialties', 'Trauma Centre', 'Burns Unit', 'Transplant'],
    beds: 3500,
    isActive: true,
  },
  {
    id: 3,
    name: 'Lanka Hospitals',
    code: 'LH01',
    lat: 6.8905,
    lng: 79.8618,
    address: '578 Elvitigala Mawatha, Narahenpita, Colombo 5',
    phone: '+94 11 553 0000',
    emergency: '+94 11 553 0000',
    specialties: ['Cardiac Surgery', 'Oncology', 'IVF', 'Robotic Surgery'],
    beds: 350,
    isActive: true,
  },
];

const HospitalsMapTab = () => {
  useEffect(() => {
    // Dynamically load Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icons (webpack/vite path issue)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const container = document.getElementById('hospital-map');
      if (!container || container._leaflet_id) return;

      const map = L.map('hospital-map', {
        center: [6.9142, 79.8567],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom icons
      const primaryIcon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#00d4ff,#0080ff);width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 12px rgba(0,212,255,0.5)">
          <span style="transform:rotate(45deg);font-size:16px">🏥</span></div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const secondaryIcon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#8b5cf6,#6366f1);width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 3px 10px rgba(139,92,246,0.5)">
          <span style="transform:rotate(45deg);font-size:13px">🏥</span></div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      HOSPITALS.forEach((h) => {
        const icon = h.code === 'NWL01' ? primaryIcon : secondaryIcon;
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`;
        const popup = L.popup({ maxWidth: 280 }).setContent(`
          <div style="font-family:system-ui,sans-serif;padding:4px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1e293b">${h.name}</div>
            ${h.code === 'NWL01' ? '<span style="background:#00d4ff;color:#fff;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600">YOUR HOSPITAL</span>' : ''}
            <div style="margin-top:8px;font-size:12px;color:#475569">
              <div>📍 ${h.address}</div>
              <div style="margin-top:4px">📞 ${h.phone}</div>
              <div style="margin-top:4px">🚑 Emergency: ${h.emergency}</div>
              <div style="margin-top:6px"><strong>Specialties:</strong> ${h.specialties.slice(0,3).join(', ')}</div>
              <div style="margin-top:4px">🛏️ ${h.beds} beds</div>
            </div>
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
              style="display:block;margin-top:10px;padding:7px 14px;background:linear-gradient(135deg,#00d4ff,#0080ff);color:white;border-radius:8px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">
              🗺️ Get Directions
            </a>
          </div>
        `);
        L.marker([h.lat, h.lng], { icon }).addTo(map).bindPopup(popup);
      });

      // Auto-open Nawaloka popup
      setTimeout(() => {
        map.eachLayer((layer) => {
          if (layer.getLatLng && layer.getLatLng().lat === 6.9142) layer.openPopup();
        });
      }, 500);
    };

    initMap();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-1)' }}>
          🗺️ Hospital Locations
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Find hospitals near you. Click a marker to see details and get directions.
        </p>
      </div>

      {/* Quick info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
        {HOSPITALS.map((h) => (
          <div key={h.id} className="glass-card" style={{ padding: 'var(--sp-4)', borderLeft: h.code === 'NWL01' ? '3px solid var(--cyan)' : '3px solid var(--indigo)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{h.name}</span>
              {h.code === 'NWL01' && <span className="badge" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--cyan)', fontSize: '0.65rem' }}>Your Hospital</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>📍 {h.address}</div>
              <div>📞 {h.phone}</div>
              <div>🛏️ {h.beds} beds</div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10,
                padding: '6px 12px', borderRadius: 'var(--r-md)', fontSize: '0.78rem', fontWeight: 600,
                background: h.code === 'NWL01' ? 'rgba(0,212,255,0.12)' : 'rgba(129,140,248,0.12)',
                color: h.code === 'NWL01' ? 'var(--cyan)' : 'var(--indigo)',
                border: h.code === 'NWL01' ? '1px solid rgba(0,212,255,0.25)' : '1px solid rgba(129,140,248,0.25)',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Get Directions
            </a>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--r-xl)' }}>
        <div
          id="hospital-map"
          style={{ width: '100%', height: 420, borderRadius: 'var(--r-xl)' }}
        />
      </div>

      <p style={{ marginTop: 'var(--sp-3)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Map data © OpenStreetMap contributors · Click markers to see hospital details
      </p>
    </div>
  );
};

export default HospitalsMapTab;
