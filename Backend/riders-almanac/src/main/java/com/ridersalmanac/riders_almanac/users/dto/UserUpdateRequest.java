package com.ridersalmanac.riders_almanac.users.dto;

import jakarta.validation.constraints.Size;

//for updating displayname
public record UserUpdateRequest(
        @Size(min = 5, max = 100) String displayName
) {}