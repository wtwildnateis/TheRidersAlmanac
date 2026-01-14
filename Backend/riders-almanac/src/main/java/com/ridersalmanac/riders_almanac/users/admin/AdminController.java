package com.ridersalmanac.riders_almanac.users.admin;

import com.ridersalmanac.riders_almanac.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository users;
    private final RoleRepository roles;

    @GetMapping("/users/{id}/roles")
    public Set<Role> getUserRoles(@PathVariable Long id) {
        return users.findById(id).orElseThrow().getRoles();
    }

    @PostMapping("/users/{id}/roles/{roleName}")
    public Set<Role> grantRole(@PathVariable Long id, @PathVariable String roleName) {
        var u = users.findById(id).orElseThrow();
        var r = roles.findByName(roleName).orElseThrow(); // e.g. "ROLE_MOD"
        u.getRoles().add(r);
        users.save(u);
        return u.getRoles();
    }

    @DeleteMapping("/users/{id}/roles/{roleName}")
    public Set<Role> revokeRole(@PathVariable Long id, @PathVariable String roleName) {
        var u = users.findById(id).orElseThrow();
        u.getRoles().removeIf(rr -> rr.getName().equals(roleName));
        users.save(u);
        return u.getRoles();
    }
}