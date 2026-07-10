package com.travelplanner.packing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackingItemResponse {

    private Long id;
    private Long tripId;
    private String itemName;
    private String category;
    private boolean checked;
    private boolean customItem;
    private Long sourceRuleId;
    private LocalDateTime createdAt;
}
