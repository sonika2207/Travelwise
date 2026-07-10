package com.travelplanner.expense.dto;

import com.travelplanner.expense.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {

    private Long id;
    private Long tripId;
    private ExpenseCategory category;

    /** Amount in the user's home currency. */
    private BigDecimal amount;

    /** Amount converted to the trip's destination currency. Null if no rate is available. */
    private BigDecimal convertedAmount;

    /** ISO 4217 home currency code (e.g. "INR"). */
    private String baseCurrency;

    /** ISO 4217 destination currency code (e.g. "USD"). */
    private String destinationCurrency;

    /** Exchange rate used for conversion. Null if currencies are the same or no rate available. */
    private BigDecimal exchangeRate;

    private String note;
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
}
