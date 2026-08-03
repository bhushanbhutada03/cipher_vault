package com.bhushan.securecredentialorganizer.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "website_credentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebsiteCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    @Column(name = "version")
    private Long version = 0L;

    @Column(name = "credential_uuid", nullable = false, unique = true, length = 36)
    private String credentialUuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-credential")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference("category-credential")
    private Category category;

    @Column(name = "website_name", nullable = false, length = 100)
    private String websiteName;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @Column(name = "username_encrypted", nullable = false, columnDefinition = "TEXT")
    private String usernameEncrypted;

    @Column(name = "email_encrypted", columnDefinition = "TEXT")
    private String emailEncrypted;

    @Column(name = "password_encrypted", nullable = false, columnDefinition = "TEXT")
    private String passwordEncrypted;

    @Column(name = "notes_encrypted", columnDefinition = "TEXT")
    private String notesEncrypted;

    @Builder.Default
    @Column(name = "favorite", nullable = false)
    private boolean favorite = false;

    @Column(name = "favicon_url", length = 500)
    private String faviconUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (credentialUuid == null) {
            credentialUuid = java.util.UUID.randomUUID().toString();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}