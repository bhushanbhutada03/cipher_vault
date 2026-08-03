package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestHeader("X-Vault-Token") String vaultToken) {

        byte[] csv = exportService.exportCsv(vaultToken);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=credentials.csv"
                )
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv);
    }
}