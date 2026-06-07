package com.family.expenses.service;

import com.family.expenses.dto.BudgetRequest;
import com.family.expenses.dto.BudgetResponse;
import com.family.expenses.entity.Budget;
import com.family.expenses.entity.Category;
import com.family.expenses.entity.User;
import com.family.expenses.enums.Role;
import com.family.expenses.exception.ResourceNotFoundException;
import com.family.expenses.repository.BudgetRepository;
import com.family.expenses.repository.CategoryRepository;
import com.family.expenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BudgetResponse> findByPeriod(String userEmail, int month, int year) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return budgetRepository.findByFamilyIdAndMonthAndYear(user.getFamily().getId(), month, year)
                .stream().map(this::toResponse).toList();
    }

    // Upsert: cria o orçamento ou atualiza se já existir para essa categoria/mês/ano
    @Transactional
    public BudgetResponse upsert(BudgetRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (!category.isSystemDefault() && !category.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Categoria não pertence à família");
        }

        Budget budget = budgetRepository
                .findByFamilyIdAndCategoryIdAndMonthAndYear(
                        user.getFamily().getId(), request.categoryId(), request.month(), request.year())
                .orElse(Budget.builder()
                        .category(category)
                        .family(user.getFamily())
                        .month(request.month())
                        .year(request.year())
                        .build());

        budget.setLimitAmount(request.limitAmount());

        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado"));

        if (!budget.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Orçamento não pertence à família");
        }

        budgetRepository.delete(budget);
    }

    private void requireAdmin(User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Apenas administradores podem realizar esta ação");
        }
    }

    private BudgetResponse toResponse(Budget b) {
        return new BudgetResponse(
                b.getId(),
                b.getCategory().getId(),
                b.getCategory().getName(),
                b.getCategory().getIcon(),
                b.getLimitAmount(),
                b.getMonth(),
                b.getYear()
        );
    }
}
