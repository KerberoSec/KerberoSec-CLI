# Overview

The Authentication Services protocols verify the identity of users, computers, and services through the interactive logon and network logon authentication processes. Once authenticated, these entities can be authorized to access network resources securely.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/953d700a-57cb-4cf7-b0c3-a64f34581cc9" %}

## Introduction

<figure><figcaption></figcaption></figure>

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/523ed32c-3a6c-4a3d-b50b-bb99e321c2eb" %}

## Security Principal

An entity with an identity that can be authenticated.

### Types

A security principal can be

* a user
* an autonomous program within the system, such as a logging daemon, a system backup program, or a network application.
* a computer, a service, or a security group that represents a set of users

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/3bebc365-e744-4852-b5e8-38afbea2178b" %}

### Security Identifier (SID)

Windows uses a [security identifier (SID)](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_83f2020d-0804-4840-a5ac-e06439d50f8d), composed of

* an account authority portion (typically a [domain](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_b0276eb2-4e65-4cf1-a718-e0920a614aca)) and
* a smaller integer representing an identity relative to the account authority termed the relative identifier (RID)

as an identity of a security principal.

### Account Database

An account database maintains the [security principals](overview.md#security-principal) and necessary information for authentication and other purposes.

* an [Active Directory database](../ad/adds/#account-database) maintains the domain security principals, whereas
* the [security account manager (SAM) built-in database](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_6bb6ffcf-2a22-4989-89ef-6c9937f91b8b) maintains local security principals

## Generic Security Services (GSS)

GSS API decoupled application protocols from authentication protocols by providing an abstraction layer between application-level protocols and _security protocols_.

The Windows implementation, SSPI, thus also allows an application to use various security models available on a computer or network without changing the interface to the security system.

> SSPI is the Windows equivalent of GSS-API, and the two sets of APIs are on-the-wire \
> compatible; hence the terms GSS-API and SSPI are used interchangeably.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/6eab8c24-0c05-4d34-9a83-3903365d069d" %}

### Security Token

In the GSS style or model, the authentication protocol produces opaque messages that are known as [security tokens](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_6b49ccf2-3d93-4d1e-9ecd-e5e7873eec24). The application protocol is responsible for security token exchange between sender and receiver _but does not parse or interpret the security tokens._

For example, Kerberos tickets.

### Authentication Service

The Authentication Services protocols provide authentication services to client and server applications.

Client and server applications interact with

* the [Authentication Client](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_e67f665e-7970-422b-b471-cb33147c0641) and
* [Authentication Server](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_3ca15667-25b2-495d-a86f-2f37135f7b05)

_components of Authentication Services respectively_.

<figure><figcaption><p>GSS API decoupled application protocols from authentication protocols.</p></figcaption></figure>

### Authentication Process

1. <mark style="color:green;">The client application</mark> contacts the local Authentication Client through a generic interface that abstracts the underlying authentication protocols for creating a security token.
2. The Authentication Client creates a security token with the help of the underlying authentication protocols and returns it to the calling <mark style="color:green;">application</mark>.
3. <mark style="color:green;">The client application</mark> embeds the security token within application messages of the application protocol and transmits them as an authentication request to <mark style="color:red;">the server side of the application</mark>.
4. On receipt of the authentication messages, <mark style="color:red;">the server application</mark> extracts the security token and supplies it to the Authentication Server.
5. The Authentication Server processes the security token with the help of the underlying authentication protocols and generates a response _determining whether that authentication is complete for_ the <mark style="color:red;">server-side application</mark>.
6. If another security token is generated, <mark style="color:red;">the server-side application</mark> sends it back to <mark style="color:green;">the client</mark>, where the process continues.

When authentication is complete, session-specific security services are available.

### Simple and Protected GSS-API Negotiation Mechanism (SPNEGO)

When Microsoft adopted the Kerberos protocol for Windows and moved away from [NT LAN Manager (NTLM) Protocol](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_fff710f9-e3d1-4991-99a2-009768d57585), Microsoft chose to insert a protocol, in this case, SPNEGO, to allow _security protocol selection and extension_.

SPNEGO is an authentication _mechanism_ that allows [Generic Security Services (GSS)](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_95f6b299-ec2f-4cef-87df-217f95bd9e14) peers to determine whether their credentials support a common set of GSS-API security mechanisms

* to negotiate different options within a given security mechanism or different options from several security mechanisms
* to select a service, and
* to establish a [security context](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_88d49f20-6c95-4b64-a52c-c3eca2fe5709) among themselves using that service.

{% embed url="https://www.rfc-editor.org/rfc/rfc4178.txt" %}
\[RFC4178] The Simple and Protected Generic Security Service Application Program Interface (GSS-API) Negotiation Mechanism
{% endembed %}

## Security Support Provider Interface (SSPI)

The [Security Support Provider Interface (SSPI)](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_fb216516-748b-4873-8bdd-64c5f4da9920) is the Windows-specific API _implementation of the GSS-style authentication model_.

SSPI is implemented as DLLs containing SSPs for different types of authentication protocols.

SSPI provides the means for connected network applications to call _one of several_ [_security support providers (SSPs)_](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_e0edad22-1b0e-42f3-8e51-50f8aa30b29a), associated with different authentication protocols, to establish authenticated connections and to exchange data securely over those connections.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/secauthn/sspi" %}

### Security Support Package (SSP)

Both the client and server versions of Windows implement standard authentication protocols including:

* [Kerberos](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_d6a282ce-b1da-41e1-b05a-22f777a5c1fe),
* [Transport Layer Security (TLS)](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_f2bc7fed-7e02-4fa5-91b3-97f5c978563a), and
* Simple and Protected _Generic Security Service Application Program Interface_ ([GSS](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_95f6b299-ec2f-4cef-87df-217f95bd9e14)-API) Negotiation Mechanism ([SPNEGO](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/64781df1-ee20-413e-b8c5-6511c90dbc30#gt\_bc2f6b5e-e5c0-408b-8f55-0350c24b9838)),
* and their extensions, as specified in [\[MS-KILE\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/2a32282e-dd48-4ad9-a542-609804b02cc9), [\[MS-TLSP\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-tlsp/58aba05b-62b0-4cd1-b88b-dc8a24920346), [\[MS-SPNG\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-spng/f377a379-c24f-4a0f-a3eb-0d835389e28a), and [\[MS-NEGOEX\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-negoex/0ad7a003-ab56-4839-a204-b555ca6759a2) respectively.

as part of an extensible architecture that _consists of security support provider (SSP) security packages_ to enable the authentication of users, computers, and services. The authentication process, in turn, enables authorized users and services to access resources securely.

Each SSP provides mappings between the SSPI function calls of an application and the functions of an actual security model.

## Windows Negotiate

A security support provider (SSP) acts as an application layer between Security Support Provider Interface (SSPI) _and the other SSPs_.

Negotiate analyzes the request and picks the best SSP to handle the request _based on customer-configured security policy._

### Kerberos & NTLM

Currently, the Negotiate security package selects between [Kerberos](https://learn.microsoft.com/en-us/windows/win32/secauthn/microsoft-kerberos) and [NTLM](https://learn.microsoft.com/en-us/windows/win32/secauthn/microsoft-ntlm). Negotiate selects Kerberos unless one of the following conditions applies:

* It can't be used by one of the systems involved in the authentication.
* The calling app didn't provide sufficient information to use Kerberos.

To allow Negotiate to select the [Kerberos](https://learn.microsoft.com/en-us/windows/win32/secauthn/microsoft-kerberos) security provider, the client app must provide one of the following:

* A [_service principal name_](https://learn.microsoft.com/en-us/windows/win32/secgloss/s-gly) (SPN).
* A user principal name (UPN).
* A NetBIOS account name as the target name.

Otherwise, Negotiate always selects the [NTLM](https://learn.microsoft.com/en-us/windows/win32/secauthn/microsoft-ntlm) security provider.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/secauthn/microsoft-negotiate" %}
