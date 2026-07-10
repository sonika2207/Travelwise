package com.travelplanner.weather.dto;

import com.travelplanner.weather.entity.DataType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    private Long id;
    private Long tripId;
    private LocalDate weatherDate;
    private DataType dataType;
    private Double avgTemp;
    private Double minTemp;
    private Double maxTemp;
    private Integer humidity;
    private Double rainChance;
    private String description;
    private String iconCode;
    private LocalDateTime fetchedAt;
}
