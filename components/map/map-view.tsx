"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const MapComponent = ({
  markers,
  onMarkerClick,
  selectedMarkerId,
  branchImages,
  selectedMarker,
}: {
  markers: any[]
  onMarkerClick: (marker: any) => void
  selectedMarkerId?: string | null
  branchImages?: any[]
  selectedMarker?: any
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
      // Only show image if marker.centerPole exists (mock data), otherwise just show marker_id and timestamp
      let popupHtml = `<div style='max-width:200px'><b>${marker.marker_id}</b>`
      if (marker.timestamp) {
        popupHtml += `<br/><span>${marker.timestamp}</span>`
      }
      if (marker.centerPole && marker.centerPole.url) {
        popupHtml += `<br/><img src='${marker.centerPole.url}' style='width:100%;border-radius:6px;margin:6px 0'/>`
      }
      popupHtml += `</div>`
      center.bindPopup(popupHtml)
      center.addTo(markerLayerRef.current!)
      // Only draw arrows for mock data with branchImages
      if (marker.branchImages && Array.isArray(marker.branchImages)) {
        const uniqueHeadings = new Set()
        marker.branchImages.forEach((branch: any) => {
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
      }
    })
    // Draw 50m arrows for branch images of the selected marker
    if (selectedMarker && branchImages && branchImages.length > 0) {
      branchImages.forEach((branch: any) => {
        const startLat = selectedMarker.latitude
        const startLng = selectedMarker.longitude
        const heading = branch.heading
        // Geodesic calculation for 50m
        const R = 6378137
        const d = 50 / R
        const theta = (heading * Math.PI) / 180
        const phi1 = (startLat * Math.PI) / 180
        const lambda1 = (startLng * Math.PI) / 180
        const phi2 = Math.asin(Math.sin(phi1) * Math.cos(d) + Math.cos(phi1) * Math.sin(d) * Math.cos(theta))
        const lambda2 = lambda1 + Math.atan2(Math.sin(theta) * Math.sin(d) * Math.cos(phi1), Math.cos(d) - Math.sin(phi1) * Math.sin(phi2))
        const endLat = (phi2 * 180) / Math.PI
        const endLng = (lambda2 * 180) / Math.PI
        // Draw line
        L.polyline(
          [
            [startLat, startLng],
            [endLat, endLng],
          ],
          { color: "#ff4444", weight: 3, opacity: 0.9 }
        ).addTo(markerLayerRef.current!)
        // Draw arrowhead
        const arrowIcon = L.divIcon({
          className: "",
          iconSize: [16, 16],
          html: `<div style="transform: rotate(${heading}deg);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:16px solid #ff4444;"></div>`
        })
        L.marker([endLat, endLng], { icon: arrowIcon })
          .addTo(markerLayerRef.current!)
          .bindPopup(
            `<div style='max-width:200px'><b>Heading: ${heading}°</b><br/><img src='${branch.url}' style='width:100%;border-radius:6px;margin:6px 0'/></div>`
          )
      })
    }
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
  }, [markers, onMarkerClick, branchImages, selectedMarker])

  return <div ref={mapRef} className="w-full h-96 rounded-lg z-0" />
}

export default function MapView() {
  const [selectedSurvey, setSelectedSurvey] = useState<string>("")
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null)
  const [surveys, setSurveys] = useState<any[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [surveyError, setSurveyError] = useState("")
  const [markers, setMarkers] = useState<any[]>([])
  const [loadingMarkers, setLoadingMarkers] = useState(false)
  const [markerError, setMarkerError] = useState("")
  const [centerImages, setCenterImages] = useState<any[]>([])
  const [branchImages, setBranchImages] = useState<any[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [imageError, setImageError] = useState("")

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoadingSurveys(true)
      setSurveyError("")
      try {
        const response = await fetch("http://localhost/sv_camera/api/surveys.php")
        const data = await response.json()
        if (response.ok && data.data && data.data.surveys) {
          setSurveys(data.data.surveys)
        } else {
          setSurveyError(data.error || "Failed to load surveys.")
        }
      } catch (err) {
        setSurveyError("Failed to load surveys. Please check your connection.")
      } finally {
        setLoadingSurveys(false)
      }
    }
    fetchSurveys()
  }, [])

  // Always fetch markers from backend for any selected survey
  useEffect(() => {
    if (!selectedSurvey) {
      setMarkers([])
      return
    }
    setLoadingMarkers(true)
    setMarkerError("")
    fetch(`http://localhost/sv_camera/api/markers.php?survey_id=${selectedSurvey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.markers) {
          setMarkers(
            data.data.markers.map((m: any) => ({
              id: String(m.marker_table_id),
              survey_id: String(m.survey_id),
              marker_id: m.marker_id,
              timestamp: m.timestamp,
              latitude: m.location.latitude,
              longitude: m.location.longitude,
            }))
          )
        } else {
          setMarkerError(data.error || "Failed to load markers.")
          setMarkers([])
        }
      })
      .catch(() => {
        setMarkerError("Failed to load markers. Please check your connection.")
        setMarkers([])
      })
      .finally(() => setLoadingMarkers(false))
  }, [selectedSurvey])

  const handleSurveySelect = (surveyId: string) => {
    setSelectedSurvey(surveyId)
    setSelectedMarker(null)
  }

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker)
    setCenterImages([])
    setBranchImages([])
    setLoadingImages(true)
    setImageError("")
    // Fetch center images
    Promise.all([
      fetch(`http://localhost/sv_camera/api/center-images.php?marker_id=${marker.marker_id}`)
        .then((res) => res.json()),
      fetch(`http://localhost/sv_camera/api/branch-images.php?marker_id=${marker.marker_id}`)
        .then((res) => res.json())
    ]).then(([centerData, branchData]) => {
      if (centerData.success && centerData.data && centerData.data.center_images) {
        setCenterImages(centerData.data.center_images)
      } else {
        setImageError(centerData.error || "Failed to load center images.")
      }
      if (branchData.success && branchData.data && branchData.data.branch_images) {
        setBranchImages(branchData.data.branch_images)
      } else {
        setImageError(branchData.error || "Failed to load branch images.")
      }
    }).catch(() => {
      setImageError("Failed to load images. Please check your connection.")
    }).finally(() => setLoadingImages(false))
  }

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
            {loadingSurveys ? (
              <div className="text-gray-400">Loading surveys...</div>
            ) : surveyError ? (
              <div className="text-red-400">{surveyError}</div>
            ) : (
              <Select value={selectedSurvey} onValueChange={handleSurveySelect}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose a survey..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {surveys.map((survey) => (
                    <SelectItem key={survey.survey_id} value={String(survey.survey_id)} className="text-white hover:bg-white/10">
                      Survey {survey.survey_id} - AOI: {survey.aoi_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Map Container */}
          {selectedSurvey ? (
            loadingMarkers ? (
              <div className="w-full h-96 flex items-center justify-center text-gray-400">Loading markers...</div>
            ) : markerError ? (
              <div className="w-full h-96 flex items-center justify-center text-red-400">{markerError}</div>
            ) : (
              <MapComponent
                markers={markers}
                onMarkerClick={handleMarkerClick}
                selectedMarkerId={selectedMarker?.marker_id}
                branchImages={branchImages}
                selectedMarker={selectedMarker}
              />
            )
          ) : (
            <div className="w-full h-96 bg-gray-800/50 border border-white/20 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Select a survey to view markers on the map</p>
            </div>
          )}

          {/* No images for backend markers */}
          {/* Images Display for backend markers */}
          {selectedMarker && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Center Images */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Center Image(s)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingImages ? (
                    <div className="h-48 flex items-center justify-center text-gray-400">Loading images...</div>
                  ) : imageError ? (
                    <div className="h-48 flex items-center justify-center text-red-400">{imageError}</div>
                  ) : centerImages && centerImages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {centerImages.map((img: any, idx: number) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.url}
                            alt={`Center view ${idx + 1}`}
                            className="w-full h-auto rounded-md"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {img.deviceInfo?.model} {img.deviceInfo?.manufacturer}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">No center image available</div>
                  )}
                </CardContent>
              </Card>

              {/* Branch Images */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Branch Image(s)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingImages ? (
                    <div className="h-48 flex items-center justify-center text-gray-400">Loading images...</div>
                  ) : imageError ? (
                    <div className="h-48 flex items-center justify-center text-red-400">{imageError}</div>
                  ) : branchImages && branchImages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {branchImages.map((img: any, idx: number) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.url}
                            alt={`Branch view ${idx + 1}`}
                            className="w-full h-auto rounded-md"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Heading: {img.heading}°
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">No branch images available</div>
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
