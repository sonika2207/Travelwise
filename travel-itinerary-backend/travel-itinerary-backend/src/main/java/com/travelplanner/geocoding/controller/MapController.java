package com.travelplanner.geocoding.controller;

import com.travelplanner.geocoding.dto.MapActivityResponse;
import com.travelplanner.geocoding.service.MapService;
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
@RequestMapping("/api/trips/{tripId}/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping
    public ResponseEntity<List<MapActivityResponse>> getTripActivitiesForMap(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<MapActivityResponse> mapActivities = mapService.getTripActivitiesForMap(tripId, userDetails.getUsername());
        return ResponseEntity.ok(mapActivities);
    }
}
