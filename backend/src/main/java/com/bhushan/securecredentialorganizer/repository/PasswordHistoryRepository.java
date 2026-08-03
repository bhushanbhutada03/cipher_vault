package com.bhushan.securecredentialorganizer.repository;

import com.bhushan.securecredentialorganizer.entity.PasswordHistory;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PasswordHistoryRepository
        extends JpaRepository<PasswordHistory,Long> {

    List<PasswordHistory> findByCredentialOrderByChangedAtDesc(
            WebsiteCredential credential
    );

    @Query("SELECT ph FROM PasswordHistory ph WHERE ph.credential.user = :user")
    List<PasswordHistory> findByCredentialUser(@Param("user") User user);

    void deleteByCredential(WebsiteCredential credential);
}