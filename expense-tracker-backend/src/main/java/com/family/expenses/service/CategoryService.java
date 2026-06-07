package com.family.expenses.service;

import com.family.expenses.dto.CategoryRequest;
import com.family.expenses.dto.CategoryResponse;
import com.family.expenses.entity.Category;
import com.family.expenses.entity.User;
import com.family.expenses.enums.Role;
import com.family.expenses.exception.ResourceNotFoundException;
import com.family.expenses.repository.CategoryRepository;
import com.family.expenses.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return categoryRepository.findByFamilyIdOrSystemDefaultTrue(user.getFamily().getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Category category = Category.builder()
                .name(request.name())
                .icon(request.icon())
                .type(request.type())
                .systemDefault(false)
                .family(user.getFamily())
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (category.isSystemDefault()) {
            throw new IllegalArgumentException("Categorias padrão não podem ser editadas");
        }
        if (!category.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Categoria não pertence à família");
        }

        category.setName(request.name());
        category.setIcon(request.icon());
        category.setType(request.type());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        requireAdmin(user);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (category.isSystemDefault()) {
            throw new IllegalArgumentException("Categorias padrão não podem ser removidas");
        }
        if (!category.getFamily().getId().equals(user.getFamily().getId())) {
            throw new IllegalArgumentException("Categoria não pertence à família");
        }

        categoryRepository.delete(category);
    }

    private void requireAdmin(User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Apenas administradores podem realizar esta ação");
        }
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getIcon(), c.getType(), c.isSystemDefault());
    }
}
