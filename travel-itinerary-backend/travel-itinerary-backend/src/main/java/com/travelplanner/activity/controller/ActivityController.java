package com.travelplanner.activity.controller;

import com.travelplanner.activity.dto.ActivityReorderRequest;
import com.travelplanner.activity.dto.ActivityRequest;
import com.travelplanner.activity.dto.ActivityResponse;
import com.travelplanner.activity.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping("/days/{dayId}/activities")
    public ResponseEntity<ActivityResponse> createActivity(
            @PathVariable Long dayId,
            @Valid @RequestBody ActivityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ActivityResponse response = activityService.createActivity(dayId, request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/days/{dayId}/activities")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByDay(
            @PathVariable Long dayId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ActivityResponse> responses = activityService.getActivitiesByDay(dayId, userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ActivityResponse response = activityService.getActivityById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/activities/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ActivityResponse response = activityService.updateActivity(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/activities/{id}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        activityService.deleteActivity(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/activities/reorder")
    public ResponseEntity<Void> reorderActivities(
            @Valid @RequestBody List<ActivityReorderRequest> requests,
            @AuthenticationPrincipal UserDetails userDetails) {
        activityService.reorderActivities(requests, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
