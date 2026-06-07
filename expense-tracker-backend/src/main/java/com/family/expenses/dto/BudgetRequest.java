package com.family.expenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull Long categoryId,
        @NotNull @DecimalMin("0.01") BigDecimal limitAmount,
        @NotNull @Min(1) @Max(12) Integer month,
        @NotNull @Min(2000) Integer year
) {}
