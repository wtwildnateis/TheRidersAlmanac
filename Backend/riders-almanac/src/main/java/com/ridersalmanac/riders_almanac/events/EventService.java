package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.events.dto.*;
import com.ridersalmanac.riders_almanac.geo.GoogleGeocodingService;
import com.ridersalmanac.riders_almanac.users.Role;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository events;
    private final UserRepository users;
    private final GoogleGeocodingService geocoding;

    @Transactional
    public EventResponse create(Long ownerId, CreateEventRequest req) {
        User owner = users.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Event e = new Event();
        e.setOwner(owner);
        e.setTitle(req.title());
        e.setType(req.type());
        e.setFlyer(req.flyer());
        e.setStart(req.start());
        e.setEnd(req.end());
        e.setStreet(req.street());
        e.setCity(req.city());
        e.setState(req.state());
        e.setZip(req.zip());
        e.setDescription(req.description());
        e.setStatus(Event.Status.ACTIVE);
        e.setIsDeleted(false);

        // NEW: geocode address once on create (if possible)
        geocodeIfPossible(e);

        e = events.save(e);
        return EventMapper.toDto(e);
    }

    public List<EventResponse> list(Instant from, Instant to) {
        var list = events.findWindow(from, to, Event.Status.ACTIVE);
        return list.stream().map(EventMapper::toDto).toList();
    }

    public EventResponse get(Long id) {
        var e = requireEvent(id);
        return EventMapper.toDto(e);
    }

    @Transactional
    public EventResponse update(Long id, Long currentUserId, UpdateEventRequest req) {
        var e = requireEvent(id);
        var current = requireUser(currentUserId);
        ensureCanModify(e, current);

        boolean addressChanged = false;

        if (req.title() != null) e.setTitle(req.title());
        if (req.type() != null) e.setType(req.type());
        if (req.flyer() != null) e.setFlyer(req.flyer());
        if (req.start() != null) e.setStart(req.start());
        if (req.end() != null) e.setEnd(req.end());

        if (req.street() != null) { e.setStreet(req.street()); addressChanged = true; }
        if (req.city() != null)   { e.setCity(req.city());     addressChanged = true; }
        if (req.state() != null)  { e.setState(req.state());   addressChanged = true; }
        if (req.zip() != null)    { e.setZip(req.zip());       addressChanged = true; }

        if (req.description() != null) e.setDescription(req.description());
        if (req.status() != null) e.setStatus(Event.Status.valueOf(req.status()));

        // NEW: if address changed, re-geocode and store fresh lat/lng
        if (addressChanged) {
            geocodeIfPossible(e);
        }

        // In @Transactional, JPA will flush changes automatically, but saving is fine too:
        // events.save(e);

        return EventMapper.toDto(e);
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        var e = requireEvent(id);
        var current = requireUser(currentUserId);
        ensureCanModify(e, current);

        e.setIsDeleted(true);
        e.setDeletedAt(Instant.now());
        e.setDeletedBy(current);
    }

    /**
     * NEW: Radius search ("near me")
     * Expects EventRepository.findNear(...) as a native query using bounding box + Haversine.
     */
    public List<EventResponse> listNear(double lat, double lng, double radiusMiles) {
        double safeRadius = Math.max(0.1, Math.min(radiusMiles, 200)); // clamp

        // rough bounding box
        double latDelta = safeRadius / 69.0;
        double lngDelta = safeRadius / (Math.cos(Math.toRadians(lat)) * 69.0);

        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLng = lng - lngDelta;
        double maxLng = lng + lngDelta;

        return events.findNear(lat, lng, safeRadius, minLat, maxLat, minLng, maxLng)
                .stream()
                .map(EventMapper::toDto)
                .toList();
    }

    private Event requireEvent(Long id) {
        return events.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    private User requireUser(Long id) {
        return users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void ensureCanModify(Event e, User current) {
        if (e.getOwner().getId().equals(current.getId())) return;
        if (isAdminOrMod(current)) return;
        throw new SecurityException("You can only modify your own events.");
    }

    private boolean isAdminOrMod(User u) {
        for (Role r : u.getRoles()) {
            String name = r.getName();
            if ("ROLE_ADMIN".equals(name) || "ROLE_MOD".equals(name)) return true;
        }
        return false;
    }

    public List<UpcomingEventsDto> upcoming(int limit) {
        var page = PageRequest.of(0, Math.max(1, Math.min(limit, 12))); // cap at 12
        Instant now = Instant.now();

        return events.findUpcoming(now, page)
                .stream()
                .map(e -> new UpcomingEventsDto(
                        e.getId(),
                        e.getTitle(),
                        e.getStart(),
                        e.getEnd(),
                        e.getType(),
                        buildLocation(e),
                        e.getFlyer()
                ))
                .toList();
    }

    private String buildLocation(Event e) {
        return Stream.of(e.getStreet(), e.getCity(), e.getState(), e.getZip())
                .filter(Objects::nonNull).map(String::trim)
                .filter(s -> !s.isEmpty()).collect(Collectors.joining(", "));
    }

    // ==========================
    // NEW: Geocoding helpers
    // ==========================

    private void geocodeIfPossible(Event e) {
        String address = buildLocation(e);
        if (address == null || address.isBlank()) return;

        // GoogleGeocodingService.geocodeAddress returns null if no key / no results
        var latLng = geocoding.geocodeAddress(address);
        if (latLng == null) return;

        e.setLatitude(latLng.lat());
        e.setLongitude(latLng.lng());
    }
}