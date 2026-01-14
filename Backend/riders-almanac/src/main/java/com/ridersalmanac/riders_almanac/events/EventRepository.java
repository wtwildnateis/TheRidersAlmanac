package com.ridersalmanac.riders_almanac.events;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
                select e from Event e
                where e.isDeleted = false
                  and (:status is null or e.status = :status)
                  and (:from  is null or e.start >= :from)
                  and (:to    is null or e.start <  :to)
                order by e.start asc
            """)
    List<Event> findWindow(
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("status") Event.Status status
    );

    Optional<Event> findByIdAndIsDeletedFalse(Long id);

    boolean existsByIdAndOwner_IdAndIsDeletedFalse(Long id, Long ownerId);

    @Query("""
              select e
              from Event e
              where e.isDeleted = false
                and e.status = com.ridersalmanac.riders_almanac.events.Event$Status.ACTIVE
                and coalesce(e.end, e.start) >= :now
              order by e.start asc
            """)
    Page<Event> findUpcoming(@Param("now") Instant now, Pageable pageable);

    @Query(value = """
            SELECT *
            FROM events e
            WHERE e.is_deleted = false
              AND e.status = 'ACTIVE'
              AND e.latitude IS NOT NULL
              AND e.longitude IS NOT NULL
              AND e.latitude BETWEEN :minLat AND :maxLat
              AND e.longitude BETWEEN :minLng AND :maxLng
              AND (
                3959 * ACOS(
                  COS(RADIANS(:lat)) * COS(RADIANS(e.latitude)) *
                  COS(RADIANS(e.longitude) - RADIANS(:lng)) +
                  SIN(RADIANS(:lat)) * SIN(RADIANS(e.latitude))
                )
              ) <= :radiusMiles
            ORDER BY e.start_time ASC
            """, nativeQuery = true)
    List<Event> findNear(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMiles") double radiusMiles,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng
    );

}