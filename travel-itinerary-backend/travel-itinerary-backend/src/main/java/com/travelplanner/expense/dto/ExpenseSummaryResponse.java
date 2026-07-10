package com.travelplanner.expense.dto;

import com.travelplanner.expense.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryResponse {

    private BigDecimal totalAmount;
    private int expenseCount;
    private Map<ExpenseCategory, BigDecimal> categoryTotals;
}
