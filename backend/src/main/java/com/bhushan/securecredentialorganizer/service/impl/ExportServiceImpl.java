package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.encryption.EncryptionService;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import com.bhushan.securecredentialorganizer.repository.WebsiteCredentialRepository;
import com.bhushan.securecredentialorganizer.security.CustomUserDetails;
import com.bhushan.securecredentialorganizer.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Arrays;
import com.bhushan.securecredentialorganizer.encryption.CredentialCryptoService;
import com.bhushan.securecredentialorganizer.encryption.VaultTokenService;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportServiceImpl implements ExportService {

    private final WebsiteCredentialRepository websiteCredentialRepository;
    private final EncryptionService encryptionService;
    private final CredentialCryptoService cryptoService;
    private final VaultTokenService vaultTokenService;

    @Override
    public byte[] exportCsv(String vaultToken) {

        User user = getCurrentUser();
        byte[] dek = vaultTokenService.extractDek(vaultToken, user.getTokenVersion());

        try {
            List<WebsiteCredential> credentials =
                    websiteCredentialRepository.findByUser(user);

            StringBuilder csv = new StringBuilder();

            csv.append("Website,URL,Username,Password,Category,Favorite,Notes\n");

            for (WebsiteCredential credential : credentials) {

                csv.append(safe(credential.getWebsiteName())).append(",");
                csv.append(safe(credential.getWebsiteUrl())).append(",");
                csv.append(safe(
                        cryptoService.decryptField(
                                credential.getUsernameEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "username"
                        ))).append(",");
                csv.append(safe(
                        cryptoService.decryptField(
                                credential.getPasswordEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "password"
                        ))).append(",");
                csv.append(safe(
                        credential.getCategory().getCategoryName()
                )).append(",");
                csv.append(credential.isFavorite()).append(",");
                csv.append(safe(
                        credential.getNotesEncrypted() == null
                                ? ""
                                : cryptoService.decryptField(
                                credential.getNotesEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "notes"
                        )
                )).append("\n");
            }

            return csv.toString().getBytes(StandardCharsets.UTF_8);
        } finally {
            Arrays.fill(dek, (byte) 0);
        }
    }

    private String safe(String value) {

        if (value == null) {
            return "";
        }

        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }
}