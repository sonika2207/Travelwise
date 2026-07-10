package com.travelplanner.photo.service.impl;

import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.exception.ForbiddenException;
import com.travelplanner.exception.ResourceNotFoundException;
import com.travelplanner.photo.client.PexelsPhotoClient;
import com.travelplanner.photo.client.PexelsResponse;
import com.travelplanner.photo.service.PhotoService;
import com.travelplanner.trip.dto.TripResponse;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoServiceImpl implements PhotoService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final PexelsPhotoClient pexelsClient;

    private static final String DEFAULT_PLACEHOLDER_URL = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop";

    @Override
    @Transactional
    public TripResponse fetchTripCoverPhoto(Long tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
                
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to fetch photo for this trip");
        }

        updateTripCoverPhoto(trip);

        return mapToTripResponse(trip);
    }

    @Override
    @Transactional
    public void fetchTripCoverPhotoInternal(Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip != null) {
            updateTripCoverPhoto(trip);
        }
    }

    private void updateTripCoverPhoto(Trip trip) {
        // Do NOT fetch image again if coverPhotoUrl already exists and is not the default
        if (trip.getCoverPhotoUrl() != null && !trip.getCoverPhotoUrl().isEmpty() && !trip.getCoverPhotoUrl().equals(DEFAULT_PLACEHOLDER_URL)) {
            log.info("Cover photo already exists for trip ID {}. Skipping fetch.", trip.getId());
            return;
        }

        String query = trip.getDestinationCity() + " " + trip.getDestinationCountry();
        PexelsResponse response = pexelsClient.searchPhoto(query);

        if (response != null && response.getPhotos() != null && !response.getPhotos().isEmpty()) {
            PexelsResponse.Photo photo = response.getPhotos().get(0);
            trip.setCoverPhotoUrl(photo.getSrc().getLarge2x());
            trip.setPhotoAttribution("Photo by " + photo.getPhotographer() + " on Pexels");
        } else {
            // Fallback to placeholder
            trip.setCoverPhotoUrl(DEFAULT_PLACEHOLDER_URL);
            trip.setPhotoAttribution("Default Placeholder");
        }

        tripRepository.save(trip);
    }

    private TripResponse mapToTripResponse(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .destinationCity(trip.getDestinationCity())
                .destinationCountry(trip.getDestinationCountry())
                .destinationCurrency(trip.getDestinationCurrency())
                .coverPhotoUrl(trip.getCoverPhotoUrl())
                // Assuming photoAttribution will be added to TripResponse
                .tripType(trip.getTripType())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .tripDuration(ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1)
                .tripStatus(calculateTripStatus(trip.getStartDate(), trip.getEndDate()))
                .createdAt(trip.getCreatedAt())
                .build();
    }
    
    private String calculateTripStatus(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(startDate)) {
            return "UPCOMING";
        } else if (today.isAfter(endDate)) {
            return "PAST";
        } else {
            return "ONGOING";
        }
    }
}
