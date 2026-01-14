package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.users.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "forum_posts", indexes = {
        @Index(name="idx_forum_posts_created_at", columnList = "created_at"),
        @Index(name="idx_forum_posts_status_deleted", columnList = "status,is_deleted")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="author_id", nullable=false)
    private User author;

    @Column(nullable=false, length=140)
    private String title;

    @Lob @Column(nullable=false)
    private String body;

    @ManyToMany
    @JoinTable(
            name = "post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_post_tags_post_tag",
                    columnNames = {"post_id","tag_id"}
            )
    )
    @BatchSize(size = 50)
    @Builder.Default
    private Set<Tag> tagEntities = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private Status status = Status.PUBLISHED;
    public enum Status { PUBLISHED, HIDDEN, DELETED }

    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> images = new ArrayList<>();

    @Builder.Default
    @Column(name="is_locked", nullable = false)
    private boolean isLocked = false;

    @Builder.Default
    @Column(name="is_deleted", nullable=false)
    private boolean isDeleted = false;

    @CreationTimestamp @Column(name="created_at", updatable=false)
    private Instant createdAt;

    @UpdateTimestamp @Column(name="updated_at")
    private Instant updatedAt;

    @Column(name="last_activity_at")
    private Instant lastActivityAt;
}