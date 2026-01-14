package com.ridersalmanac.riders_almanac.forum.dto;

import com.ridersalmanac.riders_almanac.forum.Post;
import com.ridersalmanac.riders_almanac.forum.PostImage;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public record PostResponse(
        Long id,
        String title,
        String body,
        List<TagDto> tags,
        Long authorId,
        String authorUsername,
        List<String> images,
        boolean locked,
        boolean hidden,
        Instant createdAt,
        Instant updatedAt,
        Instant lastActivityAt,
        Double score // nullable; only set for trending
) {
    public static PostResponse from(Post p) {
        var imgs = p.getImages() == null ? List.<String>of()
                : p.getImages().stream()
                .sorted((a, b) -> Integer.compare(
                        a.getSortOrder() == null ? 0 : a.getSortOrder(),
                        b.getSortOrder() == null ? 0 : b.getSortOrder()))
                .map(PostImage::getUrl)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        var tagDtos = p.getTagEntities() == null ? List.<TagDto>of()
                : p.getTagEntities().stream()
                .map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel()))
                .collect(Collectors.toList());

        boolean hidden = p.getStatus() == Post.Status.HIDDEN;

        return new PostResponse(
                p.getId(), p.getTitle(), p.getBody(),
                tagDtos,
                p.getAuthor().getId(), p.getAuthor().getUsername(),
                imgs,
                p.isLocked(),
                hidden,
                p.getCreatedAt(), p.getUpdatedAt(), p.getLastActivityAt(),
                null
        );
    }

    public PostResponse withScore(Double s) {
        return new PostResponse(
                id, title, body, tags, authorId, authorUsername, images,
                locked, hidden, createdAt, updatedAt, lastActivityAt, s
        );
    }
}