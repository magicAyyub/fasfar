"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Maximize2, Minimize2 } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LocationPickerMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  onLocationChange: (lat: number, lng: number, address?: string) => void
  height?: string
}

export default function LocationPickerMap({
  latitude,
  longitude,
  address,
  onLocationChange,
  height = "300px",
}: LocationPickerMapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Initialiser la carte
  useEffect(() => {
    if (typeof window !== "undefined" && !mapRef.current && mapContainerRef.current) {
      try {
        // Créer la carte
        const map = L.map(mapContainerRef.current).setView(
          latitude && longitude ? [latitude, longitude] : [35.1264, 33.4299], // Turkey by default
          latitude && longitude ? 15 : 5, // Zoom
        )

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Ajouter le marqueur si les coordonnées sont disponibles
        if (latitude && longitude) {
          // Créer une icône personnalisée pour le marqueur
          const icon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                background-color: #f43f5e;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 2px solid white;
                cursor: pointer;
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          })

          markerRef.current = L.marker([latitude, longitude], { icon, draggable: true }).addTo(map)

          // Gérer le déplacement du marqueur
          markerRef.current.on("dragend", async () => {
            const position = markerRef.current?.getLatLng()
            if (position) {
              try {
                // Faire une géocodage inverse pour obtenir l'adresse
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
                  {
                    headers: {
                      "Accept-Language": "en",
                    },
                  },
                )
                const data = await response.json()
                if (data && data.display_name) {
                  onLocationChange(position.lat, position.lng, data.display_name)
                } else {
                  onLocationChange(position.lat, position.lng)
                }
              } catch (error) {
                console.error("Error reverse geocoding:", error)
                onLocationChange(position.lat, position.lng)
              }
            }
          })
        }

        // Gérer le clic sur la carte pour placer le marqueur
        map.on("click", async (e) => {
          const { lat, lng } = e.latlng

          // Supprimer l'ancien marqueur s'il existe
          if (markerRef.current) {
            markerRef.current.remove()
          }

          // Créer une icône personnalisée pour le marqueur
          const icon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                background-color: #f43f5e;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 2px solid white;
                cursor: pointer;
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          })

          // Ajouter le nouveau marqueur
          markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map)

          // Gérer le déplacement du marqueur
          markerRef.current.on("dragend", async () => {
            const position = markerRef.current?.getLatLng()
            if (position) {
              try {
                // Faire une géocodage inverse pour obtenir l'adresse
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
                  {
                    headers: {
                      "Accept-Language": "fr",
                    },
                  },
                )
                const data = await response.json()
                if (data && data.display_name) {
                  onLocationChange(position.lat, position.lng, data.display_name)
                } else {
                  onLocationChange(position.lat, position.lng)
                }
              } catch (error) {
                console.error("Erreur lors du géocodage inverse:", error)
                onLocationChange(position.lat, position.lng)
              }
            }
          })

          // Faire une géocodage inverse pour obtenir l'adresse
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "en",
                },
              },
            )
            const data = await response.json()
            if (data && data.display_name) {
              onLocationChange(lat, lng, data.display_name)
            } else {
              onLocationChange(lat, lng)
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error)
            onLocationChange(lat, lng)
          }
        })

        mapRef.current = map
        setIsLoaded(true)
      } catch (error) {
        console.error("Error initializing the map:", error)
      }
    }

    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Mettre à jour la position du marqueur si les props changent
  useEffect(() => {
    if (mapRef.current && isLoaded && latitude && longitude) {
      // Supprimer l'ancien marqueur s'il existe
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Créer une icône personnalisée pour le marqueur
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #f43f5e;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid white;
            cursor: pointer;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })

      // Ajouter le nouveau marqueur
      markerRef.current = L.marker([latitude, longitude], { icon, draggable: true }).addTo(mapRef.current)

      // Gérer le déplacement du marqueur
      markerRef.current.on("dragend", async () => {
        const position = markerRef.current?.getLatLng()
        if (position) {
          try {
            // Faire une géocodage inverse pour obtenir l'adresse
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "en",
                },
              },
            )
            const data = await response.json()
            if (data && data.display_name) {
              onLocationChange(position.lat, position.lng, data.display_name)
            } else {
              onLocationChange(position.lat, position.lng)
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error)
            onLocationChange(position.lat, position.lng)
          }
        }
      })

      // Centrer la carte sur le marqueur
      mapRef.current.setView([latitude, longitude], 15)
    }
  }, [latitude, longitude, isLoaded, onLocationChange])

  // Fonction pour gérer le redimensionnement de la carte
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    // Redimensionner la carte après l'animation
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 300)
  }

  // Add a useEffect to invalidate map size after mount and when visible
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      }, 1000)
    }
  }, [isLoaded])

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: isExpanded ? "500px" : height || "400px",
            minHeight: "200px",
            display: "block"
          }}
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-md bg-white"
            onClick={toggleExpand}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {address && (
          <div className="absolute bottom-2 left-2 right-2 z-10 bg-white bg-opacity-90 p-2 rounded-md shadow-md text-sm">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0 text-rose-500" />
              <span>{address}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
