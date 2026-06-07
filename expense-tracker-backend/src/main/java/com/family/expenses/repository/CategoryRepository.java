package com.family.expenses.repository;

import com.family.expenses.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByFamilyIdOrSystemDefaultTrue(Long familyId);
}
