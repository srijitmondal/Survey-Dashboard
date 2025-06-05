import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data types
interface Survey {
  id: string;
  aoi_id: string;
  surveyor_id: string;
  synced_at: string;
  name: string;
}

interface Marker {
  id: string;
  survey_id: string;
  marker_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

interface CenterImage {
  id: string;
  marker_id: string;
  url: string;
  device_model: string;
  timestamp: string;
  width: number;
  height: number;
}

interface BranchImage {
  id: string;
  marker_id: string;
  url: string;
  heading: number;
  device_model: string;
  timestamp: string;
  width: number;
  height: number;
}

// Mock data
const mockSurveys: Survey[] = [
  { id: '1', aoi_id: 'AOI001', surveyor_id: 'user1', synced_at: '2024-01-15T10:30:00Z', name: 'Downtown Survey' },
  { id: '2', aoi_id: 'AOI002', surveyor_id: 'user2', synced_at: '2024-01-16T14:20:00Z', name: 'Park Area Survey' },
  { id: '3', aoi_id: 'AOI003', surveyor_id: 'user1', synced_at: '2024-01-17T09:15:00Z', name: 'Industrial Zone Survey' },
];

const mockMarkers: Marker[] = [
  { id: '1', survey_id: '1', marker_id: 'M001', timestamp: '2024-01-15T10:35:00Z', latitude: 40.7128, longitude: -74.0060 },
  { id: '2', survey_id: '1', marker_id: 'M002', timestamp: '2024-01-15T10:40:00Z', latitude: 40.7138, longitude: -74.0070 },
  { id: '3', survey_id: '2', marker_id: 'M003', timestamp: '2024-01-16T14:25:00Z', latitude: 40.7148, longitude: -74.0080 },
];

const mockCenterImages: CenterImage[] = [
  { id: '1', marker_id: 'M001', url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', device_model: 'iPhone 13', timestamp: '2024-01-15T10:35:00Z', width: 1920, height: 1080 },
  { id: '2', marker_id: 'M002', url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', device_model: 'Samsung Galaxy S21', timestamp: '2024-01-15T10:40:00Z', width: 1920, height: 1080 },
];

const mockBranchImages: BranchImage[] = [
  { id: '1', marker_id: 'M001', url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', heading: 45, device_model: 'iPhone 13', timestamp: '2024-01-15T10:35:30Z', width: 1920, height: 1080 },
  { id: '2', marker_id: 'M002', url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', heading: 180, device_model: 'Samsung Galaxy S21', timestamp: '2024-01-15T10:40:30Z', width: 1920, height: 1080 },
];

const MapView = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<string>('');
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (selectedSurvey) {
      const surveyMarkers = mockMarkers.filter(m => m.survey_id === selectedSurvey);
      setMarkers(surveyMarkers);
      setSelectedMarker(null);
    } else {
      setMarkers([]);
      setSelectedMarker(null);
    }
  }, [selectedSurvey]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (markers.length === 0) return;

    markers.forEach((marker) => {
      const markerIcon = L.divIcon({
        html: `<div class="w-8 h-8 ${selectedMarker?.id === marker.id ? 'bg-emerald-500 ring-4 ring-emerald-300' : 'bg-blue-500'} rounded-full flex items-center justify-center shadow-lg">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                   <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                   <circle cx="12" cy="10" r="3"/>
                 </svg>
               </div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: markerIcon })
        .addTo(markersLayerRef.current!)
        .on('click', () => handleMarkerClick(marker));

      // Add arrow for branch image direction
      const branchImage = getBranchImage(marker.marker_id);
      if (branchImage) {
        const arrowLength = 0.0005; // Approximate 50 meters in degrees
        const heading = branchImage.heading;
        const endLat = marker.latitude + arrowLength * Math.cos((heading * Math.PI) / 180);
        const endLng = marker.longitude + arrowLength * Math.sin((heading * Math.PI) / 180);

        const arrow = L.polyline([[marker.latitude, marker.longitude], [endLat, endLng]], {
          color: selectedMarker?.id === marker.id ? '#fbbf24' : '#3b82f6',
          weight: 3,
          opacity: 0.8,
        }).addTo(markersLayerRef.current!);

        // Add arrowhead
        const arrowHead = L.circleMarker([endLat, endLng], {
          radius: 4,
          fillColor: selectedMarker?.id === marker.id ? '#fbbf24' : '#3b82f6',
          color: selectedMarker?.id === marker.id ? '#fbbf24' : '#3b82f6',
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(markersLayerRef.current!);
      }
    });

    // Fit map to markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markersLayerRef.current.getLayers());
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [markers, selectedMarker]);

  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(marker);
  };

  const getCenterImage = (markerId: string) => {
    return mockCenterImages.find(img => img.marker_id === markerId);
  };

  const getBranchImage = (markerId: string) => {
    return mockBranchImages.find(img => img.marker_id === markerId);
  };

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Map View</h2>
          <p className="text-gray-400">Select a survey to view markers and images</p>
        </div>
        <div className="w-64">
          <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a survey" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {mockSurveys.map((survey) => (
                <SelectItem key={survey.id} value={survey.id} className="text-white hover:bg-gray-700">
                  {survey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-8rem)]">
        {/* Map Area - Now takes up 2/3 of the width */}
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Survey Map
            </CardTitle>
            <CardDescription className="text-gray-400">
              {selectedSurvey ? `Showing ${markers.length} markers` : 'Select a survey to view markers'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg h-[500px] overflow-hidden">
              {!selectedSurvey ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Select a survey to view the map</p>
                </div>
              ) : (
                <div ref={mapRef} className="w-full h-full" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Display Area - Now takes up 1/3 of the width */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Marker Images
            </CardTitle>
            <CardDescription className="text-gray-400">
              {selectedMarker ? `Images from marker ${selectedMarker.marker_id}` : 'Click a marker to view images'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedMarker ? (
              <div className="h-96 flex items-center justify-center text-gray-500">
                Click a marker on the map to view its images
              </div>
            ) : (
              <div className="space-y-4">
                {/* Center Image */}
                {getCenterImage(selectedMarker.marker_id) && (
                  <div className="space-y-2">
                    <h4 className="text-white font-medium flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Center Image
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4 h-40 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-400 text-sm">Center Image</p>
                        <p className="text-gray-500 text-xs">
                          {getCenterImage(selectedMarker.marker_id)?.device_model}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Branch Image */}
                {getBranchImage(selectedMarker.marker_id) && (
                  <div className="space-y-2">
                    <h4 className="text-white font-medium flex items-center">
                      <Navigation className="w-4 h-4 mr-2" />
                      Branch Image (Heading: {getBranchImage(selectedMarker.marker_id)?.heading}°)
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4 h-40 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Navigation className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-400 text-sm">Branch Image</p>
                        <p className="text-gray-500 text-xs">
                          {getBranchImage(selectedMarker.marker_id)?.device_model}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Marker Details */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Marker Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">
                      <span className="text-gray-500">ID:</span> {selectedMarker.marker_id}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Coordinates:</span> {selectedMarker.latitude.toFixed(6)}, {selectedMarker.longitude.toFixed(6)}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Timestamp:</span> {new Date(selectedMarker.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
