package com.travelplanner.packing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratePackingResponse {

    private int newItemsAdded;
    private int totalItems;
    private List<PackingItemResponse> items;
    private String message;
}
