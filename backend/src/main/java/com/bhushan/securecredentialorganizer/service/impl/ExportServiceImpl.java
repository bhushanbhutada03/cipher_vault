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

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final WebsiteCredentialRepository websiteCredentialRepository;
    private final EncryptionService encryptionService;

    @Override
    public byte[] exportCsv() {

        User user = getCurrentUser();

        List<WebsiteCredential> credentials =
                websiteCredentialRepository.findByUser(user);

        StringBuilder csv = new StringBuilder();

        csv.append("Website,URL,Username,Password,Category,Favorite,Notes\n");

        for (WebsiteCredential credential : credentials) {

            csv.append(safe(credential.getWebsiteName())).append(",");
            csv.append(safe(credential.getWebsiteUrl())).append(",");
            csv.append(safe(
                    encryptionService.decrypt(
                            credential.getUsernameEncrypted()
                    ))).append(",");
            csv.append(safe(
                    encryptionService.decrypt(
                            credential.getPasswordEncrypted()
                    ))).append(",");
            csv.append(safe(
                    credential.getCategory().getCategoryName()
            )).append(",");
            csv.append(credential.isFavorite()).append(",");
            csv.append(safe(
                    credential.getNotesEncrypted() == null
                            ? ""
                            : encryptionService.decrypt(
                            credential.getNotesEncrypted()
                    )
            )).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
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