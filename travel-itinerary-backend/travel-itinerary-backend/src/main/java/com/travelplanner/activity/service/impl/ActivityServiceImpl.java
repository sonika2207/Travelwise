package com.travelplanner.activity.service.impl;

import com.travelplanner.activity.dto.ActivityReorderRequest;
import com.travelplanner.activity.dto.ActivityRequest;
import com.travelplanner.activity.dto.ActivityResponse;
import com.travelplanner.activity.dto.OverlapWarningResponse;
import com.travelplanner.activity.entity.Activity;
import com.travelplanner.activity.repository.ActivityRepository;
import com.travelplanner.activity.service.ActivityService;
import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.exception.ForbiddenException;
import com.travelplanner.exception.ResourceNotFoundException;
import com.travelplanner.geocoding.dto.GeocodingResult;
import com.travelplanner.geocoding.service.GeocodingService;
import com.travelplanner.trip.entity.Day;
import com.travelplanner.trip.repository.DayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final DayRepository dayRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;

    @Override
    @Transactional
    public ActivityResponse createActivity(Long dayId, ActivityRequest request, String userEmail) {
        validateTimes(request);
        User user = getUserByEmail(userEmail);
        Day day = getDayByIdAndVerifyOwnership(dayId, user);

        // Determine sort order
        List<Activity> existingActivities = activityRepository.findByDayOrderBySortOrderAsc(day);
        int nextSortOrder = existingActivities.isEmpty() ? 1 : 
                existingActivities.get(existingActivities.size() - 1).getSortOrder() + 1;

        Double latitude = request.getLatitude();
        Double longitude = request.getLongitude();
        
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            try {
                GeocodingResult result = geocodingService.geocode(request.getLocation());
                if (result != null) {
                    latitude = result.getLatitude();
                    longitude = result.getLongitude();
                }
            } catch (Exception e) {
                log.warn("Failed to geocode location: {} during activity creation. Error: {}", request.getLocation(), e.getMessage());
            }
        }

        Activity activity = Activity.builder()
                .day(day)
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .latitude(latitude)
                .longitude(longitude)
                .notes(request.getNotes())
                .category(request.getCategory())
                .sortOrder(nextSortOrder)
                .build();

        List<OverlapWarningResponse> warnings = detectOverlaps(activity, existingActivities);
        activity = activityRepository.save(activity);

        return mapToResponse(activity, warnings);
    }

    @Override
    @Transactional
    public ActivityResponse updateActivity(Long id, ActivityRequest request, String userEmail) {
        validateTimes(request);
        User user = getUserByEmail(userEmail);
        Activity activity = getActivityByIdAndVerifyOwnership(id, user);

        activity.setTitle(request.getTitle());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        
        Double latitude = request.getLatitude();
        Double longitude = request.getLongitude();
        
        if (request.getLocation() != null && !request.getLocation().equals(activity.getLocation())) {
             try {
                 GeocodingResult result = geocodingService.geocode(request.getLocation());
                 if (result != null) {
                     latitude = result.getLatitude();
                     longitude = result.getLongitude();
                 }
             } catch (Exception e) {
                 log.warn("Failed to geocode location: {} during activity update. Error: {}", request.getLocation(), e.getMessage());
             }
        }
        
        activity.setLocation(request.getLocation());
        activity.setLatitude(latitude);
        activity.setLongitude(longitude);
        activity.setNotes(request.getNotes());
        activity.setCategory(request.getCategory());

        final Long activityId = activity.getId();
        List<Activity> otherActivities = activityRepository.findByDay(activity.getDay()).stream()
                .filter(a -> !a.getId().equals(activityId))
                .collect(Collectors.toList());

        List<OverlapWarningResponse> warnings = detectOverlaps(activity, otherActivities);
        activity = activityRepository.save(activity);

        return mapToResponse(activity, warnings);
    }

    @Override
    @Transactional
    public void deleteActivity(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Activity activity = getActivityByIdAndVerifyOwnership(id, user);
        activityRepository.delete(activity);
    }

    @Override
    public ActivityResponse getActivityById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Activity activity = getActivityByIdAndVerifyOwnership(id, user);
        
        List<Activity> otherActivities = activityRepository.findByDay(activity.getDay()).stream()
                .filter(a -> !a.getId().equals(activity.getId()))
                .collect(Collectors.toList());
        List<OverlapWarningResponse> warnings = detectOverlaps(activity, otherActivities);
        
        return mapToResponse(activity, warnings);
    }

    @Override
    public List<ActivityResponse> getActivitiesByDay(Long dayId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Day day = getDayByIdAndVerifyOwnership(dayId, user);

        List<Activity> activities = activityRepository.findByDayOrderBySortOrderAsc(day);
        
        return activities.stream().map(activity -> {
            List<Activity> others = activities.stream()
                    .filter(a -> !a.getId().equals(activity.getId()))
                    .collect(Collectors.toList());
            return mapToResponse(activity, detectOverlaps(activity, others));
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reorderActivities(List<ActivityReorderRequest> requests, String userEmail) {
        if (requests == null || requests.isEmpty()) {
            return;
        }

        User user = getUserByEmail(userEmail);
        Map<Long, Integer> orderMap = requests.stream()
                .collect(Collectors.toMap(ActivityReorderRequest::getId, ActivityReorderRequest::getSortOrder));

        List<Activity> activities = activityRepository.findAllById(orderMap.keySet());

        for (Activity activity : activities) {
            if (!activity.getDay().getTrip().getUser().getId().equals(user.getId())) {
                throw new ForbiddenException("You are not allowed to modify activity ID: " + activity.getId());
            }
            activity.setSortOrder(orderMap.get(activity.getId()));
        }

        activityRepository.saveAll(activities);
    }

    private void validateTimes(ActivityRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Day getDayByIdAndVerifyOwnership(Long dayId, User user) {
        Day day = dayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found"));
        if (!day.getTrip().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to access this day");
        }
        return day;
    }

    private Activity getActivityByIdAndVerifyOwnership(Long id, User user) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found"));
        if (!activity.getDay().getTrip().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to access this activity");
        }
        return activity;
    }

    private List<OverlapWarningResponse> detectOverlaps(Activity target, List<Activity> others) {
        List<OverlapWarningResponse> warnings = new ArrayList<>();

        for (Activity other : others) {
            if (target.getStartTime().isBefore(other.getEndTime()) && 
                target.getEndTime().isAfter(other.getStartTime())) {
                
                long overlapMinutes = calculateOverlapMinutes(target, other);
                warnings.add(new OverlapWarningResponse(
                        String.format("%s overlaps with %s by %d minutes.", 
                                target.getTitle(), other.getTitle(), overlapMinutes)
                ));
            }
        }
        return warnings;
    }

    private long calculateOverlapMinutes(Activity a1, Activity a2) {
        var start = a1.getStartTime().isAfter(a2.getStartTime()) ? a1.getStartTime() : a2.getStartTime();
        var end = a1.getEndTime().isBefore(a2.getEndTime()) ? a1.getEndTime() : a2.getEndTime();
        return Duration.between(start, end).toMinutes();
    }

    private ActivityResponse mapToResponse(Activity activity, List<OverlapWarningResponse> warnings) {
        return ActivityResponse.builder()
                .id(activity.getId())
                .dayId(activity.getDay().getId())
                .title(activity.getTitle())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .location(activity.getLocation())
                .latitude(activity.getLatitude())
                .longitude(activity.getLongitude())
                .notes(activity.getNotes())
                .category(activity.getCategory())
                .sortOrder(activity.getSortOrder())
                .overlapWarnings(warnings)
                .build();
    }
}
