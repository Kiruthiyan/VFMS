"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AddressSearchInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    onSelectLocation: (lat: number, lng: number, name: string) => void;
    icon: React.ReactNode;
    error?: string;
    required?: boolean;
}

export default function AddressSearchInput({
    label,
    placeholder,
    value,
    onChange,
    onSelectLocation,
    icon,
    error,
    required = false
}: AddressSearchInputProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<any>(null);

    // Close the suggestions dropdown when clicking outside of this element
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery: string) => {
        if (!searchQuery || searchQuery.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            // OSM Nominatim API query. Includes a User-Agent which is required by their usage policy.
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`;
            const response = await fetch(url, {
                headers: {
                    "Accept-Language": "en",
                    "User-Agent": "VFMS-FleetPro-Routing-Engine"
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                setShowDropdown(true);
            }
        } catch (err) {
            console.error("Geocoding fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // Debounce input searches by 600ms to avoid flooding Nominatim API
        searchTimeout.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 600);
    };

    const handleSelect = (item: any) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const displayName = item.display_name;
        
        // Extract a shorter name for display (e.g., "Colombo Fort" instead of full address)
        const parts = displayName.split(",");
        const shortName = parts.slice(0, 2).join(",").trim();

        onSelectLocation(lat, lng, shortName);
        onChange(shortName);
        setShowDropdown(false);
        setSuggestions([]);
    };

    return (
        <div className="space-y-1.5 relative w-full" ref={dropdownRef}>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {icon}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowDropdown(true);
                    }}
                    className={`bg-white text-slate-900 pr-10 border border-slate-200 focus-visible:ring-blue-950 ${
                        error ? "border-red-400 focus-visible:ring-red-400" : ""
                    }`}
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                    {error}
                </p>
            )}

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 text-slate-800 divide-y divide-slate-100">
                    {suggestions.map((item, index) => {
                        const parts = item.display_name.split(",");
                        const title = parts[0];
                        const subtitle = parts.slice(1).join(",").trim();
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                            >
                                <span className="font-semibold text-slate-700 truncate">
                                    {title}
                                </span>
                                <span className="text-xs text-slate-400 truncate">
                                    {subtitle}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
