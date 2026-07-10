package com.travelplanner.packing.service;

import com.travelplanner.packing.dto.CustomItemRequest;
import com.travelplanner.packing.dto.GeneratePackingResponse;
import com.travelplanner.packing.dto.PackingItemResponse;
import com.travelplanner.packing.dto.PackingProgressResponse;

import java.util.List;

public interface PackingService {

    /**
     * Generates (or refreshes) a smart packing list for the trip by evaluating
     * all packing rules against the trip's weather data.
     * Already-checked items and custom items are never deleted on re-runs.
     */
    GeneratePackingResponse generatePackingList(Long tripId, String userEmail);

    /**
     * Returns all packing items for the trip, ordered by category.
     */
    List<PackingItemResponse> getPackingItems(Long tripId, String userEmail);

    /**
     * Toggles the checked/packed state of a single item.
     */
    PackingItemResponse togglePacked(Long itemId, String userEmail);

    /**
     * Adds a custom item to the trip's packing list.
     */
    PackingItemResponse addCustomItem(Long tripId, CustomItemRequest request, String userEmail);

    /**
     * Deletes a packing item.
     */
    void deleteItem(Long itemId, String userEmail);

    /**
     * Returns packing progress statistics for the trip.
     */
    PackingProgressResponse getProgress(Long tripId, String userEmail);
}
