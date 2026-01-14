package com.ridersalmanac.riders_almanac.users.dto;

import com.ridersalmanac.riders_almanac.users.Role;
import com.ridersalmanac.riders_almanac.users.User;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

public record MeResponse(
        Long id,
        String username,
        String displayName,
        String email,
        Set<String> roles,
        Instant createdAt,
        Instant updatedAt
) {
    public static MeResponse from(User u) {
        Set<String> roleNames = u.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return new MeResponse(
                u.getId(),
                u.getUsername(),
                u.getDisplayName(),
                u.getEmail(),
                roleNames,
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}