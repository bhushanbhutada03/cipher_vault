# Cipher Vault

A full-stack password manager that securely stores and manages website credentials using modern security practices. Cipher Vault combines Spring Boot, React, JWT authentication, AES encryption, and MySQL to provide a secure and intuitive password management experience.

---

## Features

### Authentication
- User Registration
- Email Verification (OTP)
- Secure Login
- JWT Authentication
- BCrypt Password Hashing

### Vault Security
- Master Password Protected Vault
- Vault Unlock Flow
- AES-128 Encrypted Credential Storage
- Recovery Key Generation
- Recovery Key Regeneration
- Vault Recovery
- Brute Force Protection

### Credential Management
- Add Credentials
- Edit Credentials
- Delete Credentials
- Search Credentials
- Favorite Credentials
- Password Reveal (Master Password Verification)
- Password History Tracking
- Website Favicon Support
- Export Credentials

### Categories
- Create Categories
- Update Categories
- Delete Categories
- Organize Credentials by Category

### Profile
- Update Profile Information
- Change Login Password
- Change Master Password

### Dashboard
- Total Credentials
- Favorite Credentials
- Category Statistics
- Recent Credentials

### User Experience
- Responsive UI
- Dark Theme
- Modern Dashboard
- Smooth Animations

### Deployment
- Docker
- Docker Compose

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Backend | Spring Boot 3 |
| Frontend | React 19, TypeScript, Vite |
| Security | Spring Security, JWT, BCrypt |
| Encryption | AES-128 |
| Database | MySQL |
| ORM | Spring Data JPA (Hibernate) |
| Styling | Tailwind CSS |
| State Management | TanStack Query |
| API Documentation | Swagger OpenAPI |
| Containerization | Docker |

---

## Architecture

```text
                React + TypeScript
                       │
                       ▼
                Spring Boot REST API
                       │
      ┌────────────────┴────────────────┐
      ▼                                 ▼
Spring Security                  AES Encryption
      │                                 │
      └──────────────┬──────────────────┘
                     ▼
              MySQL Database
```

---

## Security Features

- JWT Authentication
- Spring Security Authorization
- BCrypt Password Hashing
- AES-128 Credential Encryption
- Master Password Verification
- Recovery Key-Based Vault Recovery
- Email Verification (OTP)
- Password History Tracking
- Brute Force Protection
- Global Exception Handling

---

## Project Structure

```text
cipher_vault
│
├── backend
│   ├── config
│   ├── controller
│   ├── dto
│   ├── encryption
│   ├── entity
│   ├── repository
│   ├── security
│   ├── service
│   └── resources
│
├── frontend
│   ├── public
│   ├── src
│   └── components
│
└── docs
```

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/bhushanbhutada03/cipher_vault.git
```

### Navigate to Project

```bash
cd cipher_vault
```

### Backend

Configure your MySQL database in:

```text
backend/src/main/resources/application-local.properties
```

Run the backend:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Running with Docker

```bash
docker compose up --build
```

---

## API Documentation

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

---

## Screenshots

Add screenshots after deployment.

- Login
- Register
- Dashboard
- Credentials
- Profile
- Vault Recovery

---

## Future Improvements

- Secure Password Generator
- Browser Extension
- Two-Factor Authentication (2FA)
- Password Breach Detection
- Secure Credential Import
- Cloud Synchronization

---

## Author

**Bhushan Bhutada**

GitHub  
https://github.com/bhushanbhutada03

LinkedIn  
https://www.linkedin.com/in/bhushanbhutada03
