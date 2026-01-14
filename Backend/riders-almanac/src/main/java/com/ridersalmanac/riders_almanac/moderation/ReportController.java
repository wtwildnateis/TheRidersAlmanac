package com.ridersalmanac.riders_almanac.moderation;

import com.ridersalmanac.riders_almanac.forum.ForumRepository;
import com.ridersalmanac.riders_almanac.forum.CommentRepository;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flags")
@RequiredArgsConstructor
public class ReportController {

    private final ModerationLogRepository modLogs;
    private final UserRepository users;
    private final ForumRepository posts;
    private final CommentRepository comments;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/posts/{id}")
    public void flagPost(@PathVariable Long id,
                         @AuthenticationPrincipal UserDetails principal,
                         @RequestParam(required = false) String reason) {
        // 404 if not found
        posts.findById(id).orElseThrow();
        var actor = users.findByUsername(principal.getUsername()).orElseThrow();
        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.POST)
                .targetId(id)
                .action(ModerationLog.Action.FLAG)
                .reason(reason)
                .build());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/comments/{id}")
    public void flagComment(@PathVariable Long id,
                            @AuthenticationPrincipal UserDetails principal,
                            @RequestParam(required = false) String reason) {
        comments.findById(id).orElseThrow();
        var actor = users.findByUsername(principal.getUsername()).orElseThrow();
        modLogs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(ModerationLog.TargetType.COMMENT)
                .targetId(id)
                .action(ModerationLog.Action.FLAG)
                .reason(reason)
                .build());
    }
}