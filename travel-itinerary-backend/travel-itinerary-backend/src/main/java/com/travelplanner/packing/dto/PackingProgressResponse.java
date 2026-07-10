package com.travelplanner.packing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackingProgressResponse {

    private int checkedItems;
    private int totalItems;
    private double percentage;
    private String summary;   // e.g. "12/18 packed"
}
