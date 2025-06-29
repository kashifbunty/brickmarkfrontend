"use client"
import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { translate } from "@/utils/helper";

const GoogleMapBox = ({ onSelectLocation, apiKey, latitude, longitude }) => {
    const systemSettings = useSelector(settingsData);
    const [location, setLocation] = useState({
        lat: latitude ? parseFloat(latitude) : parseFloat(systemSettings?.latitude),
        lng: longitude ? parseFloat(longitude) : parseFloat(systemSettings?.longitude),
    });
    const [mapError, setMapError] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [selectedLocationAddress, setSelectedLocationAddress] = useState({
        city: "",
        state: "",
        country: "",
        formatted_address: "",
        lat: latitude ? parseFloat(latitude) : parseFloat(systemSettings?.latitude),
        lng: longitude ? parseFloat(longitude) : parseFloat(systemSettings?.longitude),
    });
    const autocompleteRef = useRef(null);

    useEffect(() => {
        // Update the location state when latitude or longitude changes
        if (latitude && longitude) {

            setLocation({
                lat: latitude ? parseFloat(latitude) : parseFloat(systemSettings?.latitude),
                lng: longitude ? parseFloat(longitude) : parseFloat(systemSettings?.longitude),
            });
        }
    }, [latitude, longitude]);

    const handleMarkerDragEnd = async (e) => {
        const { lat, lng } = e.latLng;
        const reverseGeocodedData = await performReverseGeocoding(lat(), lng());
        if (reverseGeocodedData) {
            const { city, country, state, formatted_address } = reverseGeocodedData;
            const updatedLocation = {
                ...location,
                lat: lat(),
                lng: lng(),
                city: city,
                country: country,
                state: state,
                formatted_address: formatted_address,
            };
            setLocation(updatedLocation);
            onSelectLocation(updatedLocation);
            setSelectedLocationAddress({
                ...selectedLocationAddress,
                city: city,
                country: country,
                state: state,
                formatted_address: formatted_address,
                lat: lat(),
                lng: lng(),
            });
        } else {
            console.error("No reverse geocoding data available");
        }
    };

    const performReverseGeocoding = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch data. Status: " + response.status);
            }

            const data = await response.json();

            if (data.status === "OK" && data.results && data.results.length > 0) {
                const result = data.results[0];
                const { city, country, state, formatted_address } = extractCityFromGeocodeResult(result);
                return {
                    city,
                    country,
                    state,
                    formatted_address
                };
            } else {
                throw new Error("No results found");
            }
        } catch (error) {
            console.error("Error performing reverse geocoding:", error);
            return null;
        }
    };

    const extractCityFromGeocodeResult = (geocodeResult) => {
        let city = null;
        let country = null;
        let state = null;
        let formatted_address = null;

        for (const component of geocodeResult.address_components) {
            if (component.types.includes("locality")) {
                city = component.long_name;
            } else if (component.types.includes("country")) {
                country = component.long_name;
            } else if (component.types.includes("administrative_area_level_1")) {
                state = component.long_name;
            }
        }   
        formatted_address = geocodeResult.formatted_address;

        return { city, country, state, formatted_address };
    };
    return (
        <div>
            {mapError ? (
                <div>{mapError}</div>
            ) : (
                <div style={{position:"relative"}}>
                    <span style={{ color: "#282f39", fontWeight: "600", fontSize: "small"}} className="is_require">{translate('googleMap')}</span>
                    <GoogleMap zoom={11} center={location} mapContainerStyle={{ height: "400px", borderRadius: "12px" }}>
                        <Marker position={location} draggable={true} onDragEnd={handleMarkerDragEnd} />
                    </GoogleMap>
                </div>
            )
            }
        </div >
    );
};

export default GoogleMapBox;
