package com.ridersalmanac.riders_almanac.events.dto;

import com.ridersalmanac.riders_almanac.events.Event;

public class EventMapper {
    public static EventResponse toDto(Event e) {
        return new EventResponse(
                e.getId(),
                e.getOwner() != null ? e.getOwner().getId() : null,
                e.getTitle(),
                e.getType(),
                e.getFlyer(),
                e.getStart(),
                e.getEnd(),
                e.getStreet(),
                e.getCity(),
                e.getState(),
                e.getZip(),
                e.getDescription(),
                e.getStatus().name()
        );
    }
}