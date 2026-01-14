package com.ridersalmanac.riders_almanac.users.dto;

import java.time.Instant;
import java.util.Set;

public record UserResponse(
        Long id,
        String username,
        String email,
        String displayName,
        String status,
        Set<String> roles,
        Instant createdAt,
        Instant updatedAt
) {}