package com.bhushan.securecredentialorganizer.service;

public interface ExportService {

    byte[] exportCsv(String vaultToken);

}