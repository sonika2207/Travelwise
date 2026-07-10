package com.travelplanner.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateResponse {

    private Long id;
    private Long tripId;
    private String baseCurrency;
    private String targetCurrency;
    private BigDecimal exchangeRate;
    private LocalDateTime fetchedAt;
    private boolean sameCurrency;
    private String message;
}
