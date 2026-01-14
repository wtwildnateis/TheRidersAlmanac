package com.ridersalmanac.riders_almanac.users;

import com.ridersalmanac.riders_almanac.users.dto.UserRequest;
import com.ridersalmanac.riders_almanac.users.dto.UserResponse;
import com.ridersalmanac.riders_almanac.users.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @PostMapping
    public UserResponse register(@Valid @RequestBody UserRequest req) {
        return service.register(req);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/by-username/{username}")
    public UserResponse getByUsername(@PathVariable String username) {
        return service.getByUsername(username);
    }

    @PatchMapping("/{id}")
    public UserResponse updateDisplayName(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest req) {
        return service.updateDisplayName(id, req);
    }

    // Add a role to a user (for admin)
    @PostMapping("/{id}/roles/{roleName}")
    public void addRole(@PathVariable Long id, @PathVariable String roleName) {
        service.addRole(id, roleName);
    }
}