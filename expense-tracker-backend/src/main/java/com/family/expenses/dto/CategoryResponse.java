package com.family.expenses.dto;

import com.family.expenses.enums.TransactionType;

public record CategoryResponse(
        Long id,
        String name,
        String icon,
        TransactionType type,
        boolean systemDefault
) {}
