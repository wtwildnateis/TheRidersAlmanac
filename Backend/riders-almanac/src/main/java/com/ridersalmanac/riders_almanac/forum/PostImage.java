package com.ridersalmanac.riders_almanac.forum;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="forum_post_images", indexes = @Index(name="idx_forum_post_images_post", columnList="post_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="post_id", nullable=false)
    private Post post;

    @Column(nullable=false, length=500)
    private String url;

    // Cloudinary metadata for cloudinary implementation
    @Column(length=180) private String publicId;
    private Integer width;
    private Integer height;
    private Integer sortOrder;
}