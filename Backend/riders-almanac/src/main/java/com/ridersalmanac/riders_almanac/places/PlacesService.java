package com.ridersalmanac.riders_almanac.places;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class PlacesService {

    private final RestClient client;

    public PlacesService(@Value("${GOOGLE_MAPS_API_KEY}") String apiKey) {
        this.client = RestClient.builder()
                .baseUrl("https://places.googleapis.com")
                .defaultHeader("X-Goog-Api-Key", apiKey)
                .build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> autocomplete(Map<String, Object> body) {
        return client.post()
                .uri("/v1/places:autocomplete")
                .body(body)
                .retrieve()
                .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> details(String placeId, String sessionToken) {
        String fieldMask = "id,formattedAddress,addressComponents";

        var req = client.get()
                .uri("/v1/places/{placeId}", placeId)
                .header("X-Goog-FieldMask", fieldMask);

        if (sessionToken != null && !sessionToken.isBlank()) {
            req = req.header("X-Goog-SessionToken", sessionToken);
        }

        return req.retrieve().body(Map.class);
    }
}
