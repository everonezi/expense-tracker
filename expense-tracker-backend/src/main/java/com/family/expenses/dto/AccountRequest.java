package com.family.expenses.dto;

import com.family.expenses.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AccountRequest(
        @NotBlank String name,
        @NotNull AccountType type
) {}
