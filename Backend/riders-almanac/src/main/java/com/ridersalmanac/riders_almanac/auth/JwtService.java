package com.ridersalmanac.riders_almanac.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private final Key key;
    private final long ttlMs;

    public JwtService(
            @Value("${JWT_SECRET}") String secret,
            @Value("${JWT_TTL_MS:604800000}") long ttlMs // 7 days default
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.ttlMs = ttlMs;
    }

    public String generate(String username) {
        var now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + ttlMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String validateAndGetSubject(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
}