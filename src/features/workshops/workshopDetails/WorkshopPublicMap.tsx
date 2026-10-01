import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type WorkshopPublicMapProps = {
  latitude: string;
  longitude: string;
  shopName: string;
};

// Leaflet default marker paths break under Vite unless configured explicitly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function parseCoordinate(value: string) {
  const parsed = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function MapViewportSync({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView({ lat, lng }, 15, { animate: false });
    // Tab panels often mount with zero size briefly; refresh tiles after layout.
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [lat, lng, map]);

  return null;
}

export function WorkshopPublicMap({ latitude, longitude, shopName }: WorkshopPublicMapProps) {
  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  const hasCoordinates = lat != null && lng != null;

  if (!hasCoordinates) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-sm text-[#888] sm:h-60">
        لم يتم تحديد موقع الورشة على الخريطة بعد
      </div>
    );
  }

  return (
    <div className="h-52 overflow-hidden rounded-xl border border-[#e8e8e8] sm:h-60">
      <MapContainer
        key={`${lat}-${lng}`}
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        aria-label={`موقع ${shopName} على الخريطة`}
      >
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapViewportSync lat={lat} lng={lng} />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
