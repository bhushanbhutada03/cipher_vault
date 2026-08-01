package com.bhushan.securecredentialorganizer.repository;

import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WebsiteCredentialRepository
        extends JpaRepository<WebsiteCredential, Long> {

    @Query("""
       SELECT wc
       FROM WebsiteCredential wc
       JOIN FETCH wc.category
       WHERE wc.user = :user
       """)
    List<WebsiteCredential> findByUser(@Param("user") User user);

    List<WebsiteCredential> findByCategoryId(Long categoryId);

    // NEW: Used to prevent deletion of categories containing credentials
    boolean existsByCategoryId(Long categoryId);

    @Query("""
       SELECT wc
       FROM WebsiteCredential wc
       JOIN FETCH wc.category
       WHERE wc.user = :user
       AND wc.favorite = true
       """)
    List<WebsiteCredential> findByUserAndFavoriteTrue(
            @Param("user") User user
    );

    @Query("""
SELECT wc
FROM WebsiteCredential wc
JOIN FETCH wc.category
WHERE wc.id = :id
AND wc.user = :user
""")
    Optional<WebsiteCredential> findByIdAndUser(
            @Param("id") Long id,
            @Param("user") User user
    );

    @Query("""
SELECT wc
FROM WebsiteCredential wc
JOIN FETCH wc.category
WHERE
(
    wc.user = :user
    AND LOWER(wc.websiteName)
        LIKE LOWER(CONCAT('%', :keyword, '%'))
)
OR
(
    wc.user = :user
    AND LOWER(wc.websiteUrl)
        LIKE LOWER(CONCAT('%', :keyword, '%'))
)
""")
    List<WebsiteCredential> findByUserAndWebsiteNameContainingIgnoreCaseOrUserAndWebsiteUrlContainingIgnoreCase(
            @Param("user") User user,
            @Param("keyword") String keyword,
            @Param("user") User user2,
            @Param("keyword") String keyword2
    );

    long countByUser(User user);

    long countByUserAndFavoriteTrue(User user);

    @EntityGraph(attributePaths = {"category"})
    List<WebsiteCredential> findTop5ByUserOrderByCreatedAtDesc(User user);
}