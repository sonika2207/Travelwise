package com.travelplanner.currency.repository;

import com.travelplanner.currency.entity.ExchangeRate;
import com.travelplanner.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {

    List<ExchangeRate> findByTrip(Trip trip);

    @Query("""
            SELECT e FROM ExchangeRate e
            WHERE e.trip = :trip
              AND e.baseCurrency = :baseCurrency
              AND e.targetCurrency = :targetCurrency
            ORDER BY e.fetchedAt DESC
            LIMIT 1
            """)
    Optional<ExchangeRate> findLatestByTripAndBaseCurrencyAndTargetCurrency(
            @Param("trip") Trip trip,
            @Param("baseCurrency") String baseCurrency,
            @Param("targetCurrency") String targetCurrency);

    @Query("""
            SELECT e FROM ExchangeRate e
            WHERE e.baseCurrency = :baseCurrency
              AND e.targetCurrency = :targetCurrency
            ORDER BY e.fetchedAt DESC
            LIMIT 1
            """)
    Optional<ExchangeRate> findLatestByBaseCurrencyAndTargetCurrency(
            @Param("baseCurrency") String baseCurrency,
            @Param("targetCurrency") String targetCurrency);
}
