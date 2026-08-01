package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.CategoryRequest;
import com.bhushan.securecredentialorganizer.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getMyCategories();

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}