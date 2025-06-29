import React, { useRef, useState, useEffect } from "react";
import { StandaloneSearchBox } from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import { selectIsLocationSet, clearLocation, setLocation } from "@/store/reducer/locationSlice";
import { loadGoogleMaps, translate } from "@/utils/helper";

const LocationSearchBox = ({
    locationDataa,
    onLocationSelected,
    initialLatitude,
    initialLongitude,
    clearfilterLocation,
    skipInitialSelection = false,
    style
}) => {
    const dispatch = useDispatch();
    const { isLoaded } = loadGoogleMaps();
    const isLocationSet = useSelector(selectIsLocationSet);
    const inputRef = useRef();
    const [inputValue, setInputValue] = useState(locationDataa?.formatted_address || "");
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [latitude, setLatitude] = useState(initialLatitude || null);
    const [longitude, setLongitude] = useState(initialLongitude || null);
    const [locationData, setLocationData] = useState({
        name: locationDataa?.name || "",
        formatted_address: locationDataa?.formatted_address || "",
        lat: locationDataa?.lat || null,
        lng: locationDataa?.lng || null,
        city: locationDataa?.city || "",
        district: locationDataa?.district || "",
        state: locationDataa?.state || "",
        country: locationDataa?.country || "",
    });


    // When the component is mounted, set the initial input value
    useEffect(() => {
        if (clearfilterLocation && !isLocationSet && isInitialLoad) {
            if (skipInitialSelection) {
                fetchLocationFromCoordinatesWithoutCallback(initialLatitude, initialLongitude);
            } else {
                fetchLocationFromCoordinates(initialLatitude, initialLongitude);
            }
            setIsInitialLoad(false);
        }
    }, [clearfilterLocation, initialLatitude, initialLongitude, isLocationSet, isInitialLoad, skipInitialSelection]);

    useEffect(() => {
        if (clearfilterLocation) {
            setInputValue("");
            setLatitude(null);
            setLongitude(null);
            setLocationData({
                name: "",
                formatted_address: "",
                lat: null,
                lng: null,
                city: "",
                district: "",
                state: "",
                country: "",
            });
            dispatch(clearLocation()); // Clear the location from the store
            setIsInitialLoad(true);
        }
    }, [clearfilterLocation, dispatch]);

    useEffect(() => {
        if (latitude && longitude && !isInitialLoad) {
            fetchLocationFromCoordinates(latitude, longitude);
        }
    }, [latitude, longitude, isInitialLoad]);

    const fetchLocationFromCoordinatesWithoutCallback = async (lat, lng) => {
        if (!lat || !lng) return;

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API;

        const requestUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error(`Geocoding API request failed with status: ${response.status}`);

            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const place = data.results[0];
                const locationData = {
                    name: place.name,
                    formatted_address: place.formatted_address,
                    lat,
                    lng,
                    city: "",
                    district: "",
                    state: "",
                    country: "",
                };

                place.address_components.forEach((component) => {
                    if (component.types.includes("locality")) {
                        locationData.city = component.long_name;
                    } else if (component.types.includes("sublocality")) {
                        locationData.district = component.long_name;
                    } else if (component.types.includes("administrative_area_level_1")) {
                        locationData.state = component.long_name;
                    } else if (component.types.includes("country")) {
                        locationData.country = component.long_name;
                    }
                });

                setLocationData(locationData);
                setInputValue(locationData.formatted_address);
            } else {
                console.error("No results found for the provided coordinates.");
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    const fetchLocationFromCoordinates = async (lat, lng) => {
        if (!lat || !lng) return;

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API;

        const requestUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error(`Geocoding API request failed with status: ${response.status}`);

            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const place = data.results[0];
                const locationData = {
                    name: place.name,
                    formatted_address: place.formatted_address,
                    lat,
                    lng,
                    city: "",
                    district: "",
                    state: "",
                    country: "",
                };

                place.address_components.forEach((component) => {
                    if (component.types.includes("locality")) {
                        locationData.city = component.long_name;
                    } else if (component.types.includes("sublocality")) {
                        locationData.district = component.long_name;
                    } else if (component.types.includes("administrative_area_level_1")) {
                        locationData.state = component.long_name;
                    } else if (component.types.includes("country")) {
                        locationData.country = component.long_name;
                    }
                });

                setLocationData(locationData);
                dispatch(setLocation(locationData)); // Set the location in Redux store
                onLocationSelected(locationData);
                setInputValue(locationData.formatted_address);
            } else {
                console.error("No results found for the provided coordinates.");
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    const handlePlaceChanged = () => {
        const places = inputRef.current.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            if (place) {
                const locationData = {
                    name: place.name,
                    formatted_address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    city: "",
                    district: "",
                    state: "",
                    country: "",
                };

                const addressComponents = place.address_components;

                addressComponents.forEach((component) => {
                    if (component.types.includes("locality")) {
                        locationData.city = component.long_name;
                    } else if (component.types.includes("sublocality")) {
                        locationData.district = component.long_name;
                    } else if (component.types.includes("administrative_area_level_1")) {
                        locationData.state = component.long_name;
                    } else if (component.types.includes("country")) {
                        locationData.country = component.long_name;
                    }
                });

                setLocationData(locationData);
                dispatch(setLocation(locationData)); // Set the location in Redux store
                onLocationSelected(locationData);
                setInputValue(locationData.formatted_address);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        isLoaded && (
            <div>
                <StandaloneSearchBox onLoad={(ref) => (inputRef.current = ref)} onPlacesChanged={handlePlaceChanged}>
                    <input
                        style={{ ...style }}
                        type="text"
                        className="searchLocationInput"
                        placeholder={translate("enterLocation")}
                        onKeyPress={handleKeyPress}
                        onChange={handleInputChange}
                        value={inputValue}
                    />
                </StandaloneSearchBox>
            </div>
        )
    );
};

export default LocationSearchBox;
