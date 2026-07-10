package com.travelplanner.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripResponse {
    
    private Long id;
    private String tripName;
    private String destinationCity;
    private String destinationCountry;
    private String destinationCurrency;
    private String description;
    private Double budget;
    private String coverPhotoUrl;
    private String photoAttribution;
    private String tripType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long tripDuration;
    private String tripStatus;
    private LocalDateTime createdAt;
}
