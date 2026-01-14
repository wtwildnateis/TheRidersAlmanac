package com.ridersalmanac.riders_almanac.places;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/places")
public class PlacesController {

    private final PlacesService placesService;

    public PlacesController(PlacesService placesService) {
        this.placesService = placesService;
    }

    // Frontend POSTs { input, sessionToken, regionCode }
    @PostMapping("/suggest")
    public Map<String, Object> suggest(@RequestBody Map<String, Object> body) {
        return placesService.autocomplete(body);
    }

    // Frontend GETs /details?placeId=...&sessionToken=...
    @GetMapping("/details")
    public Map<String, Object> details(
            @RequestParam String placeId,
            @RequestParam(required = false) String sessionToken
    ) {
        return placesService.details(placeId, sessionToken);
    }
}