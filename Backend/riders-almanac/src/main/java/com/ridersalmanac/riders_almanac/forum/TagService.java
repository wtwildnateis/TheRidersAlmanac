package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;


import java.text.Normalizer;
import java.util.List;

@Service @RequiredArgsConstructor
public class TagService {
    private final TagRepository repo;
    private final ForumRepository forumRepo;


    public List<Tag> listEnabled() {
        return repo.findByEnabledTrueOrderByLabelAsc();
    }

    public List<Tag> search(String q) {
        return repo.search(q == null ? "" : q.trim());
    }

    public List<Tag> listDisabled() {
        return repo.findByEnabledFalseOrderByLabelAsc();
    }

    @Transactional
    public TagDto create(TagCreateRequest req) {
        var slug = (req.slug() == null || req.slug().isBlank())
                ? toSlug(req.label())
                : toSlug(req.slug());
        if (repo.findBySlugIgnoreCase(slug).isPresent())
            throw new IllegalArgumentException("Tag already exists: " + slug);

        var t = repo.save(Tag.builder()
                .slug(slug)
                .label(req.label().trim())
                .enabled(true)
                .build());
        return new TagDto(t.getId(), t.getSlug(), t.getLabel());
    }

    @Transactional
    public TagDto update(Long id, TagUpdateRequest req) {
        var t = repo.findById(id).orElseThrow();
        if (req.label() != null && !req.label().isBlank()) t.setLabel(req.label().trim());
        if (req.enabled() != null) t.setEnabled(req.enabled());
        return new TagDto(t.getId(), t.getSlug(), t.getLabel());
    }

    private String toSlug(String s) {
        var base = Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return base.isBlank() ? "tag" : base;
    }


    public List<TagDto> topTags(int limit) {
        int size = Math.max(1, Math.min(limit, 20)); // clamp 1-20
        var page = PageRequest.of(0, size);
        return forumRepo.findTopTags(page).stream()
                .map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel()))
                .toList();
    }
}