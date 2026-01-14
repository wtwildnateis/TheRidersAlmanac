package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.users.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name="forum_comments", indexes = {
        @Index(name="idx_forum_comments_post", columnList="post_id"),
        @Index(name="idx_forum_comments_created_at", columnList="created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="post_id", nullable=false)
    private Post post;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="author_id", nullable=false)
    private User author;

    @Lob @Column(nullable=false)
    private String body;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="parent_id")
    private Comment parent;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private Status status = Status.PUBLISHED;
    public enum Status { PUBLISHED, HIDDEN, DELETED }

    @Column(name="is_deleted", nullable=false)
    private boolean isDeleted = false;

    @CreationTimestamp @Column(name="created_at", updatable=false)
    private Instant createdAt;

    @UpdateTimestamp @Column(name="updated_at")
    private Instant updatedAt;
}