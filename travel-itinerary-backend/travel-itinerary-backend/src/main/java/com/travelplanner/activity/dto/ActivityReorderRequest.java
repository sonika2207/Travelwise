package com.travelplanner.activity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityReorderRequest {
    
    @NotNull(message = "Activity ID is required")
    private Long id;
    
    @NotNull(message = "Sort order is required")
    private Integer sortOrder;
}
