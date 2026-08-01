# Secure Credential Organizer

A secure password management REST API built with Spring Boot that enables users to securely store, organize, and manage website credentials. The application uses JWT Authentication, Spring Security, AES Encryption, and MySQL to provide a secure credential management solution.

---

## Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- BCrypt Password Hashing

### Website Credential Management
- Create Website Credentials
- Update Website Credentials
- Delete Website Credentials
- Reveal Stored Passwords using Master Password Verification
- Search Credentials
- Mark Credentials as Favorites
- Password History Tracking

### Category Management
- Create Categories
- Update Categories
- Delete Categories
- Organize Credentials by Category

### Profile Management
- View User Profile
- Update Profile Information
- Change Login Password
- Change Master Password

### Password Recovery
- Forgot Password using Email OTP
- OTP Verification
- Reset Password

### Security
- AES Encryption for Sensitive Passwords
- JWT Authorization
- Spring Security
- Master Password Verification
- Global Exception Handling

### Utilities
- Password Generator
- Password Strength Analyzer
- Dashboard Statistics
- Swagger API Documentation

### Deployment
- Docker Support
- Docker Compose Configuration

---

# Technology Stack

| Category | Technology |
|----------|------------|
| Language | Java 21 |
| Framework | Spring Boot |
| Security | Spring Security, JWT |
| Database | MySQL |
| ORM | Spring Data JPA (Hibernate) |
| Build Tool | Maven |
| Documentation | Swagger OpenAPI |
| Containerization | Docker |
| Utilities | Lombok |

---

# Project Structure

```
src
└── main
    ├── config
    ├── controller
    ├── dto
    ├── encryption
    ├── entity
    ├── exception
    ├── repository
    ├── security
    ├── service
    └── resources
```

---

# Architecture

```
Client
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
MySQL Database
```

Authentication requests are secured using Spring Security and JWT. Sensitive credential passwords are encrypted using AES before being stored in the database.

---

# Security Features

- JWT Authentication
- Spring Security Authorization
- AES Encryption for Stored Passwords
- BCrypt Password Hashing
- Master Password Verification
- Password History Tracking
- Global Exception Handling

---

# REST API Modules

### Authentication
- Register
- Login

### Categories
- Create Category
- Update Category
- Delete Category
- List Categories

### Website Credentials
- Add Credential
- Update Credential
- Delete Credential
- Reveal Password
- Search Credentials
- Favorite Credentials

### Profile
- View Profile
- Update Profile
- Change Login Password
- Change Master Password

### Password Recovery
- Send OTP
- Verify OTP
- Reset Password

### Utilities
- Password Generator
- Password Strength Analyzer
- Dashboard Statistics

---

# API Documentation

Swagger UI is available after starting the application.

```
http://localhost:8080/swagger-ui/index.html
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/bhushanbhutada03/secure-credential-organizer.git
```

## Navigate to Project

```bash
cd secure-credential-organizer
```

## Configure Database

Update your MySQL configuration inside:

```
src/main/resources/application-local.properties
```

## Run the Application

```bash
./mvnw spring-boot:run
```

or

```bash
mvn spring-boot:run
```

---

# Running with Docker

```bash
docker-compose up --build
```

---

# Future Enhancements

- React Frontend
- Credential Import/Export
- Browser Extension
- Two-Factor Authentication (2FA)
- Password Breach Detection
- Cloud Deployment
- Audit Logs
- Multi-Device Synchronization

---

# Author

**Bhushan Bhutada**

GitHub  
https://github.com/bhushanbhutada03

LinkedIn  
https://www.linkedin.com/in/bhushanbhutada03
