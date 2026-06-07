package com.family.expenses.repository;

import com.family.expenses.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByFamilyId(Long familyId);
}
