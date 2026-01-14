package com.ridersalmanac.riders_almanac.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailRequest(
        @NotBlank @Email String email,
        @NotBlank String currentPassword // confirm before change can be made
) {}