package com.bhushan.securecredentialorganizer.repository;

import com.bhushan.securecredentialorganizer.entity.Category;
import com.bhushan.securecredentialorganizer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findByUser(User user);

    Optional<Category> findByIdAndUser(
            Long id,
            User user
    );

    boolean existsByCategoryNameAndUser(
            String categoryName,
            User user
    );

    // NEW: Used while updating a category
    boolean existsByCategoryNameAndUserAndIdNot(
            String categoryName,
            User user,
            Long id
    );

    long countByUser(User user);
}