package com.travelplanner.weather.service;

import com.travelplanner.weather.dto.WeatherResponse;

import java.util.List;

public interface WeatherService {

    /**
     * Returns the cached weather data for the given trip.
     *
     * @param tripId the ID of the trip
     * @param userEmail email of the authenticated user (for ownership check)
     * @return list of weather data records ordered by date
     */
    List<WeatherResponse> getWeatherForTrip(Long tripId, String userEmail);

    /**
     * Fetches fresh weather data from the external API and stores it,
     * replacing any previously cached records for the trip.
     *
     * @param tripId the ID of the trip
     * @param userEmail email of the authenticated user (for ownership check)
     * @return the newly saved weather data records
     */
    List<WeatherResponse> refreshWeatherForTrip(Long tripId, String userEmail);
}
