package com.travelplanner.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityResponse {
    
    private Long id;
    private Long dayId;
    private String title;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private Double latitude;
    private Double longitude;
    private String notes;
    private String category;
    private Integer sortOrder;
    
    private List<OverlapWarningResponse> overlapWarnings;
}
