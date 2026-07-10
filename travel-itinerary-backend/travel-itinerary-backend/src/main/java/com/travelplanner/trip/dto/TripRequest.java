package com.travelplanner.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripRequest {

    @NotBlank(message = "Trip name is required")
    private String tripName;

    @NotBlank(message = "Destination city is required")
    private String destinationCity;

    @NotBlank(message = "Destination country is required")
    private String destinationCountry;

    private String destinationCurrency;
    
    private String description;
    
    private Double budget;

    private String coverPhotoUrl;

    @NotBlank(message = "Trip type is required")
    private String tripType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}
