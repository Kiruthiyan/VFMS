"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Navigation, MapPin, CheckCircle, RefreshCw, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

// Dynamically load Leaflet on the client side only
let L: any;
if (typeof window !== "undefined") {
    L = require("leaflet");
}
import "leaflet/dist/leaflet.css";

interface TripMapProps {
    destination: string; // Format: "Start -> Stop 1 -> Stop 2 -> Destination"
    onDistanceChange?: (distance: string) => void;
    onEstimatedTimeChange?: (timeStr: string) => void;
    onDestinationChange?: (serializedDest: string) => void;
    viewOnly?: boolean;
    mapHeight?: string;
}

// In-memory geocode cache to reduce API calls and bypass rate limits
const geocodeCache: Record<string, { lat: number; lon: number; name: string }> = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function TripMap({
    destination,
    onDistanceChange,
    onEstimatedTimeChange,
    onDestinationChange,
    viewOnly = false,
    mapHeight = "h-[260px]"
}: TripMapProps) {
    const mapRef = useRef<any>(null);
    // Unique per component instance — a shared static id let two TripMap instances
    // (e.g. mid-navigation between approve/details pages) fight over the same Leaflet
    // container, which crashed with "_leaflet_pos" once the first instance unmounted.
    const mapContainerId = `trip-route-map-${useId()}`;

    // Parse initial values from serialized destination
    const parseItinerary = (str: string) => {
        if (!str) return { start: "", stops: [], dest: "" };
        const parts = str.split(" -> ");
        if (parts.length >= 2) {
            return {
                start: parts[0],
                stops: parts.slice(1, parts.length - 1),
                dest: parts[parts.length - 1]
            };
        }
        return { start: "", stops: [], dest: str };
    };

    const initial = parseItinerary(destination);
    const [startLocation, setStartLocation] = useState(initial.start);
    const [stops, setStops] = useState<string[]>(initial.stops);
    const [finalDestination, setFinalDestination] = useState(initial.dest);

    const [statusText, setStatusText] = useState("");
    const [loading, setLoading] = useState(false);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

    // Suggestions State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeInput, setActiveInput] = useState<{ type: "start" | "dest" | "stop"; index?: number } | null>(null);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const debounceTimer = useRef<any>(null);

    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    const defaultStartCoords = { lat: 6.9271, lon: 79.8612 }; // Colombo

    // Sync from prop changes (e.g. initial load in edit mode)
    useEffect(() => {
        if (!destination) return;
        const parsed = parseItinerary(destination);
        setStartLocation(parsed.start);
        setStops(parsed.stops);
        setFinalDestination(parsed.dest);
    }, [destination]);

    // Initialize map
    useEffect(() => {
        if (typeof window === "undefined" || !L) return;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerId).setView([defaultStartCoords.lat, defaultStartCoords.lon], 11);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);

            // Force dimension calculation after DOM render
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            }, 300);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Helper: Geocode location with caching and delay
    const geocode = async (query: string): Promise<{ lat: number; lon: number; name: string } | null> => {
        if (!query || !query.trim()) return null;
        
        const normalized = query.trim().toLowerCase();



        let cleaned = query.trim()
            .replace(/\(pvt\) limited/gi, "")
            .replace(/\(pvt\) ltd/gi, "")
            .replace(/pvt\.? ltd\.?/gi, "")
            .replace(/private limited/gi, "")
            .replace(/\s+/g, " ")
            .trim();

        let queryWithCountry = cleaned;
        if (!queryWithCountry.toLowerCase().includes("sri lanka")) {
            queryWithCountry += ", Sri Lanka";
        }
        const normalizedCleaned = queryWithCountry.toLowerCase();
        
        // Return from cache if available
        if (geocodeCache[normalized]) {
            return geocodeCache[normalized];
        }
        if (geocodeCache[normalizedCleaned]) {
            return geocodeCache[normalizedCleaned];
        }

        // Wait 1 second to respect Nominatim API rate limits (1 request per second)
        await delay(1000);

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCountry)}&limit=1`;
            const res = await fetch(url, {
                headers: { "User-Agent": "VFMS-Fleet-Management-System/1.0" }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const result = {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    name: data[0].display_name
                };
                geocodeCache[normalized] = result;
                geocodeCache[normalizedCleaned] = result;
                return result;
            }
        } catch (e) {
            console.error("Geocoding failed for:", query, e);
        }
        return null;
    };

    // Helper: Geocode with segment fallbacks (landmark segment first, then fall back to city/road)
    const geocodeWithFallback = async (query: string): Promise<{ lat: number; lon: number; name: string } | null> => {
        if (!query || !query.trim()) return null;
        let currentQuery = query.trim();
        let result = await geocode(currentQuery);
        if (result) return result;

        // Try geocoding only the first segment (landmark name, e.g. "Informatics (Pvt) Limited")
        if (currentQuery.includes(",")) {
            const parts = currentQuery.split(",");
            const landmark = parts[0].trim();
            if (landmark.length > 3) {
                result = await geocode(landmark);
                if (result) {
                    return { ...result, name: query };
                }
            }
        }

        // Fallback: progressively strip comma-separated components from the front (e.g. road/city)
        while (currentQuery.includes(",")) {
            const firstComma = currentQuery.indexOf(",");
            currentQuery = currentQuery.substring(firstComma + 1).trim();
            if (currentQuery.length > 3) {
                result = await geocode(currentQuery);
                if (result) {
                    return { ...result, name: query }; // Keep original name for UI popups
                }
            } else {
                break;
            }
        }
        return null;
    };

    // Helper: Reverse geocode coordinates to address
    const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            const res = await fetch(url, {
                headers: { "User-Agent": "VFMS-Fleet-Management-System/1.0" }
            });
            const data = await res.json();
            if (data && data.display_name) {
                const parts = data.display_name.split(", ");
                return parts.slice(0, 3).join(", ");
            }
        } catch (e) {
            console.error("Reverse geocoding failed:", e);
        }
        return null;
    };

    // Fetch place suggestions dynamically as user types
    const fetchSuggestions = async (query: string) => {
        if (!query || query.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        setSuggestionsLoading(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
            const res = await fetch(url, {
                headers: { "User-Agent": "VFMS-Fleet-Management-System/1.0" }
            });
            const data = await res.json();
            if (data) {
                const formatted = data.map((item: any) => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon)
                }));
                setSuggestions(formatted);
            }
        } catch (e) {
            console.error("Suggestions fetch failed", e);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    // Handle inputs changes with debouncing for autocomplete suggestions
    const handleInputChange = (value: string, type: "start" | "dest" | "stop", index?: number) => {
        if (type === "start") {
            setStartLocation(value);
            updateParent(value, stops, finalDestination);
        } else if (type === "dest") {
            setFinalDestination(value);
            updateParent(startLocation, stops, value);
        } else if (type === "stop" && index !== undefined) {
            const newStops = [...stops];
            newStops[index] = value;
            setStops(newStops);
            updateParent(startLocation, newStops, finalDestination);
        }

        setActiveInput({ type, index });

        // Debounce API calls for suggestions (300ms)
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    // Handle suggestion click selection
    const handleSelectSuggestion = (suggestion: any) => {
        if (!activeInput) return;

        const { type, index } = activeInput;
        const normalized = suggestion.name.toLowerCase();
        
        // Cache this coordinates so we don't fetch it again on routing
        geocodeCache[normalized] = {
            lat: suggestion.lat,
            lon: suggestion.lon,
            name: suggestion.name
        };

        if (type === "start") {
            setStartLocation(suggestion.name);
            updateParent(suggestion.name, stops, finalDestination);
        } else if (type === "dest") {
            setFinalDestination(suggestion.name);
            updateParent(startLocation, stops, suggestion.name);
        } else if (type === "stop" && index !== undefined) {
            const newStops = [...stops];
            newStops[index] = suggestion.name;
            setStops(newStops);
            updateParent(startLocation, newStops, finalDestination);
        }

        setSuggestions([]);
        setActiveInput(null);
    };

    // Trigger changes back to the parent
    const updateParent = (start: string, currentStops: string[], dest: string) => {
        if (onDestinationChange) {
            const serialized = [start, ...currentStops, dest]
                .filter(x => x && x.trim() !== "")
                .join(" -> ");
            onDestinationChange(serialized);
        }
    };

    // Calculate route
    const calculateRoute = async () => {
        if (typeof window === "undefined" || !mapRef.current || !L) return;

        // Ensure we have a destination
        if (!finalDestination || !finalDestination.trim()) {
            return;
        }

        setLoading(true);
        setStatusText("Geocoding locations...");
        setRouteInfo(null);

        try {
            // Geocode start, stops, dest (will use cache/fallback)
            const startData = await geocodeWithFallback(startLocation);
            const startCoords = startData ? { lat: startData.lat, lon: startData.lon, name: startLocation } : { ...defaultStartCoords, name: startLocation };

            const geocodedStops: any[] = [];
            const failedStops: string[] = [];
            for (let i = 0; i < stops.length; i++) {
                if (!stops[i] || !stops[i].trim()) continue;
                let stopData = await geocodeWithFallback(stops[i]);
                if (stopData) {
                    geocodedStops.push({ lat: stopData.lat, lon: stopData.lon, name: stops[i], type: "stop", index: i });
                } else {
                    failedStops.push(stops[i]);
                    // Fallback: place near previous waypoint to keep index order
                    const prevPoint = geocodedStops.length > 0 ? geocodedStops[geocodedStops.length - 1] : startCoords;
                    geocodedStops.push({
                        lat: prevPoint.lat + 0.002 * (i + 1),
                        lon: prevPoint.lon + 0.002 * (i + 1),
                        name: stops[i],
                        type: "stop",
                        index: i
                    });
                }
            }

            let destData = await geocodeWithFallback(finalDestination);
            if (!destData) {
                failedStops.push(finalDestination);
                const prevPoint = geocodedStops.length > 0 ? geocodedStops[geocodedStops.length - 1] : startCoords;
                destData = {
                    lat: prevPoint.lat + 0.002,
                    lon: prevPoint.lon + 0.002,
                    name: finalDestination
                };
            }
            const destCoords = { lat: destData.lat, lon: destData.lon, name: finalDestination };

            setStatusText("Calculating road route...");

            const waypoints = [
                startCoords,
                ...geocodedStops,
                destCoords
            ];

            const coordsString = waypoints.map(w => `${w.lon},${w.lat}`).join(";");
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

            const routeRes = await fetch(osrmUrl);
            const routeData = await routeRes.json();

            if (!routeData.routes || routeData.routes.length === 0) {
                setStatusText("No driving route found between starting point, stops, and destination.");
                setLoading(false);
                return;
            }

            const route = routeData.routes[0];
            const distanceInKm = (route.distance / 1000).toFixed(1);

            const durationSec = route.duration;
            const hours = Math.floor(durationSec / 3600);
            const minutes = Math.round((durationSec % 3600) / 60);
            const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} mins`;

            setRouteInfo({
                distance: `${distanceInKm} km`,
                duration: durationStr
            });

            // Update distance in parent
            if (onDistanceChange) {
                onDistanceChange(distanceInKm);
            }
            if (onEstimatedTimeChange) {
                onEstimatedTimeChange(durationStr);
            }

            const map = mapRef.current;
            if (!map) {
                return;
            }

            // Remove existing markers & lines
            markersRef.current.forEach(m => map.removeLayer(m));
            markersRef.current = [];
            if (polylineRef.current) map.removeLayer(polylineRef.current);

            // Add new markers (draggable if not viewOnly)
            waypoints.forEach((point, idx) => {
                let pinColor = "#10B981"; // Start - Emerald green
                let iconChar = "A";

                if (idx === waypoints.length - 1) {
                    pinColor = "#EF4444"; // Destination - Red
                    iconChar = "B";
                } else if (idx > 0) {
                    pinColor = "#8B5CF6"; // Stop - Purple
                    iconChar = String(idx);
                }

                const markerIcon = L.divIcon({
                    html: `
                        <div class="relative flex flex-col items-center select-none" style="transform: translate(0, -8px);">
                            <svg class="w-8 h-10 drop-shadow-md" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 0C8.05888 0 0 8.05888 0 18C0 29.5 18 46 18 46C18 46 36 29.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${pinColor}"/>
                                <circle cx="18" cy="18" r="8" fill="white"/>
                                <text x="18" y="21.5" fill="${pinColor}" font-size="11" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">${iconChar}</text>
                            </svg>
                        </div>
                    `,
                    className: "custom-div-icon",
                    iconSize: [32, 40],
                    iconAnchor: [16, 40]
                });

                const marker = L.marker([point.lat, point.lon], {
                    icon: markerIcon,
                    draggable: !viewOnly
                }).addTo(map)
                  .bindPopup(`<b>${idx === 0 ? "Start" : idx === waypoints.length - 1 ? "Destination" : "Stop " + idx}:</b><br/>${point.name}`);

                // Bind permanent label tooltip
                marker.bindTooltip(
                    `<div class="px-2 py-0.5 text-[10px] font-bold text-slate-800 bg-white/95 border border-slate-200 shadow-md rounded-md">
                        ${idx === 0 ? "Start" : idx === waypoints.length - 1 ? "Destination" : "Stop " + idx}: ${point.name.split(",")[0]}
                     </div>`,
                    {
                        permanent: true,
                        direction: "top",
                        className: "custom-map-tooltip",
                        opacity: 0.95,
                        offset: L.point(0, -38)
                    }
                );

                // Handle marker dragging & reverse geocoding
                if (!viewOnly) {
                    marker.on("dragend", async (e: any) => {
                        const newPos = e.target.getLatLng();
                        setStatusText("Reverse geocoding new location...");
                        const newAddress = await reverseGeocode(newPos.lat, newPos.lng);
                        if (newAddress) {
                            if (idx === 0) {
                                setStartLocation(newAddress);
                                updateParent(newAddress, stops, finalDestination);
                            } else if (idx === waypoints.length - 1) {
                                setFinalDestination(newAddress);
                                updateParent(startLocation, stops, newAddress);
                            } else {
                                const newStops = [...stops];
                                newStops[idx - 1] = newAddress;
                                setStops(newStops);
                                updateParent(startLocation, newStops, finalDestination);
                            }
                        } else {
                            setStatusText("Could not determine address of dragged position.");
                        }
                    });
                }

                markersRef.current.push(marker);
            });

            // Draw route polyline
            const geojsonLayer = L.geoJSON(route.geometry, {
                style: {
                    color: "#2563eb",
                    weight: 5,
                    opacity: 0.85
                }
            }).addTo(map);

            polylineRef.current = geojsonLayer;

            // Fit map
            const bounds = geojsonLayer.getBounds();
            map.fitBounds(bounds, { padding: [40, 40] });
            
            // Force Leaflet to recalculate the size of its container and re-fit bounds
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
                }
            }, 250);

            if (failedStops.length > 0) {
                setStatusText(`Could not locate stop: "${failedStops.join(", ")}". Please check spelling.`);
            } else {
                setStatusText("");
            }
        } catch (e) {
            console.error(e);
            setStatusText("Error calculating route. Please verify addresses.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate when points change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (finalDestination && finalDestination.trim().length > 3) {
                calculateRoute();
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [startLocation, stops, finalDestination]);

    // Handle Stop Operations
    const addStop = () => {
        const newStops = [...stops, ""];
        setStops(newStops);
        updateParent(startLocation, newStops, finalDestination);
    };

    const removeStop = (index: number) => {
        const newStops = stops.filter((_, i) => i !== index);
        setStops(newStops);
        updateParent(startLocation, newStops, finalDestination);
    };

    const moveStopUp = (index: number) => {
        if (index === 0) return;
        const newStops = [...stops];
        const temp = newStops[index];
        newStops[index] = newStops[index - 1];
        newStops[index - 1] = temp;
        setStops(newStops);
        updateParent(startLocation, newStops, finalDestination);
    };

    const moveStopDown = (index: number) => {
        if (index === stops.length - 1) return;
        const newStops = [...stops];
        const temp = newStops[index];
        newStops[index] = newStops[index + 1];
        newStops[index + 1] = temp;
        setStops(newStops);
        updateParent(startLocation, newStops, finalDestination);
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleOutsideClick = () => {
            setSuggestions([]);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    // Render AutoComplete List
    const renderSuggestionsDropdown = (type: "start" | "dest" | "stop", index?: number) => {
        if (!activeInput || activeInput.type !== type || (type === "stop" && activeInput.index !== index)) return null;
        if (suggestions.length === 0 && !suggestionsLoading) return null;

        return (
            <div 
                className="absolute z-[999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent close on list click
            >
                {suggestionsLoading ? (
                    <div className="p-3 text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" /> Finding places...
                    </div>
                ) : (
                    suggestions.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-3 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 cursor-pointer transition-colors border-b border-slate-100 last:border-0 truncate font-medium flex items-center gap-2"
                        >
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {item.name}
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            
            {/* Start Location Input */}
            {!viewOnly && (
                <div className="space-y-3">
                    <div className="relative space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Navigation className="h-3 w-3 text-blue-600" /> Start Location
                        </label>
                        <input
                            type="text"
                            value={startLocation}
                            onChange={(e) => handleInputChange(e.target.value, "start")}
                            onClick={(e) => { e.stopPropagation(); setActiveInput({ type: "start" }); }}
                            placeholder="e.g. Colombo Office, Sri Lanka"
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        {renderSuggestionsDropdown("start")}
                    </div>

                    {/* stops List */}
                    {stops.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                Intermediate Stops
                            </label>
                            {stops.map((stop, idx) => (
                                <div key={idx} className="relative flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={stop}
                                            onChange={(e) => handleInputChange(e.target.value, "stop", idx)}
                                            onClick={(e) => { e.stopPropagation(); setActiveInput({ type: "stop", index: idx }); }}
                                            placeholder={`Stop ${idx + 1}`}
                                            className="w-full text-sm bg-transparent border-none outline-none text-slate-800 focus:ring-0 focus:outline-none"
                                        />
                                        {renderSuggestionsDropdown("stop", idx)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveStopUp(idx)}
                                            disabled={idx === 0}
                                            className="p-1 hover:bg-slate-100 text-slate-500 rounded disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveStopDown(idx)}
                                            disabled={idx === stops.length - 1}
                                            className="p-1 hover:bg-slate-100 text-slate-500 rounded disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeStop(idx)}
                                            className="p-1 hover:bg-red-50 text-red-500 rounded"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Stop and Recalculate Row */}
                    <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between">
                        <button
                            type="button"
                            onClick={addStop}
                            className="w-full sm:w-auto h-9 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors border border-purple-200"
                        >
                            <Plus className="h-4 w-4" /> Add Stop
                        </button>
                        <button
                            type="button"
                            onClick={calculateRoute}
                            disabled={loading || !finalDestination.trim()}
                            className="w-full sm:w-auto h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            Recalculate Route
                        </button>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div 
                id={mapContainerId} 
                className={`w-full ${mapHeight} rounded-lg border border-slate-200 shadow-inner overflow-hidden relative z-10 bg-slate-100`}
            />

            {/* Status & Info Display */}
            <div className="flex flex-wrap gap-3 items-center justify-between min-h-[32px] text-xs">
                {statusText && (
                    <div className="text-slate-500 flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                        {statusText}
                    </div>
                )}
                {routeInfo && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 flex items-center gap-4 text-blue-900 w-full sm:w-auto justify-around sm:justify-start">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-blue-600 animate-bounce" />
                            <span className="font-semibold">{routeInfo.distance}</span>
                        </div>
                        <div className="h-3 w-px bg-blue-200 hidden sm:block" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Est. Time:</span>
                            <span className="font-semibold">{routeInfo.duration}</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto hidden sm:block" />
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .custom-map-tooltip {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .custom-map-tooltip::before {
                    display: none !important;
                }
            `}} />
        </div>
    );
}
