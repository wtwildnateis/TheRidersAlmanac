package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService service;
    private final UserRepository users;

// posts

    @GetMapping("/posts")
    public PageResponse<PostResponse> feed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) java.util.List<String> tags,
            @RequestParam(defaultValue = "OR") String match, // OR | AND
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = null;
        if (principal != null) {
            try {
                currentUserId = currentUserId(principal);
            } catch (Exception ignored) {
                // anonymous / lookup failed -> treat as no user
            }
        }

        return service.feed(page, size, tags, match, currentUserId);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = null;
        if (principal != null) {
            currentUserId = users.findByUsername(principal.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ResponseEntity.ok(service.getPost(id, currentUserId));
    }

    @PostMapping("/posts")
    public PostResponse create(
            @Valid @RequestBody PostCreateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long authorId = currentUserId(principal);
        return service.createPost(authorId, req);
    }

    @PutMapping("/posts/{id}")
    public PostResponse update(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        return service.updatePost(id, currentUserId, req);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        service.deletePost(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

// comments

    @PostMapping("/comments")
    public CommentResponse addComment(
            @Valid @RequestBody CommentCreateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long authorId = currentUserId(principal);
        return service.addComment(authorId, req);
    }

    @PutMapping("/comments/{id}")
    public CommentResponse updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentUpdateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        return service.updateComment(id, currentUserId, req);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        service.deleteComment(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts/{id}/comments")
    public PageResponse<CommentResponse> listComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.comments(id, page, size);
    }

// small helper

    private Long currentUserId(UserDetails principal) {
        return users.findByUsername(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
    }

    @GetMapping("/posts/trending")
    public PageResponse<PostResponse> trending(
            @RequestParam(defaultValue = "7d") String window,
            @RequestParam(defaultValue = "5") int limit
    ) {
        Duration win = parseWindow(window);              // e.g., "7d", "24h", "30m"
        return service.trending(limit, win);             // keep your original order if you like
    }

    // Simple "7d / 24h / 30m" parser
    private Duration parseWindow(String raw) {
        if (raw == null || raw.isBlank()) return Duration.ofDays(7);
        var m = java.util.regex.Pattern.compile("(?i)^(\\d+)\\s*([dhm])$").matcher(raw.trim());
        if (!m.find()) return Duration.ofDays(7);
        long n = Long.parseLong(m.group(1));
        return switch (m.group(2).toLowerCase()) {
            case "d" -> Duration.ofDays(n);
            case "h" -> Duration.ofHours(n);
            case "m" -> Duration.ofMinutes(n);
            default -> Duration.ofDays(7);
        };
    }
}