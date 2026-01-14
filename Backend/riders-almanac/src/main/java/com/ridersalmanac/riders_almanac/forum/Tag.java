package com.ridersalmanac.riders_almanac.forum;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tags",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tags_slug", columnNames = "slug")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64) // an example would be like “group-ride”
    private String slug;

    @Column(nullable = false, length = 64) // and then the label would be “Group Ride”
    private String label;

    @Column(nullable = false)
    private boolean enabled; // mods can disable instead of delete
}