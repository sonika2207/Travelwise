package com.travelplanner.packing.repository;

import com.travelplanner.packing.entity.PackingItem;
import com.travelplanner.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackingItemRepository extends JpaRepository<PackingItem, Long> {

    List<PackingItem> findByTrip(Trip trip);

    List<PackingItem> findByTripOrderByCategory(Trip trip);

    boolean existsByTripAndItemNameAndCustomItemFalse(Trip trip, String itemName);
}
