import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

type Coordinates = {
  lat: number;
  lng: number;
};

type WorkshopLocationMapProps = {
  latitude: string;
  longitude: string;
  onLocationChange: (latitude: string, longitude: string) => void;
};

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "unsupported";

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function parseCoordinate(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCoordinates(latitude: string, longitude: string): Coordinates {
  return {
    lat: parseCoordinate(latitude, DEFAULT_LAT),
    lng: parseCoordinate(longitude, DEFAULT_LNG),
  };
}

// Leaflet default marker paths break under Vite unless configured explicitly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapViewportSync({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView({ lat, lng }, map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  return null;
}

function MapInteractions({ onPick }: { onPick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export function WorkshopLocationMap({ latitude, longitude, onLocationChange }: WorkshopLocationMapProps) {
  const hasRequestedLocation = useRef(false);
  const hasCoordinatesRef = useRef(Boolean(latitude && longitude));
  const [status, setStatus] = useState<LocationStatus>(() => (latitude && longitude ? "ready" : "idle"));

  const position = useMemo(() => toCoordinates(latitude, longitude), [latitude, longitude]);
  const hasCoordinates = Boolean(latitude && longitude);

  useEffect(() => {
    hasCoordinatesRef.current = hasCoordinates;
  }, [hasCoordinates]);

  const applyCoordinates = useCallback(
    (coords: Coordinates) => {
      onLocationChange(formatCoordinate(coords.lat), formatCoordinate(coords.lng));
      setStatus("ready");
    },
    [onLocationChange],
  );

  const requestDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        applyCoordinates({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
      },
      () => {
        setStatus("denied");
        if (!hasCoordinatesRef.current) {
          applyCoordinates({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [applyCoordinates]);

  useEffect(() => {
    if (hasRequestedLocation.current || hasCoordinates) return;

    hasRequestedLocation.current = true;
    requestDeviceLocation();
  }, [hasCoordinates, requestDeviceLocation]);

  const statusMessage =
    status === "loading"
      ? "جاري تحديد موقعك الحالي..."
      : status === "denied"
        ? "تعذر الوصول للموقع. يمكنك النقر على الخريطة أو سحب الدبوس يدوياً."
        : status === "unsupported"
          ? "المتصفح لا يدعم تحديد الموقع. اختر الموقع من الخريطة."
          : "انقر على الخريطة أو اسحب الدبوس لتحديد موقع الورشة.";

  return (
    <section className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/10 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-secondary" aria-hidden="true" />
            <h3 className="text-base font-bold text-primary">
              موقع الورشة على الخريطة
              <span className="text-red-500" aria-hidden="true">
                {" "}
                *
              </span>
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-600">{statusMessage}</p>
        </div>

        <button
          type="button"
          onClick={requestDeviceLocation}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary-light/40 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocateFixed className="size-4 shrink-0" aria-hidden="true" />
          {status === "loading" ? "جاري التحديد..." : "استخدام موقعي"}
        </button>
      </div>

      <div className="relative h-72 w-full sm:h-80">
        <MapContainer center={position} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewportSync lat={position.lat} lng={position.lng} />
          <MapInteractions onPick={applyCoordinates} />
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const { lat, lng } = event.target.getLatLng();
                applyCoordinates({ lat, lng });
              },
            }}
          />
        </MapContainer>

        {status === "loading" ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/55">
            <p className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">جاري تحديد موقعك...</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 border-t border-primary/10 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5">
        <p className="text-gray-600">
          خط العرض:{" "}
          <span dir="ltr" className="font-medium text-primary">
            {latitude || "—"}
          </span>
        </p>
        <p className="text-gray-600">
          خط الطول:{" "}
          <span dir="ltr" className="font-medium text-primary">
            {longitude || "—"}
          </span>
        </p>
      </div>
    </section>
  );
}
