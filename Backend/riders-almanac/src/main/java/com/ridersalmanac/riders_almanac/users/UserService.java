package com.ridersalmanac.riders_almanac.users;

import com.ridersalmanac.riders_almanac.users.dto.UserRequest;
import com.ridersalmanac.riders_almanac.users.dto.UserResponse;
import com.ridersalmanac.riders_almanac.users.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public UserResponse register(UserRequest req) {
        if (users.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already in use");
        }
        if (users.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        var u = new User();
        u.setUsername(req.username().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setDisplayName(req.displayName());
        u.setStatus(User.Status.ACTIVE);

        var roleUser = roles.findByName("ROLE_USER")
                .orElseGet(() -> roles.save(newRole("ROLE_USER")));
        u.getRoles().add(roleUser);

        u = users.save(u);
        return toResponse(u);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        var u = users.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(u);
    }

    @Transactional(readOnly = true)
    public UserResponse getByUsername(String username) {
        var u = users.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(u);
    }

    @Transactional
    public UserResponse updateDisplayName(Long id, UserUpdateRequest req) {
        var u = users.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (req.displayName() != null) {
            u.setDisplayName(req.displayName());
        }
        return toResponse(u);
    }

    @Transactional
    public void addRole(Long userId, String roleName) {
        var u = users.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        var r = roles.findByName(roleName).orElseGet(() -> roles.save(newRole(roleName)));
        var hasRole = u.getRoles().stream().anyMatch(existing -> existing.getName().equals(r.getName()));
        if (!hasRole) {
            u.getRoles().add(r);
        }
    }

    private Role newRole(String name) {
        var r = new Role();
        r.setName(name);
        return r;
    }

    private UserResponse toResponse(User u) {
        Set<String> roleNames = u.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return UserMapper.toDto(u, roleNames);
    }
}