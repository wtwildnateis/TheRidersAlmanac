package com.ridersalmanac.riders_almanac.config;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer json() {
        return b -> b.simpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
                .timeZone("UTC");
    }
}