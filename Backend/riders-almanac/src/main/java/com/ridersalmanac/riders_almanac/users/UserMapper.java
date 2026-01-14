package com.ridersalmanac.riders_almanac.users;

import com.ridersalmanac.riders_almanac.users.dto.UserResponse;
import java.util.Set;

public class UserMapper {
    public static UserResponse toDto(User u, Set<String> roleNames) {
        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getDisplayName(),
                u.getStatus().name(),
                roleNames,
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}