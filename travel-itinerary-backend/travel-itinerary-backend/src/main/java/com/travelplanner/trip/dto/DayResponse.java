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
public class DayResponse {
    private Long id;
    private Integer dayNumber;
    private LocalDate tripDate;
}
