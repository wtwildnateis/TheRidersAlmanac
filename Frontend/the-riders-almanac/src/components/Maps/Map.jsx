import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import mapPinLogo from "../../assets/map_pin_logo.png?inline";
import MapInfoWindow from "./MapInfoWindow";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const libraries = ["places"];
const containerStyle = { width: "100%", height: "100%" }; // height via CSS parent

const MapComponent = ({ selectedType, filterConfig }) => {
  const [mapLocked, setMapLocked] = useState(false);

  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 38.627, lng: -90.1994 });
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [myLocation, setMyLocation] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    version: "weekly",
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(userLoc);
        setMyLocation(userLoc);
        map.panTo(userLoc);
      });
    }
  }, []);

  const mergeDuplicatedPins = (arrays) => {
    const seen = new Set();
    const merged = [];
    let allMapResults = [];
    arrays.forEach((arr) => {
      allMapResults = allMapResults.concat(arr);
    });
    allMapResults.forEach((place) => {
      const key = place.place_id || (place.name + place.vicinity);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(place);
      }
    });
    return merged;
  };

  // Fetch place details for selected marker
  useEffect(() => {
    if (!selectedPlaceId || !mapRef.current || !window.google) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails({ placeId: selectedPlaceId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaceDetails(place);
      } else {
        console.error("Failed to load place Details:", status);
        setPlaceDetails(null);
      }
    });
  }, [selectedPlaceId]);

  // Fetch markers when type / center changes
  useEffect(() => {
    if (!mapRef.current || !selectedType || !window.google) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);

    let filtersToSearch = [];
    if (selectedType === "All") {
      filtersToSearch = Object.values(filterConfig);
    } else {
      const filter = filterConfig[selectedType];
      if (filter) filtersToSearch = [filter];
    }

    const allPromises = [];

    filtersToSearch.forEach((filter) => {
      if (!filter) return;
      const keywordList = Array.isArray(filter.keyword)
        ? filter.keyword
        : [filter.keyword];

      keywordList.forEach((keyword) => {
        const request = {
          location: center,
          radius: 30000,
          keyword,
          type: filter.type,
        };
        allPromises.push(
          new Promise((resolve) => {
            service.nearbySearch(request, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK)
                resolve(results);
              else resolve([]);
            });
          })
        );
      });

      if (filter.placeId) {
        allPromises.push(
          new Promise((resolve) => {
            service.getDetails(
              { placeId: filter.placeId, fields: ["geometry", "name"] },
              (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                  resolve([
                    {
                      geometry: place.geometry,
                      name: place.name,
                      place_id: place.place_id,
                    },
                  ]);
                } else {
                  console.warn("Place ID getDetails failed:", status);
                  resolve([]);
                }
              }
            );
          })
        );
      }
    });

    Promise.all(allPromises).then((resultsArray) => {
      const allMapResults = mergeDuplicatedPins(resultsArray);
      const newMarkers = allMapResults.map((place) => ({
        position: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        name: place.name,
        place_id: place.place_id,
      }));
      setMarkers(newMarkers);
    });
  }, [selectedType, center, filterConfig]);

  const markerIcon = useMemo(() => {
    if (!window.google) return undefined;

    const LOGO_W = 25;
    const LOGO_H = 25;
    const LOGO_X = 23 - LOGO_W / 2;
    const LOGO_Y = 23 - LOGO_H / 2;

    const svg = `
      <svg width="46" height="64" viewBox="0 0 46 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 0C10.3 0 0 10.3 0 23c0 16.2 16.9 29.5 22.2 40.3a1,1 0 0 0 1.6 0C29.1 52.5 46 39.2 46 23 46 10.3 35.7 0 23 0z" fill="#1D381B"/>
        <image href="${mapPinLogo}" x="${LOGO_X}" y="${LOGO_Y}"
               width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>
      </svg>
    `;

    return {
      url: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(34, 48),
      anchor: new window.google.maps.Point(17, 48),
    };
  }, [isLoaded, mapPinLogo]);

  const myLocationIcon = useMemo(() => {
    if (!window.google) return undefined;

    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" fill="#1D381B" opacity="0.28"/>
        <circle cx="12" cy="12" r="5" fill="#7EE1A9"/>
        <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
      </svg>
    `;
    return {
      url: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(22, 22),
      anchor: new window.google.maps.Point(11, 11),
      zIndex: (window.google?.maps?.Marker?.MAX_ZINDEX || 100000) + 1,
    };
  }, [isLoaded]);

  // Map options respect "locked" state
  const mapOptions = useMemo(
    () => ({
      mapId: (import.meta.env.VITE_GOOGLE_MAP_ID || "").trim() || undefined,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: mapLocked ? "none" : "greedy",
      draggable: !mapLocked,
      scrollwheel: !mapLocked,
      disableDoubleClickZoom: mapLocked,
    }),
    [mapLocked]
  );

  // Search box handler
  const handleSearchPlacesChanged = () => {
    const box = searchRef.current;
    if (!box) return;

    const places = box.getPlaces();
    if (!places?.length) return;

    const g = places[0].geometry;
    if (g?.location) {
      const next = { lat: g.location.lat(), lng: g.location.lng() };
      setCenter(next);
      mapRef.current?.panTo(next);
      mapRef.current?.setZoom(13);
    }
  };

  // These returns are safe (AFTER all hooks)
  if (loadError) {
    return <div className="map-error">Error loading map</div>;
  }

  if (!isLoaded) {
    return <div className="map-loading">Loading map...</div>;
  }

  return (
    <>
      {/* Search pill overlay */}
      <StandaloneSearchBox
        onLoad={(ref) => (searchRef.current = ref)}
        onPlacesChanged={handleSearchPlacesChanged}
      >
        <div
          className="map-search"
          role="search"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="map-search__icon" aria-hidden>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line
                x1="16.65"
                y1="16.65"
                x2="22"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="map-search__divider" aria-hidden></span>
          <input className="map-search__input" placeholder="Search" />
        </div>
      </StandaloneSearchBox>

      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={11}
        center={center}
        onLoad={onMapLoad}
        onClick={() => {
          // clicking the bare map closes window + unlocks map
          setSelectedMarker(null);
          setPlaceDetails(null);
          setSelectedPlaceId(null);
          setMapLocked(false);
        }}
        options={mapOptions}
      >
        {/* Custom controls */}
        <div
          className="map-controls"
          role="group"
          aria-label="Map controls"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="map-control-btn"
            title="Zoom in"
            aria-label="Zoom in"
            onClick={() => {
              if (!mapRef.current) return;
              mapRef.current.setZoom((mapRef.current.getZoom() ?? 12) + 1);
            }}
          >
            +
          </button>

          <button
            type="button"
            className="map-control-btn"
            title="Zoom out"
            aria-label="Zoom out"
            onClick={() => {
              if (!mapRef.current) return;
              mapRef.current.setZoom((mapRef.current.getZoom() ?? 12) - 1);
            }}
          >
            −
          </button>

          <button
            type="button"
            className="map-control-btn"
            title="My location"
            aria-label="My location"
            onClick={async () => {
              if (!navigator.geolocation || !mapRef.current) return;
              try {
                const pos = await new Promise((resolve, reject) =>
                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 0,
                  })
                );
                const { latitude, longitude } = pos.coords;
                const me = { lat: latitude, lng: longitude };
                setCenter(me);
                setMyLocation(me);
                mapRef.current.panTo(me);
                mapRef.current.setZoom(
                  Math.max(13, mapRef.current.getZoom() ?? 14)
                );
              } catch (err) {
                console.warn("Geolocation error:", err);
              }
            }}
          >
            ⦿
          </button>
        </div>

        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={marker.position}
            title={marker.name}
            icon={markerIcon}
            onClick={() => {
              setSelectedMarker(marker);
              setSelectedPlaceId(marker.place_id);
              setMapLocked(true);

              // recenter map behind the modal if you want
              if (mapRef.current) {
                mapRef.current.panTo(marker.position);
              }
            }}
          />
        ))}

        {myLocation && (
          <Marker
            position={myLocation}
            icon={myLocationIcon}
            zIndex={window.google?.maps?.Marker?.MAX_ZINDEX || 100000}
          />
        )}
      </GoogleMap>

      {/* POP-OUT INFO WINDOW OVERLAY (full-screen modal style) */}
      <MapInfoWindow
        marker={selectedMarker}
        placeDetails={placeDetails}
        placeId={selectedPlaceId}
        onClose={() => {
          setSelectedMarker(null);
          setPlaceDetails(null);
          setSelectedPlaceId(null);
          setMapLocked(false); // unlock map when window closes
        }}
      />
    </>
  );
};

export default MapComponent;