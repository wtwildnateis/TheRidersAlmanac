package com.ridersalmanac.riders_almanac.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, Long> {}