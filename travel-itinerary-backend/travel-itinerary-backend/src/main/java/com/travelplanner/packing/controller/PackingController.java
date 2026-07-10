package com.travelplanner.packing.controller;

import com.travelplanner.packing.dto.CustomItemRequest;
import com.travelplanner.packing.dto.GeneratePackingResponse;
import com.travelplanner.packing.dto.PackingItemResponse;
import com.travelplanner.packing.dto.PackingProgressResponse;
import com.travelplanner.packing.service.PackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PackingController {

    private final PackingService packingService;

    // ------------------------------------------------------------------ //
    //  POST /api/trips/{tripId}/packing/generate
    // ------------------------------------------------------------------ //
    @PostMapping("/api/trips/{tripId}/packing/generate")
    public ResponseEntity<GeneratePackingResponse> generate(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                packingService.generatePackingList(tripId, userDetails.getUsername()));
    }

    // ------------------------------------------------------------------ //
    //  GET /api/trips/{tripId}/packing
    // ------------------------------------------------------------------ //
    @GetMapping("/api/trips/{tripId}/packing")
    public ResponseEntity<List<PackingItemResponse>> getItems(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                packingService.getPackingItems(tripId, userDetails.getUsername()));
    }

    // ------------------------------------------------------------------ //
    //  PUT /api/packing/{itemId}/toggle
    // ------------------------------------------------------------------ //
    @PutMapping("/api/packing/{itemId}/toggle")
    public ResponseEntity<PackingItemResponse> toggle(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                packingService.togglePacked(itemId, userDetails.getUsername()));
    }

    // ------------------------------------------------------------------ //
    //  POST /api/trips/{tripId}/packing/custom
    // ------------------------------------------------------------------ //
    @PostMapping("/api/trips/{tripId}/packing/custom")
    public ResponseEntity<PackingItemResponse> addCustom(
            @PathVariable Long tripId,
            @Valid @RequestBody CustomItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                packingService.addCustomItem(tripId, request, userDetails.getUsername()));
    }

    // ------------------------------------------------------------------ //
    //  DELETE /api/packing/{itemId}
    // ------------------------------------------------------------------ //
    @DeleteMapping("/api/packing/{itemId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails) {

        packingService.deleteItem(itemId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------ //
    //  GET /api/trips/{tripId}/packing/progress
    // ------------------------------------------------------------------ //
    @GetMapping("/api/trips/{tripId}/packing/progress")
    public ResponseEntity<PackingProgressResponse> progress(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                packingService.getProgress(tripId, userDetails.getUsername()));
    }
}
