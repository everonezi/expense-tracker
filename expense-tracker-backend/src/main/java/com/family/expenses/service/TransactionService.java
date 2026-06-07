package com.family.expenses.service;

import com.family.expenses.dto.TransactionRequest;
import com.family.expenses.dto.TransactionResponse;
import com.family.expenses.entity.Account;
import com.family.expenses.entity.Category;
import com.family.expenses.entity.Transaction;
import com.family.expenses.entity.User;
import com.family.expenses.exception.ResourceNotFoundException;
import com.family.expenses.repository.AccountRepository;
import com.family.expenses.repository.CategoryRepository;
import com.family.expenses.repository.TransactionRepository;
import com.family.expenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public TransactionResponse create(TransactionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Category category = findCategoryForUser(request.categoryId(), user);
        Account account = findAccountForUser(request.accountId(), user);

        Transaction transaction = Transaction.builder()
                .amount(request.amount())
                .type(request.type())
                .date(request.date())
                .description(request.description())
                .category(category)
                .account(account)
                .user(user)
                .family(user.getFamily())
                .build();

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> findByPeriod(String userEmail, int month, int year) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return transactionRepository
                .findByFamilyIdAndDateBetweenOrderByDateDesc(user.getFamily().getId(), start, end)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        validateFamilyAccess(transaction.getFamily().getId(), user.getFamily().getId());
        return toResponse(transaction);
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        validateFamilyAccess(transaction.getFamily().getId(), user.getFamily().getId());

        Category category = findCategoryForUser(request.categoryId(), user);
        Account account = findAccountForUser(request.accountId(), user);

        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDate(request.date());
        transaction.setDescription(request.description());
        transaction.setCategory(category);
        transaction.setAccount(account);

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        validateFamilyAccess(transaction.getFamily().getId(), user.getFamily().getId());
        transactionRepository.delete(transaction);
    }

    private Category findCategoryForUser(Long categoryId, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        if (!category.isSystemDefault() && !category.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Categoria não pertence à família");
        }
        return category;
    }

    private Account findAccountForUser(Long accountId, User user) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
        if (!account.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Conta não pertence à família");
        }
        return account;
    }

    private void validateFamilyAccess(Long resourceFamilyId, Long userFamilyId) {
        if (!resourceFamilyId.equals(userFamilyId)) {
            throw new IllegalArgumentException("Acesso negado");
        }
    }

    private TransactionResponse toResponse(Transaction t) {
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
