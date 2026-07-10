package com.travelplanner.activity.repository;

import com.travelplanner.activity.entity.Activity;
import com.travelplanner.trip.entity.Day;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByDay(Day day);
    List<Activity> findByDayOrderBySortOrderAsc(Day day);
}
