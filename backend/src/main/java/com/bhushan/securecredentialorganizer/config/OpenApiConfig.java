package com.bhushan.securecredentialorganizer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI secureCredentialOrganizerOpenAPI() {

        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()
                .info(
                        new Info()
                                .title("Cipher Vault API")
                                .version("1.0")
                                .description("REST API for securely managing website credentials with JWT authentication, AES encryption, password generator, OTP-based password reset, categories, favorites, and dashboard analytics.")
                                .contact(
                                        new Contact()
                                                .name("Bhushan Bhutada")
                                                .email("your-email@example.com")
                                )
                                .license(
                                        new License()
                                                .name("MIT License")
                                )
                )

                .addSecurityItem(
                        new SecurityRequirement().addList(securitySchemeName)
                )

                .components(
                        new Components()
                                .addSecuritySchemes(
                                        securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }
}