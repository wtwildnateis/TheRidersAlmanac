package com.ridersalmanac.riders_almanac.forum.dto;

import org.springframework.data.domain.Page;
import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long total
) {
    // Map a Spring Page<S> to PageResponse<T> using a mapper for items.
    public static <S, T> PageResponse<T> of(Page<S> page, Function<S, T> mapFn) {
        List<T> mapped = page.getContent().stream().map(mapFn).toList();
        return new PageResponse<>(
                mapped,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }

    // Optional convenience: no mapping needed (S == T)
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }
}