package com.travelplanner.expense.service.impl;

import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.currency.entity.ExchangeRate;
import com.travelplanner.currency.repository.ExchangeRateRepository;
import com.travelplanner.email.repository.EmailLogRepository;
import com.travelplanner.email.service.EmailService;
import com.travelplanner.expense.dto.ExpenseRequest;
import com.travelplanner.expense.dto.ExpenseResponse;
import com.travelplanner.expense.dto.ExpenseSummaryResponse;
import com.travelplanner.expense.entity.Expense;
import com.travelplanner.expense.entity.ExpenseCategory;
import com.travelplanner.expense.repository.ExpenseRepository;
import com.travelplanner.expense.service.ExpenseService;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final EmailService emailService;
    private final EmailLogRepository emailLogRepository;

    @Override
    @Transactional
    public ExpenseResponse addExpense(Long tripId, ExpenseRequest request, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);

        Expense expense = Expense.builder()
                .trip(trip)
                .category(request.getCategory())
                .amount(request.getAmount())
                .note(request.getNote())
                .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now())
                .build();

        ExpenseResponse response = toResponse(expenseRepository.save(expense));

        // Check if a budget threshold has been crossed and send an alert if so
        checkAndSendBudgetAlert(trip);

        return response;
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long expenseId, ExpenseRequest request, String userEmail) {
        Expense expense = resolveExpense(expenseId, userEmail);

        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setNote(request.getNote());
        expense.setExpenseDate(request.getExpenseDate());

        return toResponse(expenseRepository.save(expense));
    }

    @Override
    @Transactional
    public void deleteExpense(Long expenseId, String userEmail) {
        Expense expense = resolveExpense(expenseId, userEmail);
        expenseRepository.delete(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(Long expenseId, String userEmail) {
        return toResponse(resolveExpense(expenseId, userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getTripExpenses(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        return expenseRepository.findByTripOrderByExpenseDate(trip)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseSummaryResponse getExpenseSummary(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        List<Expense> expenses = expenseRepository.findByTrip(trip);

        BigDecimal totalAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<ExpenseCategory, BigDecimal> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return ExpenseSummaryResponse.builder()
                .totalAmount(totalAmount)
                .expenseCount(expenses.size())
                .categoryTotals(categoryTotals)
                .build();
    }

    private Trip resolveTrip(Long tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Trip not found or access denied"));
    }

    private Expense resolveExpense(Long expenseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (!expense.getTrip().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return expense;
    }

    private ExpenseResponse toResponse(Expense expense) {
        Trip trip = expense.getTrip();
        String baseCurrency = resolveNullable(trip.getUser().getHomeCurrency());
        String destCurrency  = resolveNullable(trip.getDestinationCurrency());

        BigDecimal rate            = null;
        BigDecimal convertedAmount = null;

        if (baseCurrency != null && destCurrency != null
                && !baseCurrency.equalsIgnoreCase(destCurrency)) {
            Optional<ExchangeRate> latest = exchangeRateRepository
                    .findLatestByTripAndBaseCurrencyAndTargetCurrency(trip, baseCurrency, destCurrency);
            if (latest.isEmpty()) {
                latest = exchangeRateRepository
                        .findLatestByBaseCurrencyAndTargetCurrency(baseCurrency, destCurrency);
            }
            if (latest.isPresent()) {
                rate = latest.get().getExchangeRate();
                convertedAmount = expense.getAmount()
                        .multiply(rate)
                        .setScale(2, RoundingMode.HALF_UP);
            } else {
                log.debug("No cached exchange rate for {} â†’ {}. Skipping conversion for expense {}.",
                        baseCurrency, destCurrency, expense.getId());
            }
        } else if (baseCurrency != null && baseCurrency.equalsIgnoreCase(destCurrency)) {
            // Same currency â€“ conversion is 1:1
            rate = BigDecimal.ONE;
            convertedAmount = expense.getAmount();
        }

        return ExpenseResponse.builder()
                .id(expense.getId())
                .tripId(trip.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .convertedAmount(convertedAmount)
                .baseCurrency(baseCurrency)
                .destinationCurrency(destCurrency)
                .exchangeRate(rate)
                .note(expense.getNote())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .build();
    }

    private String resolveNullable(String value) {
        return (value != null && !value.isBlank()) ? value.toUpperCase() : null;
    }

    /**
     * Checks whether total spending has crossed a budget threshold (80% or 100%)
     * and sends an alert email if so â€” but only once per threshold crossing.
     */
    private void checkAndSendBudgetAlert(Trip trip) {
        if (trip.getBudget() == null || trip.getBudget() <= 0) return;

        List<Expense> allExpenses = expenseRepository.findByTrip(trip);
        BigDecimal totalSpent = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budget = BigDecimal.valueOf(trip.getBudget());
        BigDecimal percentBD = totalSpent
                .multiply(BigDecimal.valueOf(100))
                .divide(budget, 0, RoundingMode.HALF_UP);
        int percent = percentBD.intValue();

        // Check thresholds in descending order â€” send the highest applicable one
        LocalDateTime midnight = LocalDate.now().atStartOfDay();
        for (int threshold : new int[]{100, 80}) {
            if (percent >= threshold) {
                String emailType = "BUDGET_ALERT_" + threshold;
                boolean alreadySent = emailLogRepository.existsSuccessfulEmailSince(trip, emailType, midnight);
                if (!alreadySent) {
                    try {
                        emailService.sendBudgetAlertEmail(trip, threshold);
                        log.info("Sent budget alert ({}%) for trip {}", threshold, trip.getId());
                    } catch (Exception e) {
                        log.error("Failed to send budget alert for trip {}", trip.getId(), e);
                    }
                }
                break; // Only send one threshold email per expense add
            }
        }
    }
}

