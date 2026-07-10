package com.travelplanner.geocoding.service;

import com.travelplanner.geocoding.dto.MapActivityResponse;

import java.util.List;

public interface MapService {
    List<MapActivityResponse> getTripActivitiesForMap(Long tripId, String userEmail);
}
