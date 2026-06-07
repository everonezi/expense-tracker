package com.family.expenses.dto;

import java.util.List;

public record DashboardResponse(
        MonthlySummary summary,
        List<BudgetProgress> budgets,
        List<TransactionResponse> recentTransactions
) {}
