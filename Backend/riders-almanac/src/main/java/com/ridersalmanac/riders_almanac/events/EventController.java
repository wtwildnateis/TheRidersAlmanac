package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.events.dto.CreateEventRequest;
import com.ridersalmanac.riders_almanac.events.dto.EventResponse;
import com.ridersalmanac.riders_almanac.events.dto.UpcomingEventsDto;
import com.ridersalmanac.riders_almanac.events.dto.UpdateEventRequest;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;
    private final UserRepository users;


    // Calendar list
    @GetMapping
    public List<EventResponse> list(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return service.list(from, to);
    }

    @GetMapping("/{id}")
    public EventResponse get(
            @PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public EventResponse create(
            @Valid @RequestBody CreateEventRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        Long ownerId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();

        return service.create(ownerId, req);
    }

    @PutMapping("/{id}")
    public EventResponse update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UpdateEventRequest req) {
        Long currentUserId = users.findByUsername(principal.getUsername()).orElseThrow().getId();
        return service.update(id, currentUserId, req);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        Long currentUserId = users.findByUsername(principal.getUsername()).orElseThrow().getId();
        service.delete(id, currentUserId);
    }

    @GetMapping("/upcoming")
    public List<UpcomingEventsDto> upcoming(@RequestParam(defaultValue = "5") int limit) {
        return service.upcoming(limit);
    }

    @GetMapping("/near")
    public List<EventResponse> near(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "25") double radiusMiles
    ) {
        return service.listNear(lat, lng, radiusMiles);
    }
}
