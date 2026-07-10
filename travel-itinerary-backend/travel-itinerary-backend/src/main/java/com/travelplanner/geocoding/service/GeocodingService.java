package com.travelplanner.geocoding.service;

import com.travelplanner.geocoding.dto.GeocodingResult;

public interface GeocodingService {
    GeocodingResult geocode(String location);
}
