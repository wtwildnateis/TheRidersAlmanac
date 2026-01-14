package com.ridersalmanac.riders_almanac.moderation;

import com.ridersalmanac.riders_almanac.users.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "moderation_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ModerationLog {

    public enum TargetType { POST, COMMENT, EVENT, USER }
    public enum Action {
        DELETE, RESTORE, HIDE, FLAG, BAN,
        LOCK, UNLOCK
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User actor;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private TargetType targetType;

    @Column(nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Action action;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}