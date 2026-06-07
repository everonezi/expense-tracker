package com.family.expenses.controller;

import com.family.expenses.dto.BudgetRequest;
import com.family.expenses.dto.BudgetResponse;
import com.family.expenses.entity.User;
import com.family.expenses.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> findByPeriod(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal User user) {
        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(budgetService.findByPeriod(user.getEmail(), m, y));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> upsert(
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.upsert(request, user.getEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        budgetService.delete(id, user.getEmail());
        return ResponseEntity.noContent().build();
    }
}
