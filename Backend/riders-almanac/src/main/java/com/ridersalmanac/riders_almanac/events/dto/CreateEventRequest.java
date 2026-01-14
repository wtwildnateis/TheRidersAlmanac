package com.ridersalmanac.riders_almanac.events.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateEventRequest(

        @NotBlank
        String title,

        String type,

        String flyer,

        @NotNull
        Instant start,

        @NotNull
        Instant end,

        String street,
        String city,
        String state,
        String zip,

        String description
) {}