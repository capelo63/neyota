'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { VisibleProfile } from './page';

// Custom circular markers — avoids the default icon path issue
const makeIcon = (color: string) =>
  L.divIcon({
    html: `<div style="width:18px;height:18px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45);"></div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });

const ENTREPRENEUR_ICON = makeIcon('#f97316'); // orange-500
const TALENT_ICON       = makeIcon('#22c55e'); // green-500

function BoundsController({ profiles }: { profiles: VisibleProfile[] }) {
  const map = useMap();
  useEffect(() => {
    const points = profiles
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => [p.latitude!, p.longitude!] as [number, number]);
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 10 });
    }
  }, [profiles, map]);
  return null;
}

export default function PartnerMap({
  profiles,
  onProfileClick,
}: {
  profiles: VisibleProfile[];
  onProfileClick: (p: VisibleProfile) => void;
}) {
  const withCoords = profiles.filter((p) => p.latitude != null && p.longitude != null);

  return (
    <MapContainer
      center={[46.8, 2.3]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsController profiles={withCoords} />

      {withCoords.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude!, p.longitude!]}
          icon={p.role === 'entrepreneur' ? ENTREPRENEUR_ICON : TALENT_ICON}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-semibold text-neutral-900">{p.first_name} {p.last_name}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{p.city}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                p.role === 'entrepreneur' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
              }`}>
                {p.role === 'entrepreneur' ? 'Porteur' : 'Talent'}
              </span>
              <br />
              <button
                onClick={() => onProfileClick(p)}
                className="mt-2 text-primary-600 text-xs font-medium hover:underline"
              >
                Voir le profil →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
