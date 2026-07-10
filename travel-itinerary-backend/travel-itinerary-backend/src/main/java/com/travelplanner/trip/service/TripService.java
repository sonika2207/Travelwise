package com.travelplanner.trip.service;

import com.travelplanner.trip.dto.TripRequest;
import com.travelplanner.trip.dto.TripResponse;
import com.travelplanner.trip.dto.TripSummaryResponse;

import java.util.List;

public interface TripService {
    TripResponse createTrip(TripRequest request, String userEmail);
    TripResponse getTripById(Long id, String userEmail);
    List<TripSummaryResponse> getAllTrips(String userEmail);
    TripResponse updateTrip(Long id, TripRequest request, String userEmail);
    void deleteTrip(Long id, String userEmail);
}
