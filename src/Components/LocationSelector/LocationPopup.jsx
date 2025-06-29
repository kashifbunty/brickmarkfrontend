import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FiMapPin } from 'react-icons/fi';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { useSelector, useDispatch } from 'react-redux';
import { clearLocation, selectCurrentLocation } from '@/store/reducer/locationSlice';
import { toast } from 'react-hot-toast';
import { loadGoogleMaps, translate } from '@/utils/helper';
import { getCurrentLocationData, setManualLocation } from '@/utils/locationHelper';
import LocationSearchBox from '@/Components/Location/LocationSearchBox';
import { store } from '@/store/store';

const LocationModal = ({
  show,
  onHide,
  onSave,
}) => {
  const dispatch = useDispatch();
  const systemSettings = store.getState().Settings?.data;
  const currentLocation = useSelector(selectCurrentLocation);

  const minRadius = systemSettings?.min_radius_range || 1;
  const maxRadius = systemSettings?.max_radius_range || 100;

  const defaultLocation = {
    lat: Number(systemSettings?.latitude),
    lng: Number(systemSettings?.longitude)
  };


  const primaryColor = document.documentElement.style.getPropertyValue('--primary-color');

  const [location, setLocation] = useState(defaultLocation);
  const [radius, setRadius] = useState(currentLocation?.radius || minRadius || 10);
  const mapRef = useRef(null);
  const [searchBoxKey, setSearchBoxKey] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState(0);

  // Custom CSS for the new UI style
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'location-modal-styles';
    style.innerHTML = `
      /* Modal styling */
      .location-modal .modal-header {
        border-bottom: none;
        padding: 20px 20px 0 20px;
      }
      
      .location-modal .modal-body {
        padding: 10px 20px 20px 20px;
      }
      
      .location-modal .modal-title {
        font-weight: 600;
        font-size: 1.25rem;
      }
      
      .location-description {
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
      }
      
      /* Search box container */
      .search-container {
        display: flex;
        margin-bottom: 20px;
        background: #f5f5f5;
        border-radius: 8px;
        padding: 5px;
      }
      
      .search-box {
        flex-grow: 1;
        position: relative;
      }
      
      .search-box input {
        width: 100%;
        padding: 12px 15px;
        border: none;
        border-radius: 8px;
        background: #f5f5f5;
        font-size: 15px;
      }
      
      .search-box input:focus {
        outline: none;
      }
      
      /* Find location button */
      .find-location-btn {
        background-color: ${primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        white-space: nowrap;
      }
      
      .find-location-btn:hover {
        opacity: 0.9;
      }
      
      /* Map container */
      .map-container {
        width: 100%;
        height: 350px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      /* Map instructions */
      // .map-instructions {
      //   color: #666;
      //   font-size: 13px;
      //   margin-bottom: 20px;
      //   text-align: center;
      //   font-style: italic;
      // }
      
      /* Range slider */
      .range-container {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        position: relative;
      }
      
      .range-label {
        font-weight: 500;
        margin-bottom: 10px;
      }
      
      .slider-container{
        position: relative;
      }
      
      .range-tooltip {
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        position: absolute;
        top: -30px;
        transform: translateX(-50%);
        font-size: 14px;
        pointer-events: none;
        z-index: 100;
      }


      /* Custom tooltip on thumb */
      .slider-thumb-tooltip {
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        transform: translateX(-50%);
        top:-50px;
        z-index: 10;
        transition: left 0.1s;
      }
      
      .slider-thumb-tooltip:after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        margin-left: -5px;
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: #333 transparent transparent;
      }
      
      .km-range-slider {
        width: 100%;
        -webkit-appearance: none;
        height: 6px;
        border-radius: 3px;
        background: #ddd;
        outline: none;
      }
      
      .km-range-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${primaryColor};
        cursor: pointer;
      }
      
      .km-range-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${primaryColor};
        cursor: pointer;
        border: none;
      }
      
      /* Footer buttons */
      .modal-footer {
        justify-content: flex-end;
        border-top: none;
        padding: 0 20px 20px 20px;
      }
      
      .clear-btn {
        background: transparent;
        border: none;
        color: #333;
        font-weight: 500;
        padding: 10px 15px;
        border-radius: 8px;
      }
      
      .clear-btn:hover {
        background: #f5f5f5;
      }
      
      .save-btn {
        background: #333;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
      }
      
      .save-btn:hover {
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById('location-modal-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [primaryColor]);

  // Function to calculate tooltip position
  const calculateTooltipPosition = (value) => {
    if (!sliderRef.current) return 0;

    const min = parseFloat(sliderRef.current.min);
    const max = parseFloat(sliderRef.current.max);
    const percent = ((value - min) / (max - min)) * 100;

    return `${percent}%`;
  };

  // Calculate tooltip position initially and when radius changes
  useEffect(() => {
    if (sliderRef.current) {
      setTooltipPosition(calculateTooltipPosition(radius));
    }
  }, [radius, sliderRef.current]);

  // Load Google Maps JS API
  const { isLoaded } = loadGoogleMaps();

  // Initialize with current Redux location if available
  useEffect(() => {
    if (currentLocation?.coordinates) {
      setLocation({
        lat: currentLocation.coordinates.latitude,
        lng: currentLocation.coordinates.longitude
      });
    }
  }, [currentLocation]);

  // Handle location selection from search box
  const handleLocationSelected = (selectedLocation) => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      setLocation({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        formatted_address: selectedLocation.formatted_address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        country: selectedLocation.country
      });

      // Center the map on the selected location
      if (mapRef.current) {
        mapRef.current.panTo({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        });
      }
    }
  };

  // Handle map click to set marker position
  const handleMapClick = async (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    // Set the location immediately so the marker moves
    setLocation(prev => ({
      ...prev,
      lat: newLocation.lat,
      lng: newLocation.lng
    }));
    
    // Fetch the address for this location
    await fetchAddressFromCoordinates(newLocation.lat, newLocation.lng);
  };

  // Handle marker drag end to update location
  const handleMarkerDragEnd = async (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    // Set the location to update the UI
    setLocation(prev => ({
      ...prev,
      lat: newLocation.lat,
      lng: newLocation.lng
    }));
    
    // Fetch the address for this location
    await fetchAddressFromCoordinates(newLocation.lat, newLocation.lng);
  };

  // Fetch address from coordinates when map is dragged
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_API}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const formatted_address = result.formatted_address;

        let city = '', state = '', country = '';
        result.address_components.forEach(component => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (component.types.includes('country')) {
            country = component.long_name;
          }
        });

        // Update location with new address details
        const newLocation = {
          lat,
          lng,
          formatted_address,
          city,
          state,
          country
        };
        
        setLocation(newLocation);
        setSearchBoxKey(prev => prev + 1);
        
        return newLocation; // Return the updated location object
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  // Handle slider change
  const handleRadiusChange = (e) => {
    setRadius(Number(e.target.value));
    // Update tooltip position
    setTooltipPosition(calculateTooltipPosition(e.target.value));
  };

  // Handle current location button
  const handleCurrentLocation = () => {
    getCurrentLocationData(
      (locationData) => {
        if (locationData && locationData.coordinates) {
          setLocation({
            lat: locationData.coordinates.latitude,
            lng: locationData.coordinates.longitude,
            formatted_address: locationData.formatted_address,
            city: locationData.city,
            state: locationData.state,
            country: locationData.country
          });

          if (mapRef.current) {
            mapRef.current.panTo({
              lat: locationData.coordinates.latitude,
              lng: locationData.coordinates.longitude
            });
          }
        }
      },
      (error) => {
        toast.error(translate("locationError") || "Error getting location");
      }
    );
  };

  // Handle clear button
  const handleClear = () => {
    dispatch(clearLocation());
    setLocation(defaultLocation);
    setRadius(minRadius);
    setSearchBoxKey(prev => prev + 1);
  };

  // Handle save
  const handleSave = async () => {
    try {
      // Wait for address fetching to complete
      const addressData = await fetchAddressFromCoordinates(location.lat, location.lng);
      
      // Use the address data returned from fetch if available, otherwise use current location state
      const updatedLocation = addressData || location;
      
      // Now create location data with the updated location info
      const locationData = {
        formatted_address: updatedLocation.formatted_address || '',
        coordinates: {
          latitude: updatedLocation.lat,
          longitude: updatedLocation.lng
        },
        city: updatedLocation.city || '',
        state: updatedLocation.state || '',
        country: updatedLocation.country || '',
        radius: radius
      };
      
      // Save the location data
      setManualLocation(locationData);
      onSave && onSave(locationData);
      onHide();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(translate("locationSaveError") || "Error saving location");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="location-modal">
      <Modal.Header closeButton>
        <Modal.Title>{translate("selectLocation") || "Select Location"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="location-description">
          {translate("locationDescription") || "Find the perfect place—explore properties, projects, and nearby amenities based on your chosen location."}
        </p>

        {/* Search Box and Find My Location Button */}
        <div className="search-container">
          <div className="search-box">
            <LocationSearchBox
              key={searchBoxKey}
              locationDataa={{
                lat: location.lat,
                lng: location.lng
              }}
              onLocationSelected={handleLocationSelected}
              initialLatitude={location.lat}
              initialLongitude={location.lng}
              skipInitialSelection={true}
              style={{ margin: "0px", height: "100%", background: "#f5f5f5", border: "none" }}
              placeholder={translate("enterLocationManually") || "Enter Location Manually"}
            />
          </div>
          <button className="find-location-btn" onClick={handleCurrentLocation}>
            <FiMapPin /> {translate("findMyLocation") || "Find My Location"}
          </button>
        </div>

        {/* Map with Marker and Radius */}
        <div className="map-container">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={location}
              zoom={12}
              onLoad={map => (mapRef.current = map)}
              onClick={handleMapClick}
              options={{ draggable: true }}
            >
              <Marker 
                position={location} 
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
              <Circle
                center={location}
                radius={radius * 1000} // Convert KM to meters
                options={{
                  fillColor: primaryColor,
                  strokeColor: primaryColor,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillOpacity: 0.2,
                }}
              />
            </GoogleMap>
          )}
        </div>
        
        {/* Map instructions */}
        {/* <div className="map-instructions">
          {translate("clickMapOrDragMarker") || "Click anywhere on the map or drag the marker to set your location"}
        </div> */}

        {/* KM Range Slider */}
        <div className="range-container">
          <div className="range-label">
            {translate("kmRange") || "KM Range"}
          </div>
          <div className="slider-container">
            {/* Custom tooltip that follows the thumb */}
            <div
              className="slider-thumb-tooltip"
              style={{
                left: tooltipPosition,
                opacity: showTooltip ? 1 : 0
              }}
            >
              {radius} km
            </div>

            <input
              ref={sliderRef}
              type="range"
              min={minRadius}
              max={maxRadius}
              value={radius}
              onChange={handleRadiusChange}
              className="km-range-slider"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onMouseDown={() => setShowTooltip(true)}
              onMouseUp={() => setShowTooltip(false)}
              onTouchStart={() => setShowTooltip(true)}
              onTouchEnd={() => setShowTooltip(false)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="clear-btn" onClick={handleClear}>
          {translate("clear") || "Clear"}
        </button>
        <button className="save-btn" onClick={handleSave}>
          {translate("saveLocation") || "Save Location"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationModal;