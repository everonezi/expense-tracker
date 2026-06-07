package com.family.expenses.dto;

import com.family.expenses.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
        @NotBlank String name,
        String icon,
        @NotNull TransactionType type
) {}
