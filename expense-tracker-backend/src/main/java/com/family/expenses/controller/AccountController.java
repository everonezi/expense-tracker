package com.family.expenses.controller;

import com.family.expenses.dto.AccountRequest;
import com.family.expenses.dto.AccountResponse;
import com.family.expenses.entity.User;
import com.family.expenses.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<List<AccountResponse>> findAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(accountService.findAll(user.getEmail()));
    }

    @PostMapping
    public ResponseEntity<AccountResponse> create(
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(accountService.create(request, user.getEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(accountService.update(id, request, user.getEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        accountService.delete(id, user.getEmail());
        return ResponseEntity.noContent().build();
    }
}
