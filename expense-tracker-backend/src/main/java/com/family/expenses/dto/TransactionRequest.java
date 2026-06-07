package com.family.expenses.dto;

import com.family.expenses.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotNull TransactionType type,
        @NotNull LocalDate date,
        @Size(max = 500) String description,
        @NotNull Long categoryId,
        @NotNull Long accountId
) {}
