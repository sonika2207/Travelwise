package com.travelplanner.currency.service.impl;

import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.currency.client.ExchangeRateClient;
import com.travelplanner.currency.dto.ExchangeRateResponse;
import com.travelplanner.currency.entity.ExchangeRate;
import com.travelplanner.currency.repository.ExchangeRateRepository;
import com.travelplanner.currency.service.CurrencyService;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
public class CurrencyServiceImpl implements CurrencyService {

    private static final int CACHE_TTL_HOURS = 24;

    private final ExchangeRateRepository exchangeRateRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExchangeRateClient exchangeRateClient;

    public CurrencyServiceImpl(ExchangeRateRepository exchangeRateRepository,
                                TripRepository tripRepository,
                                UserRepository userRepository,
                                ExchangeRateClient exchangeRateClient) {
        this.exchangeRateRepository = exchangeRateRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.exchangeRateClient = exchangeRateClient;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public ExchangeRateResponse refreshExchangeRate(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        String baseCurrency = resolveHomeCurrency(trip);
        String targetCurrency = resolveDestinationCurrency(trip);

        if (isSameCurrency(baseCurrency, targetCurrency)) {
            return buildSameCurrencyResponse(trip, baseCurrency);
        }

        BigDecimal fetchedRate = exchangeRateClient.fetchRate(baseCurrency, targetCurrency);

        if (fetchedRate != null) {
            ExchangeRate saved = persistRate(trip, baseCurrency, targetCurrency, fetchedRate);
            log.info("Exchange rate refreshed: {} â†’ {} = {}", baseCurrency, targetCurrency, fetchedRate);
            return toResponse(saved, false, "Exchange rate refreshed successfully");
        }

        // API failed â€“ fall back to last cached rate
        log.warn("API call failed. Falling back to cached rate for {} â†’ {}", baseCurrency, targetCurrency);
        return getCachedOrThrow(trip, baseCurrency, targetCurrency,
                "Exchange rate API is unavailable and no cached rate exists");
    }

    @Override
    @Transactional(readOnly = true)
    public ExchangeRateResponse getExchangeRate(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        String baseCurrency = resolveHomeCurrency(trip);
        String targetCurrency = resolveDestinationCurrency(trip);

        if (isSameCurrency(baseCurrency, targetCurrency)) {
            return buildSameCurrencyResponse(trip, baseCurrency);
        }

        return getCachedOrThrow(trip, baseCurrency, targetCurrency,
                "No exchange rate found for this trip. Call /currency/refresh first.");
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal convertAmount(BigDecimal amount, Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        String baseCurrency = resolveHomeCurrency(trip);
        String targetCurrency = resolveDestinationCurrency(trip);

        if (isSameCurrency(baseCurrency, targetCurrency)) {
            return amount.setScale(2, RoundingMode.HALF_UP);
        }

        Optional<ExchangeRate> latest = exchangeRateRepository
                .findLatestByTripAndBaseCurrencyAndTargetCurrency(trip, baseCurrency, targetCurrency);

        if (latest.isEmpty()) {
            // Global fallback (any trip, same pair)
            latest = exchangeRateRepository
                    .findLatestByBaseCurrencyAndTargetCurrency(baseCurrency, targetCurrency);
        }

        ExchangeRate rate = latest.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No exchange rate available. Call /currency/refresh first."));

        return amount.multiply(rate.getExchangeRate()).setScale(2, RoundingMode.HALF_UP);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private ExchangeRateResponse getCachedOrThrow(Trip trip,
                                                   String baseCurrency,
                                                   String targetCurrency,
                                                   String errorMessage) {
        Optional<ExchangeRate> cached = exchangeRateRepository
                .findLatestByTripAndBaseCurrencyAndTargetCurrency(trip, baseCurrency, targetCurrency);

        if (cached.isEmpty()) {
            cached = exchangeRateRepository
                    .findLatestByBaseCurrencyAndTargetCurrency(baseCurrency, targetCurrency);
        }

        return cached
                .map(er -> toResponse(er, false, "Cached rate (fetched at " + er.getFetchedAt() + ")"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, errorMessage));
    }

    private ExchangeRate persistRate(Trip trip,
                                     String baseCurrency,
                                     String targetCurrency,
                                     BigDecimal rate) {
        ExchangeRate entity = ExchangeRate.builder()
                .trip(trip)
                .baseCurrency(baseCurrency.toUpperCase())
                .targetCurrency(targetCurrency.toUpperCase())
                .exchangeRate(rate)
                .fetchedAt(LocalDateTime.now())
                .build();
        return exchangeRateRepository.save(entity);
    }

    private boolean isFresh(ExchangeRate rate) {
        return rate.getFetchedAt().isAfter(LocalDateTime.now().minusHours(CACHE_TTL_HOURS));
    }

    private boolean isSameCurrency(String base, String target) {
        return base.equalsIgnoreCase(target);
    }

    private String resolveHomeCurrency(Trip trip) {
        String currency = trip.getUser().getHomeCurrency();
        if (currency == null || currency.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "User's home currency is not configured. Please update your profile.");
        }
        return currency.toUpperCase();
    }

    private String resolveDestinationCurrency(Trip trip) {
        String currency = trip.getDestinationCurrency();
        if (currency == null || currency.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Trip destination currency is not configured. Please update the trip.");
        }
        return currency.toUpperCase();
    }

    private Trip resolveTrip(Long tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Trip not found or access denied"));
    }

    private ExchangeRateResponse buildSameCurrencyResponse(Trip trip, String currency) {
        return ExchangeRateResponse.builder()
                .tripId(trip.getId())
                .baseCurrency(currency)
                .targetCurrency(currency)
                .exchangeRate(BigDecimal.ONE)
                .fetchedAt(LocalDateTime.now())
                .sameCurrency(true)
                .message("Home currency and destination currency are the same (" + currency + "). Rate = 1.")
                .build();
    }

    private ExchangeRateResponse toResponse(ExchangeRate entity, boolean sameCurrency, String message) {
        return ExchangeRateResponse.builder()
                .id(entity.getId())
                .tripId(entity.getTrip().getId())
                .baseCurrency(entity.getBaseCurrency())
                .targetCurrency(entity.getTargetCurrency())
                .exchangeRate(entity.getExchangeRate())
                .fetchedAt(entity.getFetchedAt())
                .sameCurrency(sameCurrency)
                .message(message)
                .build();
    }
}
