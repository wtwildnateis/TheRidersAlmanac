package com.ridersalmanac.riders_almanac.events.dto;

import java.time.Instant;

public record EventResponse(
        Long id,
        Long ownerId,

        String title,
        String type,
        String flyer,

        Instant start,
        Instant end,

        String street,
        String city,
        String state,
        String zip,

        String description,
        String status
) {}