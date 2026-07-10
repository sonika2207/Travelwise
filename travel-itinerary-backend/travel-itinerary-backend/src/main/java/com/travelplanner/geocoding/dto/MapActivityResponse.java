package com.travelplanner.geocoding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MapActivityResponse {
    private Long activityId;
    private String title;
    private String location;
    private Double latitude;
    private Double longitude;
    private LocalTime startTime;
    private LocalTime endTime;
    private String category;
    private Long dayId;
    private Integer dayNumber;
    private LocalDate tripDate;
}
