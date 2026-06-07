package com.family.expenses.repository;

import com.family.expenses.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByFamilyIdAndActiveTrue(Long familyId);
    List<RecurringTransaction> findByActiveTrueAndDayOfMonth(Integer dayOfMonth);
}
