package com.travelplanner.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripSummaryResponse {
    
    private Long id;
    private String tripName;
    private String destinationCity;
    private String destinationCountry;
    private String destinationCurrency;
    private String coverPhotoUrl;
    private String photoAttribution;
    private String tripType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long tripDuration;
    private String tripStatus;
}
