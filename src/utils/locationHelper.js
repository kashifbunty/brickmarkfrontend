import { store } from '../store/store';
import { setLocation } from '../store/reducer/locationSlice';
import { toast } from 'react-hot-toast';
import { translate } from './helper';
import { setLocationData } from '../store/reducer/momentSlice';

/**
 * Fetch location data from coordinates using browser's geolocation API
 * @param {Function} onSuccess - Callback function on success
 * @param {Function} onError - Callback function on error
 */
export const getCurrentLocationData = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    const errorMsg = translate("geolocationNotSupported") || "Geolocation is not supported by this browser";
    // toast.error(errorMsg);
    if (onError) onError(errorMsg);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      
      // Get location details using Google's Geocoding API
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_API}`)
        .then(response => response.json())
        .then(data => {
          toast.dismiss();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const locationName = result.formatted_address;
            
            // Extract address components
            let city = null;
            let state = null;
            let country = null;
            
            result.address_components.forEach(component => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              } else if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              } else if (component.types.includes('country')) {
                country = component.long_name;
              }
            });
            
            // Create location object
            const locationData = {
              coordinates: { latitude, longitude },
              formatted_address: locationName,
              city,
              state,
              country
            };
            
            // Dispatch to new Redux store
            store.dispatch(setLocation(locationData));
            
            // Also update old Redux store for backward compatibility
            store.dispatch(
              setLocationData({
                city,
                country,
                state,
                formatted_address: locationName,
                latitude,
                longitude,
              })
            );
            
            // toast.success(translate("locationUpdated") || "Location updated successfully");
            
            if (onSuccess) onSuccess(locationData);
          } else {
            const errorMsg = translate("locationNotFound") || "Could not determine your location";
            // toast.error(errorMsg);
            if (onError) onError(errorMsg);
          }
        })
        .catch(error => {
          toast.dismiss();
          const errorMsg = translate("errorFetchingLocation") || "Error fetching location";
          // toast.error(errorMsg);
          console.error('Error getting location:', error);
          if (onError) onError(errorMsg);
        });
    },
    (error) => {
      toast.dismiss();
      let errorMsg = translate("locationError") || "Error getting location";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = translate("locationPermissionDenied") || "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = translate("locationUnavailable") || "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMsg = translate("locationTimeout") || "Location request timed out";
          break;
      }
      
    //   toast.error(errorMsg);
      console.error('Geolocation error:', error);
      if (onError) onError(errorMsg);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

/**
 * Set a manual location in the store
 * @param {string|object} location - The location string or location object with details
 * @returns {boolean} - Success status
 */
export const setManualLocation = (location) => {
  // Handle string input
  if (typeof location === 'string') {
    if (!location || !location.trim()) {
    //   toast.error(translate("pleaseEnterLocation") || "Please enter a location");
      return false;
    }
    
    // Create basic location object with just the formatted address
    const locationData = {
      formatted_address: location,
      city: null,
      state: null,
      country: null
      
    };
    
    // Dispatch to new Redux store
    store.dispatch(setLocation(locationData));
    
    // Also update old Redux store for backward compatibility
    store.dispatch(setLocationData({
      formatted_address: location,
      city: null, 
      state: null, 
      country: null
    }));
  } 
  // Handle location object (from autocomplete)
  else if (typeof location === 'object' && location !== null) {
    if (!location.formatted_address) {
      // toast.error(translate("invalidLocation") || "Invalid location data");
      return false;
    }
    
    // Dispatch to new Redux store
    store.dispatch(setLocation(location));
    
    // Also update old Redux store for backward compatibility
    store.dispatch(setLocationData({
      formatted_address: location.formatted_address,
      city: location.city,
      state: location.state,
      country: location.country,
      latitude: location.coordinates?.latitude,
      longitude: location.coordinates?.longitude
    }));
  } else {
    // toast.error(translate("invalidLocation") || "Invalid location data");
    return false;
  }
  
//   toast.success(translate("locationUpdated") || "Location updated successfully");
  return true;
};

export default {
  getCurrentLocationData,
  setManualLocation
}; 