package com.travelplanner.activity.service;

import com.travelplanner.activity.dto.ActivityReorderRequest;
import com.travelplanner.activity.dto.ActivityRequest;
import com.travelplanner.activity.dto.ActivityResponse;

import java.util.List;

public interface ActivityService {
    ActivityResponse createActivity(Long dayId, ActivityRequest request, String userEmail);
    ActivityResponse updateActivity(Long id, ActivityRequest request, String userEmail);
    void deleteActivity(Long id, String userEmail);
    ActivityResponse getActivityById(Long id, String userEmail);
    List<ActivityResponse> getActivitiesByDay(Long dayId, String userEmail);
    void reorderActivities(List<ActivityReorderRequest> requests, String userEmail);
}
