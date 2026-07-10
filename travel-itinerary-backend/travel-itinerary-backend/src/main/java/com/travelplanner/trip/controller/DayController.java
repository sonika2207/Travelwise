package com.travelplanner.trip.controller;

import com.travelplanner.trip.dto.DayResponse;
import com.travelplanner.trip.service.DayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/days")
@RequiredArgsConstructor
public class DayController {

    private final DayService dayService;

    @GetMapping
    public ResponseEntity<List<DayResponse>> getDaysForTrip(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<DayResponse> responses = dayService.getDaysForTrip(tripId, userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }
}
