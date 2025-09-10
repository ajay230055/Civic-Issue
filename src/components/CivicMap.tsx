import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue } from '@/types/issue';
import IssueDetailCard from './IssueDetailCard';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CivicMapProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onIssueSelect: (issue: Issue) => void;
  onMapMove?: (bounds: L.LatLngBounds) => void;
  searchLocation?: string;
}

const CivicMap: React.FC<CivicMapProps> = ({ 
  issues, 
  selectedIssue, 
  onIssueSelect, 
  onMapMove,
  searchLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showDetailCard, setShowDetailCard] = useState<Issue | null>(null);

  // Create custom icons for different statuses
  const createCustomIcon = (status: string, isSelected: boolean = false) => {
    const size = isSelected ? 35 : 25;
    const colors = {
      'open': '#ef4444',
      'in-progress': '#eab308',
      'resolved': '#22c55e'
    };
    
    const color = colors[status as keyof typeof colors] || '#6b7280';
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size > 30 ? '14px' : '12px'};
        ">
          ${status === 'open' ? '!' : status === 'in-progress' ? '⚠' : '✓'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with OpenStreetMap
    map.current = L.map(mapContainer.current, {
      center: [12.9716, 77.5946], // Bangalore, India as default
      zoom: 12,
      zoomControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.current);

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Handle map movement for sidebar updates
    map.current.on('moveend', () => {
      if (onMapMove && map.current) {
        onMapMove(map.current.getBounds());
      }
    });

    setMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add new markers
    issues.forEach(issue => {
      if (map.current) {
        const isSelected = selectedIssue?.id === issue.id;
        const marker = L.marker([issue.lat, issue.lng], {
          icon: createCustomIcon(issue.status, isSelected)
        }).addTo(map.current);

        // Add click handler
        marker.on('click', () => {
          onIssueSelect(issue);
          setShowDetailCard(issue);
        });

        // Add popup with issue info
        marker.bindPopup(`
          <div style="max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${issue.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${issue.description}</p>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="
                padding: 2px 8px; 
                border-radius: 12px; 
                font-size: 12px; 
                background-color: ${issue.status === 'open' ? '#ef4444' : issue.status === 'in-progress' ? '#eab308' : '#22c55e'}; 
                color: white;
              ">
                ${issue.status}
              </span>
              <span style="font-size: 12px; color: #666;">${issue.type}</span>
            </div>
          </div>
        `);

        markersRef.current.set(issue.id, marker);
      }
    });
  }, [issues, selectedIssue, mapLoaded, onIssueSelect]);

  // Handle search location
  useEffect(() => {
    if (searchLocation && map.current) {
      // Simple location search - in real app, use Nominatim API
      const locations: Record<string, [number, number]> = {
        'anna nagar': [13.0843, 80.2085],
        'koramangala': [12.9279, 77.6309],
        'whitefield': [12.9698, 77.7499],
        'indiranagar': [12.9784, 77.6408],
        'bangalore': [12.9716, 77.5946],
        'chennai': [13.0827, 80.2707],
        'mumbai': [19.0760, 72.8777],
        'delhi': [28.6139, 77.2090]
      };
      
      const coords = locations[searchLocation.toLowerCase()];
      if (coords) {
        map.current.flyTo(coords, 14, {
          duration: 2
        });
      }
    }
  }, [searchLocation]);

  // Focus on selected issue
  useEffect(() => {
    if (selectedIssue && map.current) {
      map.current.flyTo([selectedIssue.lat, selectedIssue.lng], 16, {
        duration: 1
      });
    }
  }, [selectedIssue]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Detailed Issue Card */}
      {showDetailCard && (
        <IssueDetailCard
          issue={showDetailCard}
          onClose={() => setShowDetailCard(null)}
        />
      )}
      
      {/* Attribution and Info */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Open
          <span className="w-2 h-2 bg-yellow-500 rounded-full ml-2"></span>
          In Progress
          <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
          Resolved
        </p>
      </div>
    </div>
  );
};

export default CivicMap;
