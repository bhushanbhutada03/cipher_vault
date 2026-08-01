##### &#x09;SECURE CREDENTIAL ORGANIZER





Tagline

\-------

A full-stack application to securely store, organize, and manage sensitive information using strong encryption, authenticated access, and privacy-first architecture.



Problem Statement

\-----------------

People often store passwords in browsers, notes, spreadsheets, or reuse the same password across multiple websites, making credential management insecure and vulnerable to data breaches.



Target Users

\------------

• Individuals



USP

\---

• Secure

• Organized

• Privacy Focused

• Zero-Knowledge Architecture

• End-to-End Encryption

• Easy to Use





==========================

MODULES

==========================



1\. Authentication

• Register

• Login

• Logout

• Session Management

• Email Verification



2\. Vault

• Website Credentials

• Add / View / Update / Delete

• Encryption / Decryption



3\. Dashboard

• Recent Items

• Statistics

• Quick Actions



4\. Search \& Organization

• Search

• Categories

• Favorites

• Sorting



5\. Security

• Master Password Verification

• Recovery Key

• Encryption

• Validation

• Access Control



6\. Tools

• Password Generator

• Password Strength Checker

• Encryption Demo





==========================

VERSIONS

==========================



Version 1 (MVP)

\--------------

• Register \& Login

• Email Verification

• Dashboard

• Credential CRUD

• Categories

• Search

• AES-256 Encryption

• Recovery Key

• Logout



Version 2

\---------

• Password Generator

• Password Strength Meter

• Favorites

• Secure Notes

• Password History

• API Keys

• Encryption Demo



Version 3

\---------

• Secure Document Vault

• Bank Cards

• Import / Export

• Browser Extension





==========================

WEBSITE CREDENTIAL

==========================



• Website Name \*

• Website URL (Optional)

• Username / Email \*

• Password \*

• Category (Optional)

• Notes (Optional)

• Favorite (Default: False)



Extras

\------

• Auto-fetch website favicon.

• Show default 🌐 icon if favicon is unavailable.





==========================

CATEGORIES

==========================



Default Categories

\------------------

• Social

• Work

• Finance

• Shopping

• Education

• Entertainment

• Other



Custom Category

\---------------

Other

&#x20;  ↓

Enter Category Name

&#x20;  ↓

Automatically Saved

&#x20;  ↓

Available in dropdown next time



Rules

\-----

✓ Default categories cannot be edited.

✓ Default categories cannot be deleted.

✓ Custom categories are user-specific.

✓ Duplicate categories are not allowed.





==========================

AUTHENTICATION

==========================



Registration

\------------

• Full Name

• Email

• Password

• Confirm Password

• Master Password

• Confirm Master Password



Login

\-----

• Email

• Password



Email Verification

\------------------

Register

&#x20;     ↓

Generate Verification Token

&#x20;     ↓

Verification Email

&#x20;     ↓

Click Verification Link

&#x20;     ↓

Account Activated



Master Password

\---------------

• Required to unlock the vault.

• Never stored in plain text.

• Stored only as a BCrypt hash.

• Used to derive a Key Encryption Key (KEK) using PBKDF2.

• KEK decrypts the Vault Key.

• Vault Key encrypts/decrypts all sensitive data.

• Required to view passwords, secure notes, API keys and bank cards.



Recovery Key

\------------

• Generated during registration.

• Shown only once.

• User must store it safely offline.

• Used to reset the Master Password.

• Developers cannot regenerate or view it.

• If both the Master Password and Recovery Key are lost, the vault cannot be recovered.



Forgot Master Password

\----------------------

Verify Email

&#x20;     ↓

Enter Recovery Key

&#x20;     ↓

Create New Master Password



Security

\--------

✓ Email stored in lowercase.

✓ Email must be unique.

✓ Login Password → BCrypt Hash

✓ Master Password → BCrypt Hash

✓ Email verification mandatory.

✓ Login Password ≠ Master Password.

✓ Zero-Knowledge Architecture.

✓ Developers cannot access user secrets.

✓ Without Recovery Key, encrypted vault cannot be recovered.





==========================

VAULT ENCRYPTION

==========================



Encryption

\----------

• AES-256



Key Management

\--------------

Master Password

&#x20;     ↓

PBKDF2

&#x20;     ↓

Key Encryption Key (KEK)

&#x20;     ↓

Decrypt Vault Key

&#x20;     ↓

Vault Key Encrypts / Decrypts

&#x20;     • Website Passwords

&#x20;     • Usernames

&#x20;     • Secure Notes

&#x20;     • API Keys

&#x20;     • Bank Card Details



Encrypted Fields

\----------------

• Username / Email

• Password

• Notes

• API Keys

• Bank Card Number

• CVV



Plain Fields

\------------

• Website Name

• Website URL

• Category

• Favorite



Decryption

\----------

• Performed only on demand.

• Requires Master Password.



Security

\--------

✓ Sensitive data encrypted using AES-256.

✓ Plain fields available for searching and filtering.

✓ Decryption happens only when required.

✓ Encryption keys are never stored in plain text.





==========================

FUTURE VAULT MODULES

==========================



• Website Credentials

• Secure Notes

• API Keys

• Bank Cards

• Wi-Fi Passwords

• License Keys

• Secure Document Vault

&#x20; (PDFs, Images, Certificates, Passport, Aadhaar, PAN, Resume, etc.)





==========================

TOOLS

==========================



Password Generator

\------------------

• Generate strong random passwords.



Password Strength Checker

\-------------------------

• Analyze password strength.

• Suggest improvements.



Encryption Demo

\---------------

User Input

&#x20;     ↓

AES-256 Encryption

&#x20;     ↓

Encrypted Output

&#x20;     ↓

Decrypt using Master Password



Purpose

\-------

• Demonstrates how AES encryption works.

• Shows encrypted output.

• Demonstrates decryption using the Master Password.

• Improves transparency and learning.





==========================

SECURITY FEATURES

==========================



✓ BCrypt Password Hashing

✓ AES-256 Encryption

✓ PBKDF2 Key Derivation

✓ Vault Key Architecture

✓ Zero-Knowledge Architecture

✓ Email Verification

✓ Recovery Key

✓ JWT Authentication

✓ Session Management

✓ Input Validation

✓ Role-based Access Control (Future)

```


Can I ever need the original value again?

          YES -----------------> AES Encryption

           |
           |
           NO
           |
           ↓

     BCrypt / PBKDF2 Hashing
