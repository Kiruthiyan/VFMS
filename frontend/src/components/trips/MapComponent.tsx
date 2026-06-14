"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Location {
    lat: number;
    lng: number;
    name: string;
}

interface MapComponentProps {
    locations: Location[];
    onRouteCalculated: (distanceKm: number, durationSeconds: number) => void;
    onStartSelected?: (lat: number, lng: number, address: string) => void;
    onStopSelected?: (index: number, lat: number, lng: number, address: string) => void;
    onDestinationSelected?: (lat: number, lng: number, address: string) => void;
}

export default function MapComponent({ 
    locations, 
    onRouteCalculated, 
    onStartSelected,
    onStopSelected,
    onDestinationSelected 
}: MapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const routeLayerRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    
    // Store coordinates key string to check if the route coordinates actually changed
    const prevCoordsKeyRef = useRef<string>("");

    useEffect(() => {
        if (!mapContainerRef.current) return;

        let active = true;
        let mapInstance: any = null;

        const initMap = async () => {
            const L = await import("leaflet");

            if (!active) return;

            // Fix Leaflet's default marker icon URL resolution bug in Next.js builds
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            });

            // Initialize the map centered at Colombo/Moratuwa base office
            mapInstance = L.map(mapContainerRef.current!).setView([6.7912, 79.9005], 11);
            mapRef.current = mapInstance;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance);

            // Add map click listener to select a destination on map click
            mapInstance.on("click", async (e: any) => {
                const { lat, lng } = e.latlng;
                const address = await reverseGeocode(lat, lng);
                if (address && onDestinationSelected) {
                    onDestinationSelected(lat, lng, address);
                }
            });

            updateRouteAndMarkers(L, mapInstance);

            // Trigger invalidateSize after a short delay to ensure correct layout and container styling
            setTimeout(() => {
                if (active && mapInstance) {
                    mapInstance.invalidateSize();
                }
            }, 250);
        };

        initMap();

        return () => {
            active = false;
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    }, []);

    // Trigger updates whenever the locations list is modified
    useEffect(() => {
        if (!mapRef.current) return;
        
        const update = async () => {
            const L = await import("leaflet");
            updateRouteAndMarkers(L, mapRef.current);
        };
        update();
    }, [locations]);

    const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: {
                    "Accept-Language": "en",
                    "User-Agent": "VFMS-FleetPro-Routing-Engine"
                }
            });
            if (response.ok) {
                const data = await response.json();
                const displayName = data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                const parts = displayName.split(",");
                const shortName = parts.slice(0, 2).join(",").trim();
                return shortName;
            }
        } catch (err) {
            console.error("Reverse geocoding failed:", err);
        }
        return null;
    };

    const updateRouteAndMarkers = async (L: any, map: any) => {
        const validLocations = locations.filter(loc => loc.lat && loc.lng);
        if (validLocations.length === 0) return;

        // Create a unique key of the current coordinates
        const coordsKey = validLocations.map(loc => `${loc.lat},${loc.lng}`).join(";");
        
        // Prevent layout updates/refitting bounds if coordinates haven't changed (stops map getting stuck on keyboard input)
        if (coordsKey === prevCoordsKeyRef.current) {
            return;
        }
        prevCoordsKeyRef.current = coordsKey;

        // Force Leaflet to recalculate size in case container dimensions changed
        map.invalidateSize();

        // Clear previous markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Clear previous route polyline
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }

        // Render numbered/labeled markers for all stops
        validLocations.forEach((loc, index) => {
            let label = "";
            const isStart = index === 0;
            const isDestination = index === validLocations.length - 1 && index > 0;
            const isStop = index > 0 && index < validLocations.length - 1;
            
            if (isStart) {
                label = "Start: " + loc.name;
            } else if (isDestination) {
                label = "Destination: " + loc.name;
            } else {
                label = `Stop ${index}: ` + loc.name;
            }

            // Make ALL markers draggable
            const marker = L.marker([loc.lat, loc.lng], {
                draggable: true
            }).addTo(map);

            marker.bindTooltip(label, { 
                permanent: true, 
                direction: "top", 
                className: "font-semibold text-xs border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-slate-800 bg-white" 
            });

            marker.on("dragend", async (e: any) => {
                const { lat, lng } = e.target.getLatLng();
                const address = await reverseGeocode(lat, lng);
                if (address) {
                    if (isStart && onStartSelected) {
                        onStartSelected(lat, lng, address);
                    } else if (isDestination && onDestinationSelected) {
                        onDestinationSelected(lat, lng, address);
                    } else if (isStop && onStopSelected) {
                        onStopSelected(index - 1, lat, lng, address);
                    }
                }
            });

            markersRef.current.push(marker);
        });

        // Request and render road routing if there are at least two coordinates
        if (validLocations.length >= 2) {
            try {
                const coordsString = validLocations.map(loc => `${loc.lng},${loc.lat}`).join(";");
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

                const response = await fetch(osrmUrl);
                if (!response.ok) throw new Error("OSRM routing request failed");
                const data = await response.json();

                if (data.routes && data.routes[0]) {
                    const route = data.routes[0];
                    const distanceMeters = route.distance;
                    const durationSeconds = route.duration;
                    const routeGeometry = route.geometry;
                    
                    // Render path polyline on the map
                    const routeLayer = L.geoJSON(routeGeometry, {
                        style: {
                            color: "#3b82f6", // tailwind blue-500
                            weight: 5,
                            opacity: 0.8,
                        }
                    }).addTo(map);

                    routeLayerRef.current = routeLayer;

                    // Automatically adjust viewport bounds with padding to fit the route
                    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

                    // Report calculated distance and duration to parent component
                    const distanceKm = Number((distanceMeters / 1000).toFixed(2));
                    onRouteCalculated(distanceKm, durationSeconds);
                }
            } catch (error) {
                console.error("Routing error:", error);
            }
        } else {
            // Pan to the single available marker
            map.setView([validLocations[0].lat, validLocations[0].lng], 13);
        }
    };

    return (
        <div 
            ref={mapContainerRef} 
            className="w-full h-[350px] rounded-xl border border-slate-200 shadow-sm overflow-hidden cursor-crosshair"
            style={{ position: "relative", zIndex: 1 }}
        />
    );
}
