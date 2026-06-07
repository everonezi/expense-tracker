package com.family.expenses.service;

import com.family.expenses.dto.*;
import com.family.expenses.entity.Budget;
import com.family.expenses.entity.Transaction;
import com.family.expenses.entity.User;
import com.family.expenses.enums.BudgetStatus;
import com.family.expenses.enums.TransactionType;
import com.family.expenses.repository.BudgetRepository;
import com.family.expenses.repository.TransactionRepository;
import com.family.expenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String userEmail, int month, int year) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Long familyId = user.getFamily().getId();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        MonthlySummary summary = buildSummary(familyId, month, year, start, end);
        List<BudgetProgress> budgets = buildBudgetProgress(familyId, month, year, start, end);
        List<TransactionResponse> recent = transactionRepository
                .findTop5ByFamilyIdOrderByDateDesc(familyId)
                .stream().map(this::toTransactionResponse).toList();

        return new DashboardResponse(summary, budgets, recent);
    }

    private MonthlySummary buildSummary(Long familyId, int month, int year, LocalDate start, LocalDate end) {
        BigDecimal totalIncome = transactionRepository
                .sumByFamilyIdAndTypeAndDateBetween(familyId, TransactionType.INCOME, start, end);
        BigDecimal totalExpenses = transactionRepository
                .sumByFamilyIdAndTypeAndDateBetween(familyId, TransactionType.EXPENSE, start, end);
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        return new MonthlySummary(totalIncome, totalExpenses, balance, month, year);
    }

    private List<BudgetProgress> buildBudgetProgress(Long familyId, int month, int year, LocalDate start, LocalDate end) {
        return budgetRepository.findByFamilyIdAndMonthAndYear(familyId, month, year)
                .stream()
                .map(budget -> toBudgetProgress(budget, familyId, start, end))
                .toList();
    }

    private BudgetProgress toBudgetProgress(Budget budget, Long familyId, LocalDate start, LocalDate end) {
        BigDecimal spent = transactionRepository
                .sumExpenseByFamilyIdAndCategoryIdAndDateBetween(
                        familyId, budget.getCategory().getId(), start, end);

        BigDecimal limit = budget.getLimitAmount();
        int percentage = limit.compareTo(BigDecimal.ZERO) > 0
                ? spent.multiply(BigDecimal.valueOf(100))
                        .divide(limit, 0, RoundingMode.HALF_UP)
                        .intValue()
                : 0;

        BudgetStatus status;
        if (percentage >= 100) status = BudgetStatus.EXCEEDED;
        else if (percentage >= 80) status = BudgetStatus.WARNING;
        else status = BudgetStatus.OK;

        BigDecimal available = limit.subtract(spent).max(BigDecimal.ZERO);

        return new BudgetProgress(
                budget.getId(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getCategory().getIcon(),
                limit,
                spent,
                available,
                percentage,
                status
        );
    }

    private TransactionResponse toTransactionResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getAmount(),
                t.getType(),
                t.getDate(),
                t.getDescription(),
                t.getCategory().getId(),
                t.getCategory().getName(),
                t.getCategory().getIcon(),
                t.getAccount().getId(),
                t.getAccount().getName(),
                t.getUser().getId(),
                t.getUser().getName()
        );
    }
}
