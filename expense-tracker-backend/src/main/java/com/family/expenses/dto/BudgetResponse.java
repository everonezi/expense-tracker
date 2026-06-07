package com.family.expenses.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String categoryIcon,
        BigDecimal limitAmount,
        int month,
        int year
) {}
