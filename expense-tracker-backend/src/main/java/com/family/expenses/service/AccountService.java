package com.family.expenses.service;

import com.family.expenses.dto.AccountRequest;
import com.family.expenses.dto.AccountResponse;
import com.family.expenses.entity.Account;
import com.family.expenses.entity.User;
import com.family.expenses.enums.Role;
import com.family.expenses.exception.ResourceNotFoundException;
import com.family.expenses.repository.AccountRepository;
import com.family.expenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return accountRepository.findByFamilyId(user.getFamily().getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AccountResponse create(AccountRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Account account = Account.builder()
                .name(request.name())
                .type(request.type())
                .family(user.getFamily())
                .build();

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(Long id, AccountRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));

        if (!account.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Conta não pertence à família");
        }

        account.setName(request.name());
        account.setType(request.type());

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));

        if (!account.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Conta não pertence à família");
        }

        accountRepository.delete(account);
    }

    private void requireAdmin(User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Apenas administradores podem realizar esta ação");
        }
    }

    private AccountResponse toResponse(Account a) {
        return new AccountResponse(a.getId(), a.getName(), a.getType());
    }
}
