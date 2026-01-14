package com.ridersalmanac.riders_almanac.geo;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleGeocodingService {

    private final RestClient restClient = RestClient.create();

    @Value("${google.maps.apiKey:}")
    private String apiKey;

    public LatLng geocodeAddress(String address) {
        if (apiKey == null || apiKey.isBlank()) return null;
        if (address == null || address.isBlank()) return null;

        // ✅ IMPORTANT: do NOT use build(true) here.
        // build(true) assumes query params are already encoded and will NOT escape spaces.
        URI uri = UriComponentsBuilder
                .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("address", address)
                .queryParam("key", apiKey)
                .build()
                .encode()
                .toUri();

        GeocodeResponse res = restClient.get()
                .uri(uri)
                .retrieve()
                .body(GeocodeResponse.class);

        if (res == null || res.results == null || res.results.isEmpty()) return null;
        if (res.results.get(0) == null || res.results.get(0).geometry == null || res.results.get(0).geometry.location == null) return null;

        var loc = res.results.get(0).geometry.location;
        return new LatLng(loc.lat, loc.lng);
    }

    public record LatLng(double lat, double lng) {}

    // Minimal JSON mapping for the Geocoding API response
    public static class GeocodeResponse {
        public List<Result> results;
        public String status;

        public static class Result {
            public Geometry geometry;
        }

        public static class Geometry {
            public Location location;
        }

        public static class Location {
            public double lat;
            public double lng;
        }
    }
}