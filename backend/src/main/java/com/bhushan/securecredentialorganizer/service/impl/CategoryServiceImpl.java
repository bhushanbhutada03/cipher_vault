package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.CategoryRequest;
import com.bhushan.securecredentialorganizer.dto.response.CategoryResponse;
import com.bhushan.securecredentialorganizer.entity.Category;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.exception.DuplicateResourceException;
import com.bhushan.securecredentialorganizer.exception.ResourceNotFoundException;
import com.bhushan.securecredentialorganizer.repository.CategoryRepository;
import com.bhushan.securecredentialorganizer.repository.WebsiteCredentialRepository;
import com.bhushan.securecredentialorganizer.security.CustomUserDetails;
import com.bhushan.securecredentialorganizer.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.bhushan.securecredentialorganizer.exception.OperationNotAllowedException;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final WebsiteCredentialRepository websiteCredentialRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {

        User user = getCurrentUser();

        if (categoryRepository.existsByCategoryNameAndUser(request.getCategoryName(), user)) {
            throw new DuplicateResourceException("Category already exists.");
        }

        Category category = Category.builder()
                .categoryName(request.getCategoryName().trim())
                .user(user)
                .build();

        categoryRepository.save(category);

        return mapToResponse(category);
    }

    @Override
    public List<CategoryResponse> getMyCategories() {

        User user = getCurrentUser();

        return categoryRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {

        User user = getCurrentUser();

        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found."));

        String updatedName = request.getCategoryName().trim();

        if (categoryRepository.existsByCategoryNameAndUserAndIdNot(updatedName, user, id)) {
            throw new DuplicateResourceException("Category already exists.");
        }

        category.setCategoryName(updatedName);

        categoryRepository.save(category);

        return mapToResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {

        User user = getCurrentUser();

        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found."));

        if (websiteCredentialRepository.existsByCategoryId(id)) {
            throw new OperationNotAllowedException(
                    "Cannot delete category because it contains credentials."
            );
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }
}