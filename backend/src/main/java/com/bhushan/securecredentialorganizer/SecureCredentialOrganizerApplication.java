package com.bhushan.securecredentialorganizer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SecureCredentialOrganizerApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecureCredentialOrganizerApplication.class, args);
	}

}
