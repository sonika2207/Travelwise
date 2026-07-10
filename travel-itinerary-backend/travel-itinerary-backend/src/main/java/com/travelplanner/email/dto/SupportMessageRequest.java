package com.travelplanner.email.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportMessageRequest {
    @NotBlank(message = "Message is required")
    private String message;
}
