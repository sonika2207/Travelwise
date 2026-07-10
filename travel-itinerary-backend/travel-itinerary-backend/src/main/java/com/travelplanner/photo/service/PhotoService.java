package com.travelplanner.photo.service;

import com.travelplanner.trip.dto.TripResponse;

public interface PhotoService {
    
    /**
     * Fetches and updates the trip's cover photo.
     * Uses the Pexels API based on destination city and country.
     * Falls back to a default placeholder if the API fails or no image is found.
     *
     * @param tripId the ID of the trip
     * @param userEmail the email of the authenticated user
     * @return the updated TripResponse
     */
    TripResponse fetchTripCoverPhoto(Long tripId, String userEmail);
    
    /**
     * Internal method used during trip creation to fetch and set the photo immediately.
     * Overloaded method that does not require userEmail verification since it's called internally by TripService.
     *
     * @param tripId the ID of the trip
     */
    void fetchTripCoverPhotoInternal(Long tripId);
}
