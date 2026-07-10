package com.travelplanner.trip.repository;

import com.travelplanner.auth.entity.User;
import com.travelplanner.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUser(User user);
    Optional<Trip> findByIdAndUser(Long id, User user);
    List<Trip> findByStartDate(LocalDate startDate);
    List<Trip> findByEndDate(LocalDate endDate);
}
