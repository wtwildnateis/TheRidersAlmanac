package com.ridersalmanac.riders_almanac.auth.dto;

import com.ridersalmanac.riders_almanac.users.dto.MeResponse;

public record AuthResponse(String token, MeResponse user) {}