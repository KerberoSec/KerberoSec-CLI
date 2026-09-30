# Windows NTLM
## Introduction
Authentication protocol used on networks that include systems running the Windows operating system and on stand-alone systems.

Provided through the SSP pacakge.

https://learn.microsoft.com/en-us/windows/win32/secauthn/microsoft-ntlm  

## Authentication Process
### Involved Parties
In the Interactive NTLM authentication over a network case, the process involve:
- a client system, where the user is requesting authentication, and
- a domain controller, where information related to the user's password is kept.

In Noninteractive authentication which may be required to permit *an already logged-on user* to access a resource such as a server application, it involves:
- a client,
- a server, and
- a domain controller that does the authentication calculations on behalf of the server.

### Process
1. (Interactive authentication only) A user accesses a client computer and provides a domain name, user name, and password. The client computes a cryptographic [_hash_](https://learn.microsoft.com/en-us/windows/win32/secgloss/h-gly) of the password and discards the actual password.
2. The client sends the user name to the server (in [_plaintext_](https://learn.microsoft.com/en-us/windows/win32/secgloss/p-gly)).
3. The server generates a 8-byte random number, called a _challenge_ or [_nonce_](https://learn.microsoft.com/en-us/windows/win32/secgloss/n-gly), and sends it to the client.
4. The client encrypts this challenge with the hash of the user's password and returns the result to the server. This is called the _response_.
5. The server sends the following three items to the domain controller:
    - User name
    - Challenge sent to the client
    - Response received from the client
6. The domain controller uses the user name to retrieve the hash of the user's password from the Security Account Manager database. It uses this password hash to encrypt the challenge.
7. The domain controller compares the encrypted challenge it computed (in step 6) to the response computed by the client (in step 4). If they are identical, authentication is successful.