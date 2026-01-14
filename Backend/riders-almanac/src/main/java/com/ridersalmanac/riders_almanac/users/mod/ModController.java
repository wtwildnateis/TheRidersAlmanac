package com.ridersalmanac.riders_almanac.users.mod;

import com.ridersalmanac.riders_almanac.forum.ForumService;
import com.ridersalmanac.riders_almanac.forum.dto.PostResponse;
import com.ridersalmanac.riders_almanac.moderation.ModerationLog;
import com.ridersalmanac.riders_almanac.moderation.ModerationLogRepository;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import com.ridersalmanac.riders_almanac.events.EventRepository;
import com.ridersalmanac.riders_almanac.forum.ForumRepository;
import com.ridersalmanac.riders_almanac.forum.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.Instant;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mod")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MOD','ADMIN')")
public class ModController {

    private final ForumService forumService;
    private final UserRepository users;
    private final ModerationLogRepository modLogs;
    private final EventRepository events;
    private final ForumRepository posts;
    private final CommentRepository comments;


    @PatchMapping("/posts/{postId}/lock")
    public PostResponse lock(@PathVariable Long postId,
                             @RequestParam(required = false) String reason,
                             @AuthenticationPrincipal UserDetails principal) {
        Long modId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();
        return forumService.lockPost(postId, modId, reason);
    }

    @PatchMapping("/posts/{postId}/unlock")
    public PostResponse unlock(@PathVariable Long postId,
                               @RequestParam(required = false) String reason,
                               @AuthenticationPrincipal UserDetails principal) {
        Long modId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();
        return forumService.unlockPost(postId, modId, reason);
    }

    @PatchMapping("/posts/{postId}/hide")
    public PostResponse hidePost(@PathVariable Long postId,
                                 @RequestParam(required = false) String reason,
                                 @AuthenticationPrincipal UserDetails principal) {
        Long modId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();
        return forumService.hidePost(postId, modId, reason); // add in ForumService
    }

    @PatchMapping("/posts/{postId}/restore")
    public PostResponse restorePost(@PathVariable Long postId,
                                    @RequestParam(required = false) String reason,
                                    @AuthenticationPrincipal UserDetails principal) {
        Long modId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();
        return forumService.restorePost(postId, modId, reason); // add in ForumService
    }

    @PatchMapping("/comments/{commentId}/hide")
    public ResponseEntity<Void> hideComment(@PathVariable Long commentId,
                                            @RequestParam(required = false) String reason,
                                            @AuthenticationPrincipal UserDetails principal) {
        Long modId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();
        forumService.hideComment(commentId, modId, reason); // add in ForumService
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/comments/{commentId}/restore")
    public ResponseEntity<Void> restoreComment(@PathVariable Long commentId,
                                               @RequestParam(required = false) String reason,
                                               @AuthenticationPrincipal UserDetails principal) {
        Long modId = users.findByUsername(principal.getUsername())
                .orElseThrow().getId();
        forumService.restoreComment(commentId, modId, reason); // add in ForumService
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/ban")
    public void banUser(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails principal,
                        @RequestParam(required = false) String reason) {
        var actor = users.findByUsername(principal.getUsername()).orElseThrow();
        var target = users.findById(id).orElseThrow();

        // prevent self-ban
        if (actor.getId().equals(target.getId())) {
            throw new SecurityException("You cannot ban yourself.");
        }
        // mods cannot ban mods/admins; admins can ban anyone
        if (isMod(actor) && (isAdmin(target) || isMod(target))) {
            throw new SecurityException("Mods cannot ban other mods or admins.");
        }

        target.setStatus(User.Status.SUSPENDED);
        users.save(target);

        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.USER)
                .targetId(target.getId())
                .action(ModerationLog.Action.BAN)
                .reason(reason)
                .build());
        // return 204 No Content by default (void)
    }

    @PostMapping("/users/{id}/unban")
    public void unbanUser(@PathVariable Long id,
                          @AuthenticationPrincipal UserDetails principal,
                          @RequestParam(required = false) String reason) {
        var actor = users.findByUsername(principal.getUsername()).orElseThrow();
        var target = users.findById(id).orElseThrow();

        // prevent self-unban (if you want to force another staff to do it)
        if (actor.getId().equals(target.getId()) && isMod(actor) && !isAdmin(actor)) {
            throw new SecurityException("Mods cannot unban themselves.");
        }
        // mods cannot unban mods/admins; admins can unban anyone
        if (isMod(actor) && (isAdmin(target) || isMod(target))) {
            throw new SecurityException("Mods cannot unban other mods or admins.");
        }

        target.setStatus(User.Status.ACTIVE);
        users.save(target);

        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.USER)
                .targetId(target.getId())
                .action(ModerationLog.Action.RESTORE) // reuse RESTORE for unban
                .reason(reason != null ? reason : "unban")
                .build());
    }

    // --- helpers ---
    private boolean isAdmin(User u) {
        return u.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
    }
    private boolean isMod(User u) {
        return u.getRoles().stream().anyMatch(r -> "ROLE_MOD".equals(r.getName()));
    }

    // Hide an event (soft delete)
    @PatchMapping("/events/{id}/hide")
    public void hideEvent(@PathVariable Long id,
                          @AuthenticationPrincipal UserDetails principal,
                          @RequestParam(required = false) String reason) {
        var e = events.findById(id).orElseThrow();
        var actor = users.findByUsername(principal.getUsername()).orElseThrow();

        e.setIsDeleted(true);
        e.setDeletedAt(Instant.now());
        e.setDeletedBy(actor);
        events.save(e);

        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.EVENT)
                .targetId(id)
                .action(ModerationLog.Action.HIDE)
                .reason(reason)
                .build());
    }

    // HARD delete a post (permanent)
    @DeleteMapping("/posts/{id}/hard")
    public void hardDeletePost(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails principal,
                               @RequestParam(required = false) String reason) {
        posts.findById(id).orElseThrow(); // 404 if not found
        posts.deleteById(id);

        var actor = users.findByUsername(principal.getUsername()).orElseThrow();
        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.POST)
                .targetId(id)
                .action(ModerationLog.Action.DELETE)
                .reason(reason != null ? reason : "hard-delete")
                .build());
    }

    // HARD delete a comment (permanent)
    @DeleteMapping("/comments/{id}/hard")
    public void hardDeleteComment(@PathVariable Long id,
                                  @AuthenticationPrincipal UserDetails principal,
                                  @RequestParam(required = false) String reason) {
        comments.findById(id).orElseThrow();
        comments.deleteById(id);

        var actor = users.findByUsername(principal.getUsername()).orElseThrow();
        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.COMMENT)
                .targetId(id)
                .action(ModerationLog.Action.DELETE)
                .reason(reason != null ? reason : "hard-delete")
                .build());
    }
}


