package com.ridersalmanac.riders_almanac.auth;

import com.ridersalmanac.riders_almanac.auth.dto.*;
import com.ridersalmanac.riders_almanac.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.ridersalmanac.riders_almanac.users.dto.MeResponse;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository users;
    private final RoleRepository roles; // simple repo: findByName(String)
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;
    private final UserAccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        final var username = req.username().trim().toLowerCase();
        final var email    = req.email().trim().toLowerCase();

        if (users.existsByUsername(req.username())) throw new IllegalArgumentException("Username taken");
        if (users.existsByEmail(req.email())) throw new IllegalArgumentException("Email in use");

        var user = User.builder()
                .username(username)
                .email(email)
                .displayName(req.displayName())
                .passwordHash(encoder.encode(req.password()))
                .build();

        // assigns USER roles
        var userRole = roles.findByName("ROLE_USER").orElseGet(() -> roles.save(Role.builder().name("ROLE_USER").build()));
        user.getRoles().add(userRole);
        users.save(user);

        String token = jwt.generate(user.getUsername());
        MeResponse me = accountService.me(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, me));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        final var key = req.login().trim();

        // Resolve user by username OR email (case-insensitive)
        var user = users.findByUsernameIgnoreCase(key)
                .or(() -> users.findByEmailIgnoreCase(key))
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));

        // Delegate to Spring Security to check the password
        authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), req.password()));

        var token = jwt.generate(user.getUsername());
        var me = accountService.me(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, me));
    }


}