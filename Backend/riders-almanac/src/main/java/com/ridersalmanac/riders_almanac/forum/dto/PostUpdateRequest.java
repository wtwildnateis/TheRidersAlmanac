package com.ridersalmanac.riders_almanac.forum.dto;

import jakarta.validation.constraints.*;

public record PostUpdateRequest(
        @Size(max=140) String title,
        String body,
        java.util.List<@jakarta.validation.constraints.Pattern(regexp = "^[a-z0-9-]+$") String> tags,
        java.util.List<@NotBlank String> imageUrls,
        Boolean locked,
        Boolean hidden
) {}
