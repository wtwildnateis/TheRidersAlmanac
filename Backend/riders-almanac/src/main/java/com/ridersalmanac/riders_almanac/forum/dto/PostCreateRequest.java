package com.ridersalmanac.riders_almanac.forum.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record PostCreateRequest(
        @NotBlank @Size(max=140) String title,
        @NotBlank String body,
        java.util.List<@jakarta.validation.constraints.Pattern(regexp = "^[a-z0-9-]+$") String> tags, // slugs
        List<@NotBlank String> imageUrls
) {}
