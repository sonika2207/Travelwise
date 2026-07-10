package com.travelplanner.weather.repository;

import com.travelplanner.weather.entity.WeatherData;
import com.travelplanner.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WeatherRepository extends JpaRepository<WeatherData, Long> {
    List<WeatherData> findByTrip(Trip trip);
    List<WeatherData> findByTripOrderByWeatherDate(Trip trip);
    void deleteByTrip(Trip trip);
}
