package com.travelplanner.currency.service;

import com.travelplanner.currency.dto.ExchangeRateResponse;

import java.math.BigDecimal;

public interface CurrencyService {

    /**
     * Fetches a fresh exchange rate from the API and stores it.
     * If the API is unavailable, falls back to the last cached rate.
     *
     * @param tripId  owner's trip ID
     * @param userEmail authenticated user's email (for ownership check)
     * @return the stored/cached exchange rate record
     */
    ExchangeRateResponse refreshExchangeRate(Long tripId, String userEmail);

    /**
     * Returns the latest cached exchange rate for the trip.
     *
     * @param tripId    owner's trip ID
     * @param userEmail authenticated user's email (for ownership check)
     * @return the latest exchange rate record
     */
    ExchangeRateResponse getExchangeRate(Long tripId, String userEmail);

    /**
     * Converts an amount from the trip's home currency to destination currency.
     *
     * @param amount    amount in home currency
     * @param tripId    owner's trip ID
     * @param userEmail authenticated user's email (for ownership check)
     * @return converted amount in destination currency
     */
    BigDecimal convertAmount(BigDecimal amount, Long tripId, String userEmail);
}
