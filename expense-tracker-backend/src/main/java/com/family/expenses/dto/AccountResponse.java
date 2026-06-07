package com.family.expenses.dto;

import com.family.expenses.enums.AccountType;

public record AccountResponse(
        Long id,
        String name,
        AccountType type
) {}
