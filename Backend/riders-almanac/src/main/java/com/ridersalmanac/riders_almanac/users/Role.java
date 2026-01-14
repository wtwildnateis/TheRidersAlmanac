package com.ridersalmanac.riders_almanac.users;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="roles", uniqueConstraints = { @UniqueConstraint(name = "uk_roles_name", columnNames = "name")})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Role {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=20)
    private String name; // "ROLE_USER", "ROLE_ADMIN", "ROLE_MOD"
}
