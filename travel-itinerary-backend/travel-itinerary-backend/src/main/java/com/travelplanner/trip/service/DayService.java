package com.travelplanner.trip.service;

import com.travelplanner.exception.ResourceNotFoundException;
import com.travelplanner.trip.dto.DayResponse;
import com.travelplanner.trip.entity.Day;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.DayRepository;
import com.travelplanner.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DayService {

    private final DayRepository dayRepository;
    private final TripRepository tripRepository;

    public List<DayResponse> getDaysForTrip(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (!trip.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("Unauthorized to access this trip's days");
        }

        List<Day> days = dayRepository.findByTripIdOrderByDayNumberAsc(tripId);
        
        return days.stream()
                .map(day -> DayResponse.builder()
                        .id(day.getId())
                        .dayNumber(day.getDayNumber())
                        .tripDate(day.getTripDate())
                        .build())
                .collect(Collectors.toList());
    }
}
