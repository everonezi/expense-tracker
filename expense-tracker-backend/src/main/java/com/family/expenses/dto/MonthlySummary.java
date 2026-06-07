package com.family.expenses.dto;

import java.math.BigDecimal;

public record MonthlySummary(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance,
        int month,
        int year
) {}
