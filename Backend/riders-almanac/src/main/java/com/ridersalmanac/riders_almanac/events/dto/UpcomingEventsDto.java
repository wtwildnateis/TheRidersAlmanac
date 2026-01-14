package com.ridersalmanac.riders_almanac.events.dto;

import java.time.Instant;

public record UpcomingEventsDto(
        Long id,
        String title,
        Instant start,
        Instant end,
        String type,
        String location,   // e.g., "123 Main St, City, ST 00000"
        String flyer
) {}