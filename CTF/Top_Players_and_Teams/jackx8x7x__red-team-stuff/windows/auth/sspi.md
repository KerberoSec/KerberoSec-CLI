# Security Support Provider Interface

## Introduction
Security Support Provider Interface (SSPI) allows an application to use *various security models* available on a computer or network *without changing the interface* to the security system.

https://learn.microsoft.com/en-us/windows/win32/secauthn/sspi-model  

## Security Support Provider
A security support provider (SSP) is contained in a dynamic-link library (DLL) that implements SSPI.

The DLL makes one or more *security packages* available to applications.

### Windows Negotiate
If the app specifies Negotiate, Negotiate analyzes the request and *picks the best SSP to handle the request* based on customer-configured security policy.

The Negotiate security package selects between Kerberos and NTLM. Negotiate selects Kerberos unless it cannot be used by one of the systems involved in the authentication.

### Windows NTLM
NTLM is still supported and must be used for logon authentication on stand-alone systems.

### Windows Kerberos
As NTLM, application should use the *Negotiate security package* instead of accessing the Kerberos security package directly

https://learn.microsoft.com/en-us/windows/win32/secauthn/sspi-model  

## Security Packages
The security packages provide mappings between the SSPI function calls of an application and the functions of an actual security model, *Windows Kerberos* for example.
