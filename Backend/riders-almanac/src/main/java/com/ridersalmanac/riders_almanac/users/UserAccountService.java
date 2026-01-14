package com.ridersalmanac.riders_almanac.users;

import com.ridersalmanac.riders_almanac.users.dto.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.ridersalmanac.riders_almanac.auth.JwtService;
import com.ridersalmanac.riders_almanac.auth.dto.AuthResponse;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwt;

    private User requireByUsername(String username) {
        return users.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public MeResponse me(String username) {
        var u = requireByUsername(username);
        Set<String> roles = u.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return new MeResponse(
                u.getId(),
                u.getUsername(),
                u.getDisplayName(),
                u.getEmail(),
                roles,
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }

    @Transactional
    public MeResponse updateProfile(String username, UserUpdateRequest req) {
        var u = requireByUsername(username);
        if (req.displayName() != null) u.setDisplayName(req.displayName());
        return me(username);
    }

    @Transactional
    public AuthResponse changeUsername(String username, ChangeUsernameRequest req) {
        var u = requireByUsername(username);

        var newUsername = req.username().trim().toLowerCase();

        if (!newUsername.equals(u.getUsername()) && users.existsByUsername(newUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }

        u.setUsername(newUsername);

        // generate fresh token using the new username
        var token = jwt.generate(newUsername);

        // build updated MeResponse for this user
        var me = me(newUsername);

        return new AuthResponse(token, me);
    }

    @Transactional
    public MeResponse changeEmail(String username, ChangeEmailRequest req) {
        var u = requireByUsername(username);
        if (!passwordEncoder.matches(req.currentPassword(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current password is incorrect");
        }
        var newEmail = req.email().trim().toLowerCase();
        if (!newEmail.equals(u.getEmail()) && users.existsByEmail(newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        u.setEmail(newEmail);
        return me(username);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest req) {
        var u = requireByUsername(username);
        if (!passwordEncoder.matches(req.currentPassword(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current password is incorrect");
        }
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
    }
}