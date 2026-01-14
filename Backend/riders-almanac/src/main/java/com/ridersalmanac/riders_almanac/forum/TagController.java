package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.TagCreateRequest;
import com.ridersalmanac.riders_almanac.forum.dto.TagDto;
import com.ridersalmanac.riders_almanac.forum.dto.TagUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tags;
    private final ForumService forum;

    // SINGLE mapping for GET /api/forum/tags
    @GetMapping
    public List<TagDto> list(@RequestParam(name = "q", required = false) String q) {
        if (q != null && !q.isBlank()) {
            // search path
            return tags.search(q).stream()
                    .map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel()))
                    .toList();
        }
        // default: all enabled tags
        return tags.listEnabled().stream()
                .map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel()))
                .toList();
    }

    @GetMapping("/disabled")
    @PreAuthorize("hasAnyRole('ADMIN','MOD')")
    public List<TagDto> listDisabled() {
        return tags.listDisabled().stream()
                .map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel()))
                .toList();
    }

    @GetMapping("/top")
    public List<TagDto> top(@RequestParam(name = "limit", defaultValue = "5") int limit) {
        return forum.topTags(limit);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOD')")
    public TagDto create(@RequestBody TagCreateRequest req) {
        return tags.create(req);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MOD')")
    public TagDto update(@PathVariable Long id, @RequestBody TagUpdateRequest req) {
        return tags.update(id, req);
    }
}