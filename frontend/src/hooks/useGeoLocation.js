import { useCallback, useState } from "react";

const useGeoLocation = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    latitude: null,
    longitude: null
  });

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported in this browser"
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, []);

  return {
    ...state,
    capture
  };
};

export default useGeoLocation;
