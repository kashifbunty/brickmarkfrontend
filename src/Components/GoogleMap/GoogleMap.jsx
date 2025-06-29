"use client";

import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultOrigin = {
  lat: 23.2530, // Bhuj latitude
  lng: 69.6699, // Bhuj longitude
};

const Map = (props) => {
  const [currentPosition, setCurrentPosition] = useState(defaultOrigin);
  const [directions, setDirections] = useState(null);
  const [isDirectionsFetched, setIsDirectionsFetched] = useState(false);

  const destination = {
    lat: parseFloat(props.latitude),
    lng: parseFloat(props.longitude),
  };

  // Get user's current location or fallback to Bhuj
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Using default location due to error:", error);
        setCurrentPosition(defaultOrigin);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      setIsDirectionsFetched(true);
    } else {
      console.error('Directions request failed', response);
    }
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={destination}
      zoom={14}
    >
      {/* User or default location marker */}
      {/* {currentPosition && <Marker position={currentPosition} />} */}

      {/* Destination marker */}
      <Marker position={destination} />

      {/* Request directions */}
      {/* {currentPosition && !isDirectionsFetched && (
        <DirectionsService
          options={{
            origin: currentPosition,
            destination: destination,
            travelMode: 'DRIVING',
          }}
          callback={directionsCallback}
        />
      )} */}

      {/* Render directions */}
      {/* {directions && <DirectionsRenderer directions={directions} />} */}
    </GoogleMap>
  );
};

export default Map;
