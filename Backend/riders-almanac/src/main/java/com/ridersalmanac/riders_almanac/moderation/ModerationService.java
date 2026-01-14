package com.ridersalmanac.riders_almanac.moderation;

import com.ridersalmanac.riders_almanac.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class ModerationService {
    private final ModerationLogRepository logs;

    public void log(User actor,
                    ModerationLog.TargetType type,
                    Long targetId,
                    ModerationLog.Action action,
                    String reason) {
        logs.save(ModerationLog.builder()
                .actor(actor)
                .targetType(type)
                .targetId(targetId)
                .action(action)
                .reason(reason)
                .build());
    }
}