package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import com.ridersalmanac.riders_almanac.moderation.ModerationLog;
import com.ridersalmanac.riders_almanac.moderation.ModerationService;
import com.ridersalmanac.riders_almanac.users.Role;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import com.ridersalmanac.riders_almanac.forum.dto.TagDto;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumRepository posts;
    private final CommentRepository comments;
    private final UserRepository users;
    private final ModerationService moderation;
    private final TagRepository tags;

    // posts

    private java.util.Set<Tag> resolveTags(java.util.List<String> slugs) {
        if (slugs == null || slugs.isEmpty()) return java.util.Set.of();
        var set = new java.util.HashSet<Tag>();
        for (var s : slugs) {
            if (s == null || s.isBlank()) continue;
            var tag = tags.findBySlugIgnoreCase(s.trim())
                    .filter(Tag::isEnabled)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown or disabled tag: " + s));
            set.add(tag);
        }
        return set;
    }

    @Transactional
    public PostResponse createPost(Long authorId, PostCreateRequest req) {
        User author = users.findById(authorId).orElseThrow();

        Post p = Post.builder()
                .author(author)
                .title(req.title())
                .body(req.body())
                .status(Post.Status.PUBLISHED)
                .isDeleted(false)
                .lastActivityAt(Instant.now())
                .build();

        if (req.imageUrls() != null) {
            for (int i = 0; i < req.imageUrls().size(); i++) {
                p.getImages().add(PostImage.builder()
                        .post(p)
                        .url(req.imageUrls().get(i))
                        .sortOrder(i)
                        .build());
            }
        }
        p.setTagEntities(resolveTags(req.tags()));
        p = posts.save(p);
        return toDto(p);
    }

    public PageResponse<PostResponse> feed(int page, int size,
                                           java.util.List<String> tagSlugs,
                                           String match,
                                           Long currentUserId) {
        var pageable = org.springframework.data.domain.PageRequest.of(
                Math.max(page, 0), Math.min(size, 50),
                org.springframework.data.domain.Sort.by("lastActivityAt").descending()
                        .and(org.springframework.data.domain.Sort.by("createdAt").descending())
        );

        // Are we staff?
        boolean isStaff = false;
        if (currentUserId != null) {
            var u = users.findById(currentUserId).orElse(null);
            if (u != null) {
                isStaff = u.getRoles().stream()
                        .map(Role::getName)
                        .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
            }
        }

        org.springframework.data.domain.Page<Post> pageObj;
        if (tagSlugs == null || tagSlugs.isEmpty()) {
            pageObj = isStaff
                    ? posts.findFeedIncludingHidden(pageable)
                    : posts.findFeed(pageable);
        } else {
            var slugs = tagSlugs.stream()
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();

            pageObj = "AND".equalsIgnoreCase(match)
                    ? (isStaff
                    ? posts.findFeedByAllTagsIncludingHidden(slugs, slugs.size(), pageable)
                    : posts.findFeedByAllTags(slugs, slugs.size(), pageable))
                    : (isStaff
                    ? posts.findFeedByAnyTagIncludingHidden(slugs, pageable)
                    : posts.findFeedByAnyTag(slugs, pageable));
        }

        var items = pageObj.getContent().stream().map(this::toDto).toList();
        return new PageResponse<>(items, pageObj.getNumber(), pageObj.getSize(), pageObj.getTotalElements());
    }

    public PostResponse getPost(Long id, Long currentUserId) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();

        User current = currentUserId == null ? null : users.findById(currentUserId).orElse(null);

        boolean isStaff = current != null && current.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));

        boolean isAuthor = current != null && p.getAuthor().getId().equals(current.getId());

        if (p.getStatus() == Post.Status.HIDDEN && !isStaff && !isAuthor) {
            throw new jakarta.persistence.EntityNotFoundException("Post not found");
        }

        return toDto(p);
    }

    @Transactional
    public PostResponse updatePost(Long id, Long currentUserId, PostUpdateRequest req) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModifyPost(p, current);

        if (req.title() != null) p.setTitle(req.title());
        if (req.body() != null) p.setBody(req.body());
        if (req.tags() != null) {
            p.setTagEntities(resolveTags(req.tags()));
        }
        if (req.imageUrls() != null) {
            // wipe and re-add simple list; or implement smarter diffing if you prefer
            p.getImages().clear();
            for (int i = 0; i < req.imageUrls().size(); i++) {
                p.getImages().add(PostImage.builder()
                        .post(p)
                        .url(req.imageUrls().get(i))
                        .sortOrder(i)
                        .build());
            }
        }

    // Moderation-only fields: locked / hidden
    if (req.locked() != null || req.hidden() != null) {
        ensureStaff(current); // only admins / mods can do this

        if (req.locked() != null) {
            p.setLocked(req.locked());
        }

        if (req.hidden() != null) {
            if (req.hidden()) {
                p.setStatus(Post.Status.HIDDEN);
            } else if (!p.isDeleted()) {
                p.setStatus(Post.Status.PUBLISHED);
            }
        }
    }
        p.setLastActivityAt(Instant.now());
        return toDto(p);
    }

    @Transactional
    public void deletePost(Long id, Long currentUserId) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModifyPost(p, current);

        p.setDeleted(true);
        p.setStatus(Post.Status.DELETED);
    }

    // for comments

    @Transactional
    public CommentResponse addComment(Long authorId, CommentCreateRequest req) {
        User author = users.findById(authorId).orElseThrow();
        Post post = posts.findByIdAndIsDeletedFalse(req.postId()).orElseThrow();
        if (post.isLocked()) {
            throw new SecurityException("Post is locked by moderators");
        }

        Comment parent = null;
        if (req.parentId() != null) {
            parent = comments.findById(req.parentId()).orElseThrow();
            if (!parent.getPost().getId().equals(post.getId()))
                throw new IllegalArgumentException("Parent comment belongs to a different post");
        }

        Comment c = Comment.builder()
                .post(post)
                .author(author)
                .parent(parent)
                .body(req.body())
                .status(Comment.Status.PUBLISHED)
                .isDeleted(false)
                .build();

        c = comments.save(c);
        post.setLastActivityAt(Instant.now());
        return toDto(c);
    }

    @Transactional
    public CommentResponse updateComment(Long id, Long currentUserId, CommentUpdateRequest req) {
        Comment c = comments.findById(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModify(c.getAuthor(), current);

        c.setBody(req.body());
        return toDto(c);
    }

    @Transactional
    public void deleteComment(Long id, Long currentUserId) {
        Comment c = comments.findById(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModify(c.getAuthor(), current);

        c.setDeleted(true);
        c.setStatus(Comment.Status.DELETED);
    }

    public PageResponse<CommentResponse> comments(Long postId, int page, int size) {
        posts.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 50));
        var pageable = PageRequest.of(safePage, safeSize);
        var pageObj = comments.findPageForPost(postId, pageable);

        var items = pageObj.getContent().stream().map(this::toDto).toList();
        return new PageResponse<>(
                items,
                pageObj.getNumber(),
                pageObj.getSize(),
                pageObj.getTotalElements()
        );
    }

    // post rules & mapping

    private void ensureCanModify(User owner, User current) {
        if (owner.getId().equals(current.getId())) return;
        boolean isStaff = current.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Not allowed.");
    }

    private PostResponse toDto(Post p) {
        // Use the record factory so we don't have to manage the 12th 'score' field here.
        return PostResponse.from(p);
    }

    private CommentResponse toDto(Comment c) {
        return new CommentResponse(
                c.getId(),
                c.getPost().getId(),
                c.getParent() == null ? null : c.getParent().getId(),
                c.getAuthor().getId(),
                c.getAuthor().getUsername(),
                c.getBody(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    private void ensureCanModifyPost(Post post, User current) {
        boolean isStaff = current.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));

        // if locked, only staff can modify
        if (post.isLocked() && !isStaff) {
            throw new SecurityException("Post is locked by moderators");
        }
        // if not locked: owner or staff may modify
        if (!post.getAuthor().getId().equals(current.getId()) && !isStaff) {
            throw new SecurityException("Not allowed.");
        }
    }

    @Transactional
    public PostResponse lockPost(Long postId, Long moderatorId, String reason) {
        Post p = posts.findByIdAndIsDeletedFalse(postId).orElseThrow();
        if (p.isLocked()) throw new IllegalArgumentException("Post already locked");

        User mod = users.findById(moderatorId).orElseThrow();
        boolean isStaff = mod.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Moderator role required");

        p.setLocked(true);
        p.setLastActivityAt(Instant.now());
        moderation.log(
                mod,
                ModerationLog.TargetType.POST,
                p.getId(),
                ModerationLog.Action.LOCK,
                reason == null ? "Locked" : reason
        );
        return toDto(p);
    }

    @Transactional
    public PostResponse unlockPost(Long postId, Long moderatorId, String reason) {
        Post p = posts.findByIdAndIsDeletedFalse(postId).orElseThrow();
        if (!p.isLocked()) throw new IllegalArgumentException("Post is not locked");

        User mod = users.findById(moderatorId).orElseThrow();
        boolean isStaff = mod.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Moderator role required");

        p.setLocked(false);
        p.setLastActivityAt(Instant.now());
        moderation.log(
                mod,
                ModerationLog.TargetType.POST,
                p.getId(),
                ModerationLog.Action.UNLOCK,
                reason == null ? "Unlocked" : reason
        );
        return toDto(p);
    }

    @Transactional
    public PostResponse hidePost(Long postId, Long modId, String reason) {
        var p = posts.findByIdAndIsDeletedFalse(postId).orElseThrow();
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        p.setStatus(Post.Status.HIDDEN);
        p.setLastActivityAt(Instant.now());
        moderation.log(mod,
                ModerationLog.TargetType.POST, p.getId(),
                ModerationLog.Action.HIDE, reason == null ? "Hidden" : reason);
        return toDto(p);
    }

    @Transactional
    public PostResponse restorePost(Long postId, Long modId, String reason) {
        var p = posts.findById(postId).orElseThrow(); // allow from HIDDEN/DELETED
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        p.setDeleted(false);
        p.setStatus(Post.Status.PUBLISHED);
        p.setLastActivityAt(Instant.now());
        moderation.log(mod,
                ModerationLog.TargetType.POST, p.getId(),
                ModerationLog.Action.RESTORE, reason == null ? "Restored" : reason);
        return toDto(p);
    }

    @Transactional
    public void hideComment(Long commentId, Long modId, String reason) {
        var c = comments.findById(commentId).orElseThrow();
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        c.setStatus(Comment.Status.HIDDEN);
        c.setDeleted(false);
        moderation.log(mod,
                ModerationLog.TargetType.COMMENT, c.getId(),
                ModerationLog.Action.HIDE, reason == null ? "Hidden" : reason);
    }

    @Transactional
    public void restoreComment(Long commentId, Long modId, String reason) {
        var c = comments.findById(commentId).orElseThrow();
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        c.setStatus(Comment.Status.PUBLISHED);
        c.setDeleted(false);
        moderation.log(mod,
                ModerationLog.TargetType.COMMENT, c.getId(),
                ModerationLog.Action.RESTORE, reason == null ? "Restored" : reason);
    }

    private void ensureStaff(User u) {
        boolean isStaff = u.getRoles().stream().map(r -> r.getName())
                .anyMatch(n -> n.equals("ROLE_ADMIN") || n.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Moderator role required");
    }

    public PageResponse<PostResponse> trending(int limit, Duration window) {
        int pageSize = Math.max(1, Math.min(limit, 50));
        var pageable = PageRequest.of(0, pageSize);
        var since = Instant.now().minus(window);
        var page = posts.findTrending(since, pageable);
        return PageResponse.of(page, PostResponse::from); // see factory below
    }

    public List<TagDto> topTags(int limit) {
        // clamp limit between 1 and 20
        int size = Math.max(1, Math.min(limit, 20));
        var pageable = PageRequest.of(0, size);

        // NOTE: 'posts' is the ForumRepository field you already use for trending()
        return posts.findTopTags(pageable).stream()
                .map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel()))
                .toList();
    }

}