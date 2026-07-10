package com.travelplanner.expense.controller;

import com.travelplanner.expense.dto.ExpenseRequest;
import com.travelplanner.expense.dto.ExpenseResponse;
import com.travelplanner.expense.dto.ExpenseSummaryResponse;
import com.travelplanner.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/trips/{tripId}/expenses")
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.addExpense(tripId, request, userDetails.getUsername()));
    }

    @GetMapping("/trips/{tripId}/expenses")
    public ResponseEntity<List<ExpenseResponse>> getTripExpenses(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expenseService.getTripExpenses(tripId, userDetails.getUsername()));
    }

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpense(
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expenseService.getExpense(expenseId, userDetails.getUsername()));
    }

    @PutMapping("/expenses/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expenseService.updateExpense(expenseId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        expenseService.deleteExpense(expenseId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trips/{tripId}/expenses/summary")
    public ResponseEntity<ExpenseSummaryResponse> getExpenseSummary(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expenseService.getExpenseSummary(tripId, userDetails.getUsername()));
    }
}
