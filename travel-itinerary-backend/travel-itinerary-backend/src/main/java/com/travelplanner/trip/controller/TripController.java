package com.travelplanner.trip.controller;

import com.travelplanner.trip.dto.TripRequest;
import com.travelplanner.trip.dto.TripResponse;
import com.travelplanner.trip.dto.TripSummaryResponse;
import com.travelplanner.trip.service.TripService;
import com.travelplanner.photo.service.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final PhotoService photoService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.createTrip(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TripSummaryResponse>> getAllTrips(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TripSummaryResponse> responses = tripService.getAllTrips(userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.getTripById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.updateTrip(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        tripService.deleteTrip(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cover-photo")
    public ResponseEntity<TripResponse> fetchCoverPhoto(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = photoService.fetchTripCoverPhoto(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
