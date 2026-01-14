package com.ridersalmanac.riders_almanac.forum.dto;

import jakarta.validation.constraints.*;

public record CommentCreateRequest(
        @NotNull Long postId,
        Long parentId,
        @NotBlank String body
) {}
