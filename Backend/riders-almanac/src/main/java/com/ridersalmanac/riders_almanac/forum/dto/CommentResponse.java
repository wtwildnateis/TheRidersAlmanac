package com.ridersalmanac.riders_almanac.forum.dto;

import java.time.Instant;

public record CommentResponse(
        Long id,
        Long postId,
        Long parentId,
        Long authorId,
        String authorUsername,
        String body,
        Instant createdAt,
        Instant updatedAt
) {}
