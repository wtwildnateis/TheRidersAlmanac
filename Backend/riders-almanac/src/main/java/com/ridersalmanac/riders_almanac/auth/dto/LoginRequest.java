package com.ridersalmanac.riders_almanac.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String login,   // or rename to usernameOrEmail if you support either
        @NotBlank String password
) {}