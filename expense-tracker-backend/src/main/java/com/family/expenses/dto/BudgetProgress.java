package com.family.expenses.dto;

import com.family.expenses.enums.BudgetStatus;

import java.math.BigDecimal;

public record BudgetProgress(
        Long budgetId,
        Long categoryId,
        String categoryName,
        String categoryIcon,
        BigDecimal limit,
        BigDecimal spent,
        BigDecimal available,
        int percentageUsed,
        BudgetStatus status
) {}
