package com.travelplanner.expense.service;

import com.travelplanner.expense.dto.ExpenseRequest;
import com.travelplanner.expense.dto.ExpenseResponse;
import com.travelplanner.expense.dto.ExpenseSummaryResponse;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse addExpense(Long tripId, ExpenseRequest request, String userEmail);

    ExpenseResponse updateExpense(Long expenseId, ExpenseRequest request, String userEmail);

    void deleteExpense(Long expenseId, String userEmail);

    ExpenseResponse getExpense(Long expenseId, String userEmail);

    List<ExpenseResponse> getTripExpenses(Long tripId, String userEmail);

    ExpenseSummaryResponse getExpenseSummary(Long tripId, String userEmail);
}
