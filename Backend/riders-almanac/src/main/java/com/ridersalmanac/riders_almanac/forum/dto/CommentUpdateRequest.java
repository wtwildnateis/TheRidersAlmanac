package com.ridersalmanac.riders_almanac.forum.dto;

import jakarta.validation.constraints.*;

public record CommentUpdateRequest(
        @NotBlank String body
) {}
