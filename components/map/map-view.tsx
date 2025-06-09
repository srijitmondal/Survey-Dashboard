"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockSurveys, mockMarkers, type Marker } from "@/lib/auth"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { survey1Data } from "@/data/survey-data"

// Mock Leaflet map component
// Utility: convert survey1Data to marker list for the map
function getSurvey1Markers() {
  return survey1Data.markers.map((m, idx) => ({
    id: String(idx + 1),
    survey_id: "1",
    marker_id: m.markerId,
    timestamp: m.timestamp,
    latitude: m.location.latitude,
    longitude: m.location.longitude,
    centerPole: m.centerPole,
    branchImages: m.branchImages,
  }))
}

// Utility: get marker by marker_id from survey1Data
function getSurvey1MarkerById(marker_id: string) {
  return survey1Data.markers.find((m) => m.markerId === marker_id)
}

const MapComponent = ({
  markers,
  onMarkerClick,
  selectedMarkerId,
}: {
  markers: any[]
  onMarkerClick: (marker: any) => void
  selectedMarkerId?: string | null
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        center: [22.4845, 88.3754],
        zoom: 18,
        zoomControl: false,
      })
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 20,
        }
      ).addTo(leafletMapRef.current)
      // Add zoom controls bottom right
      L.control.zoom({ position: "bottomright" }).addTo(leafletMapRef.current)
      // Add current location button
      const locateBtn = L.Control.extend({
        onAdd: function () {
          const btn = L.DomUtil.create("button", "leaflet-bar leaflet-control")
          btn.title = "Show my location"
          btn.innerHTML = "📍"
          btn.style.background = "white"
          btn.style.width = "32px"
          btn.style.height = "32px"
          btn.onclick = () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                leafletMapRef.current?.setView([latitude, longitude], 18)
                L.marker([latitude, longitude], {
                  icon: L.icon({
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    shadowSize: [41, 41],
                  }),
                })
                  .addTo(leafletMapRef.current!)
                  .bindPopup("You are here").openPopup()
              })
            }
          }
          return btn
        },
      })
      leafletMapRef.current.addControl(new locateBtn({ position: "bottomright" }))
    }
    // Remove old markers/arrows
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers()
    } else {
      markerLayerRef.current = L.layerGroup().addTo(leafletMapRef.current)
    }
    // Add markers and arrows
    markers.forEach((marker) => {
      const center = L.marker([marker.latitude, marker.longitude], {
        icon: L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
        }),
      })
      center.on("click", () => onMarkerClick(marker))
      center.bindPopup(
        `<div style='max-width:200px'><b>${marker.marker_id}</b><br/><img src='${marker.centerPole.url}' style='width:100%;border-radius:6px;margin:6px 0'/></div>`
      )
      center.addTo(markerLayerRef.current!)
      // Draw arrows for each branch image
      const uniqueHeadings = new Set()
      marker.branchImages?.forEach((branch: any) => {
        if (uniqueHeadings.has(branch.heading)) return
        uniqueHeadings.add(branch.heading)
        // Calculate endpoint 60m away
        const R = 6378137
        const d = 60 / R
        const theta = (branch.heading * Math.PI) / 180
        const phi1 = (marker.latitude * Math.PI) / 180
        const lambda1 = (marker.longitude * Math.PI) / 180
        const phi2 = Math.asin(Math.sin(phi1) * Math.cos(d) + Math.cos(phi1) * Math.sin(d) * Math.cos(theta))
        const lambda2 = lambda1 + Math.atan2(Math.sin(theta) * Math.sin(d) * Math.cos(phi1), Math.cos(d) - Math.sin(phi1) * Math.sin(phi2))
        const endLat = (phi2 * 180) / Math.PI
        const endLng = (lambda2 * 180) / Math.PI
        // Draw line
        L.polyline(
          [
            [marker.latitude, marker.longitude],
            [endLat, endLng],
          ],
          { color: "#ff4444", weight: 2, opacity: 0.8 }
        ).addTo(markerLayerRef.current!)
        // Draw arrowhead
        const arrowIcon = L.divIcon({
          className: "",
          iconSize: [16, 16],
          html: `<div style="transform: rotate(${branch.heading}deg);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:16px solid #ff4444;"></div>`
        })
        L.marker([endLat, endLng], { icon: arrowIcon })
          .addTo(markerLayerRef.current!)
          .bindPopup(
            `<div style='max-width:200px'><b>Heading: ${branch.heading}°</b><br/><img src='${branch.url}' style='width:100%;border-radius:6px;margin:6px 0'/></div>`
          )
      })
    })
    // Fit bounds
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]))
      leafletMapRef.current?.fitBounds(bounds.pad(0.1))
    } else if (markers.length === 1) {
      leafletMapRef.current?.setView([markers[0].latitude, markers[0].longitude], 18)
    }
    // Clean up on unmount
    return () => {
      // Do not remove map instance, just clear layers
      markerLayerRef.current?.clearLayers()
    }
  }, [markers, onMarkerClick])

  return <div ref={mapRef} className="w-full h-96 rounded-lg z-0" />
}

export default function MapView() {
  const [selectedSurvey, setSelectedSurvey] = useState<string>("")
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null)

  // For Survey 1, use survey1Data, else fallback to mockMarkers
  const isSurvey1 = selectedSurvey === "1"
  const markers = isSurvey1 ? getSurvey1Markers() : mockMarkers.filter((m) => m.survey_id === selectedSurvey)

  const handleSurveySelect = (surveyId: string) => {
    setSelectedSurvey(surveyId)
    setSelectedMarker(null)
  }

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker)
  }

  // For Survey 1, get center/branch images from marker data
  const centerImage = isSurvey1 && selectedMarker ? selectedMarker.centerPole?.url : null
  const branchImages = isSurvey1 && selectedMarker ? selectedMarker.branchImages : []

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Map View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Survey Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Select Survey</label>
            <Select value={selectedSurvey} onValueChange={handleSurveySelect}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose a survey..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                {mockSurveys.map((survey) => (
                  <SelectItem key={survey.id} value={survey.id} className="text-white hover:bg-white/10">
                    Survey {survey.id} - AOI: {survey.aoi_id} ({survey.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Map Container */}
          {selectedSurvey ? (
            <MapComponent
              markers={markers}
              onMarkerClick={handleMarkerClick}
              selectedMarkerId={selectedMarker?.marker_id}
            />
          ) : (
            <div className="w-full h-96 bg-gray-800/50 border border-white/20 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Select a survey to view markers on the map</p>
            </div>
          )}

          {/* Images Display - Show all branch images for Survey 1 */}
          {selectedMarker && isSurvey1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Center Image */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Center Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {centerImage ? (
                    <div className="relative">
                      <img
                        src={centerImage}
                        alt="Center view"
                        className="w-full h-auto rounded-md"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Marker {selectedMarker.marker_id}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-800/50 rounded-md">
                      <p className="text-gray-400">No center image available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Branch Images with Directions */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Branch Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {branchImages && branchImages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {branchImages.map((branch: any, idx: number) => (
                        <div key={idx} className="relative">
                          <img
                            src={branch.url}
                            alt={`Branch view ${idx + 1}`}
                            className="w-full h-auto rounded-md"
                          />
                          {/* Direction indicator */}
                          <div
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{
                              backgroundImage: `linear-gradient(${branch.heading}deg, rgba(168, 85, 247, 0.4), transparent 70%)`,
                            }}
                          ></div>
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Heading: {branch.heading}°
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-800/50 rounded-md">
                      <p className="text-gray-400">No branch images available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marker Details */}
          {selectedMarker && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Marker Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300">Marker ID:</p>
                    <p className="text-white font-medium">{selectedMarker.marker_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Timestamp:</p>
                    <p className="text-white font-medium">{new Date(selectedMarker.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Latitude:</p>
                    <p className="text-white font-medium">{selectedMarker.latitude}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Longitude:</p>
                    <p className="text-white font-medium">{selectedMarker.longitude}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
