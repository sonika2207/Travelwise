package com.travelplanner.geocoding.service.impl;

import com.travelplanner.activity.entity.Activity;
import com.travelplanner.activity.repository.ActivityRepository;
import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.exception.ForbiddenException;
import com.travelplanner.exception.ResourceNotFoundException;
import com.travelplanner.geocoding.dto.MapActivityResponse;
import com.travelplanner.geocoding.service.MapService;
import com.travelplanner.trip.entity.Day;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapServiceImpl implements MapService {

    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Override
    public List<MapActivityResponse> getTripActivitiesForMap(Long tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
                
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to access this trip");
        }
        
        List<MapActivityResponse> responses = new ArrayList<>();
        
        if (trip.getDays() != null) {
            for (Day day : trip.getDays()) {
                List<Activity> activities = activityRepository.findByDayOrderBySortOrderAsc(day);
                for (Activity activity : activities) {
                    if (activity.getLatitude() != null && activity.getLongitude() != null) {
                        responses.add(MapActivityResponse.builder()
                                .activityId(activity.getId())
                                .title(activity.getTitle())
                                .location(activity.getLocation())
                                .latitude(activity.getLatitude())
                                .longitude(activity.getLongitude())
                                .startTime(activity.getStartTime())
                                .endTime(activity.getEndTime())
                                .category(activity.getCategory())
                                .dayId(day.getId())
                                .dayNumber(day.getDayNumber())
                                .tripDate(day.getTripDate())
                                .build());
                    }
                }
            }
        }
        
        return responses;
    }
}
