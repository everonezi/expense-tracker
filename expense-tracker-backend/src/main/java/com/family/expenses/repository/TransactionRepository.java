package com.family.expenses.repository;

import com.family.expenses.entity.Transaction;
import com.family.expenses.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFamilyIdAndDateBetweenOrderByDateDesc(Long familyId, LocalDate start, LocalDate end);

    List<Transaction> findTop5ByFamilyIdOrderByDateDesc(Long familyId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.family.id = :familyId AND t.type = :type AND t.date BETWEEN :start AND :end")
    BigDecimal sumByFamilyIdAndTypeAndDateBetween(Long familyId, TransactionType type, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.family.id = :familyId AND t.category.id = :categoryId AND t.type = 'EXPENSE' AND t.date BETWEEN :start AND :end")
    BigDecimal sumExpenseByFamilyIdAndCategoryIdAndDateBetween(Long familyId, Long categoryId, LocalDate start, LocalDate end);
}
