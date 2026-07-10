package com.travelplanner.weather.controller;

import com.travelplanner.weather.dto.WeatherResponse;
import com.travelplanner.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    /**
     * GET /api/trips/{tripId}/weather
     * Returns cached weather records for the trip.
     */
    @GetMapping("/{tripId}/weather")
    public ResponseEntity<List<WeatherResponse>> getWeather(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<WeatherResponse> data = weatherService.getWeatherForTrip(tripId, userDetails.getUsername());
        return ResponseEntity.ok(data);
    }

    /**
     * POST /api/trips/{tripId}/weather/refresh
     * Fetches fresh weather data from OpenWeatherMap and stores it.
     */
    @PostMapping("/{tripId}/weather/refresh")
    public ResponseEntity<List<WeatherResponse>> refreshWeather(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<WeatherResponse> data = weatherService.refreshWeatherForTrip(tripId, userDetails.getUsername());
        return ResponseEntity.ok(data);
    }
}
