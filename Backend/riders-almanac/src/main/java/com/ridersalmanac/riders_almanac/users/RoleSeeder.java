package com.ridersalmanac.riders_almanac.users;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {
    private final RoleRepository roles;

    @Override
    public void run(String... args) {
        seed("ROLE_USER");
        seed("ROLE_MOD");
        seed("ROLE_ADMIN");
    }

    private void seed(String name) {
        if (!roles.existsByName(name)) {
            var r = new Role();
            r.setName(name);
            roles.save(r);
        }
    }
}