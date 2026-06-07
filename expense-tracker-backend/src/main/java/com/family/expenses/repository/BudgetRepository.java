package com.family.expenses.repository;

import com.family.expenses.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByFamilyIdAndMonthAndYear(Long familyId, Integer month, Integer year);
    Optional<Budget> findByFamilyIdAndCategoryIdAndMonthAndYear(Long familyId, Long categoryId, Integer month, Integer year);
}
