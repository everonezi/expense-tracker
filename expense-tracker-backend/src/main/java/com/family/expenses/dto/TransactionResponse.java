package com.family.expenses.dto;

import com.family.expenses.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        LocalDate date,
        String description,
        Long categoryId,
        String categoryName,
        String categoryIcon,
        Long accountId,
        String accountName,
        Long userId,
        String userName
) {}
