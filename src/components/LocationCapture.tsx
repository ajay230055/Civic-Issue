import React from 'react';
import { reverseGeocode } from '../services/api';

interface Props {
  onCapture: (coords: { lat: number; lng: number } | null, address?: string) => void;
}

const LocationCapture: React.FC<Props> = ({ onCapture }) => {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);

  const getLocation = () => {
    setBusy(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setBusy(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        try {
          const text = await reverseGeocode(c.lat, c.lng);
          setAddress(text);
          onCapture(c, text);
        } catch {
          onCapture(c);
        }
        setBusy(false);
      },
      () => {
        setError('Location access denied');
        onCapture(null);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="section">
      <h4 className="section-title">Location</h4>
      <div className="inline">
        <button type="button" className="btn" onClick={getLocation} disabled={busy}>{busy ? 'Detecting…' : 'Use my location'}</button>
        {coords && <span className="badge">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>}
        {address && <span className="badge badge-aqua" style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</span>}
        {error && <span className="hint">{error}</span>}
      </div>
    </div>
  );
};

export default LocationCapture;


