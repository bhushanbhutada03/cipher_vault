package com.bhushan.securecredentialorganizer.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Configuration
@ConfigurationProperties(prefix = "argon2")
@Getter
@Setter
@Validated
public class Argon2Properties {
    
    @NotNull
    @Min(value = 1, message = "Iterations must be at least 1")
    private Integer iterations;
    
    @NotNull
    @Min(value = 1024, message = "Memory must be at least 1024 KB")
    private Integer memoryKb;
    
    @NotNull
    @Min(value = 1, message = "Parallelism must be at least 1")
    private Integer parallelism;
}
