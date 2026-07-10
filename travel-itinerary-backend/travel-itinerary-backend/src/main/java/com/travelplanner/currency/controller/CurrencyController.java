package com.travelplanner.currency.controller;

import com.travelplanner.currency.dto.ExchangeRateResponse;
import com.travelplanner.currency.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/currency")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    /**
     * POST /api/trips/{tripId}/currency/refresh
     * Forces a fresh fetch from the exchange rate API (subject to 24-hour cache).
     */
    @PostMapping("/refresh")
    public ResponseEntity<ExchangeRateResponse> refreshExchangeRate(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(currencyService.refreshExchangeRate(tripId, userDetails.getUsername()));
    }

    /**
     * GET /api/trips/{tripId}/currency
     * Returns the latest cached exchange rate for this trip.
     */
    @GetMapping
    public ResponseEntity<ExchangeRateResponse> getExchangeRate(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(currencyService.getExchangeRate(tripId, userDetails.getUsername()));
    }
}
