# Introduction to Cyber security

## Web app security risks:

- Authentication and identification failure
passwords stored in plain text, no brute force prevention, allowing weak passwords

- Broken access control
user can view or modify other users account using their uid, principle of least privileges, ability to browse pages that require authentication as an unauthenticated user

- Injection
user can insert malicious code as part of their input, no input validation/sanitisation

- Cryptographic failure
weak cryptographic algorithm e.g. Ceasar cipher, default or weak cryptographic keys, using clear text to send sensitive data e.g. HTTP instead of HTTPS