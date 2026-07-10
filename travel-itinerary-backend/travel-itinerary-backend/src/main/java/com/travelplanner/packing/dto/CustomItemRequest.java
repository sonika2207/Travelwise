package com.travelplanner.packing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomItemRequest {

    @NotBlank(message = "Item name must not be blank")
    private String itemName;

    @NotBlank(message = "Category must not be blank")
    private String category;
}
