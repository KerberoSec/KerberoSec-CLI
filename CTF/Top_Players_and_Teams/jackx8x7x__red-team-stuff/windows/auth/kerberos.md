# Kerberos

## Introduction

The Kerberos protocol defines how clients interact with a network authentication service.

On the other hand, authorization is accomplished using [Privilege Attribute Certificate (PAC)](kerberos.md#privilege-attribute-certificate-pac) data.

### Kerberos Tickets

Clients obtain tickets from the [Kerberos Key Distribution Center (KDC)](../ad/kdc.md), which uses Active Directory as its [account database](overview.md#account-database), and they present these tickets to servers, _as network credentials_.

### Ticket-Granting Ticket

_Originally,_ The client used his _master key_ which is derived from the user password to decrypt session keys received from KDC.

To avoid users to enter their passwords frequently, the protocol introduces the usage of the ticket.

When a user logs on, the client [requests a ticket](kerberos.md#authentication-service) for the KDC just _as it would request a ticket for any other service_. The KDC responds by creating _**a logon session key**_ and _**a ticket**_ for the KDC's full [ticket-granting service](kerberos.md#tgs-exchange).

{% embed url="https://learn.microsoft.com/en-us/windows/win32/secauthn/ticket-granting-tickets" %}

### GSS API

Applications that use AP exchange messages directly are typically called "kerberized" applications. Most applications use the [Generic Security Service Application Program Interface](overview.md#generic-security-services-gss) (GSS-API) and can even be wrapped by higher-level abstractions such as Simple Authentication and Security Layer (SASL) [\[RFC2222\]](https://go.microsoft.com/fwlink/?LinkId=90322).

When an application wants to use Kerberos-based authentication, it uses either the higher-level [SSPI](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/e720dd17-0703-4ce4-ab66-7ccf2d72c579#gt\_fb216516-748b-4873-8bdd-64c5f4da9920) API to invoke Kerberos directly; or it uses SPNEGO [\[MS-SPNG\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-spng/f377a379-c24f-4a0f-a3eb-0d835389e28a), which in turn invokes Kerberos.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/acaecbb9-28fa-4881-88ae-ff34ddb87b09" %}

### MS-KILE Extension

Microsoft extend the Keberos authorization data to provide the server with additional information such as:

* Group membership
* Claims
* Interactive logon information
* Integrity levels

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/27e4854f-1aa5-4f67-8f50-ab745dd85c3a" %}

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/dddd6a90-5d6c-44e7-9081-75a468795986" %}

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-pac/166d8064-c863-41e1-9c23-edaaa5f36962" %}

### Realm

A collection of key distribution centers (KDCs) with a common set of principals, as described in \[RFC4120] section 1.2.

An administrative boundary that uses one set of authentication servers to manage and deploy a single set of unique identifiers.

A realm is a unique logon space.

## Authentication Service

Kerberos V5 is composed of three exchanges:

* The Authentication Service (AS) exchange
* The Ticket-Granting Service (TGS) exchange
* The Client/Server Authentication Protocol (AP) exchange

<figure><figcaption></figcaption></figure>

The AS exchange and TGS exchange are transported by Kerberos implementations. The AP exchange is passive and relies on an upper-layer application protocol to carry the AP exchange messages.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/b4af186e-b2ff-43f9-b18e-eedb366abf13" %}

### Format

The ticket formats are defined in [\[RFC4120\] section 5.3](https://datatracker.ietf.org/doc/html/rfc4120#section-5.3).

The exchange message format is defined in [\[RFC4120\] section 5.4](https://datatracker.ietf.org/doc/html/rfc4120#section-5.4)  using the ASN.1.

Also, we can consume the code in Impakct packages to understand the protocol:

```python
from pyasn1.type import tag, namedtype, univ, constraint, char, useful
...
class KDC_REQ(univ.Sequence):
    componentType = namedtype.NamedTypes(
        _vno_component(1),
        _msg_type_component(2, (constants.ApplicationTagNumbers.AS_REQ.value,
                                constants.ApplicationTagNumbers.TGS_REQ.value)),
        _sequence_optional_component('padata', 3,
                                     univ.SequenceOf(componentType=PA_DATA())),
        _sequence_component('req-body', 4, KDC_REQ_BODY())
        )

class AS_REQ(KDC_REQ):
    tagSet = _application_tag(constants.ApplicationTagNumbers.AS_REQ.value)

class TGS_REQ(KDC_REQ):
    tagSet = _application_tag(constants.ApplicationTagNumbers.TGS_REQ.value)
```

Both `KRB_TGS_REQ` and `KRB_AS_REQ` have a common structure as the [`KRB_KDC_REQ`](https://datatracker.ietf.org/doc/html/rfc4120#section-5.4.1) message.&#x20;

On the other hand, the [`KRB_KDC_REP`](https://datatracker.ietf.org/doc/html/rfc4120#section-5.4.2) message format is used for the reply from the KDC for either an initial (AS) request or a subsequent (TGS) request.

### AS Exchange

{% tabs %}
{% tab title="KRB_AS_REQ" %}
The client presents its principal name and [_shall_](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/de260077-1955-447c-a120-af834afe45c2) present pre-authentication information (\[RFC4120] sections [5.2.7](https://datatracker.ietf.org/doc/html/rfc4120#section-5.2.7) and [7.5.2](https://datatracker.ietf.org/doc/html/rfc4120#section-7.5.2)) in the `KRB_AS_REQ` message to request a ticket-granting ticket (TGT) from the KDC (\[RFC4120] section 5.3).

#### Pre-authentication

By [tracing the packets seen in the Kerberos process](logon.md#packet-tracing), we can see that the first `KRB_AS_REQ` message contains `PA-PAC-REQUEST` as the padata, then a second `KRB_AS_REQ` is sent with `pa-enc-timestamp` padata if the Kerberos client receives an error message when pre-authentication is required.

Refer to [the code](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/kerberosv5.py#L192) in the Kerberos implementation of function `getKerberosTGT` in Impacket, we see the Kerberos client is expecting a Kerberos error message:

```python
    # This should be the PREAUTH_FAILED packet or the actual TGT if the target principal has the
    # 'Do not require Kerberos preauthentication' set
    preAuth = True
    try:
        asRep = decoder.decode(r, asn1Spec = KRB_ERROR())[0]
    except:
        # Most of the times we shouldn't be here, is this a TGT?
        asRep = decoder.decode(r, asn1Spec=AS_REP())[0]
        # Yes
        preAuth = False
```

Then it [computes the encrypted timestamp](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/kerberosv5.py#L255) using the client's key to prepare the padata to be sent in the second `KRB_AS_REQ` to demonstrate its knowledge of the user's key.

```python
        # Let's build the timestamp
        timeStamp = PA_ENC_TS_ENC()

        now = datetime.datetime.utcnow()
        timeStamp['patimestamp'] = KerberosTime.to_asn1(now)
        timeStamp['pausec'] = now.microsecond

        # Encrypt the shyte
        encodedTimeStamp = encoder.encode(timeStamp)

        # Key Usage 1
        # AS-REQ PA-ENC-TIMESTAMP padata timestamp, encrypted with the
        # client key (Section 5.2.7.2)
        encriptedTimeStamp = cipher.encrypt(key, 1, encodedTimeStamp, None)
```
{% endtab %}

{% tab title="KRB_AS_REP" %}
The KDC returns _a TGT and a session key_ the client can use to encrypt and authenticate communication with the KDC _for ticket-granting service (TGS) requests in the TGS exchange_, without reusing the persistent key.

#### Ticket-Granting Ticket

The ticket_, with the logon session key embedded in it,_ is [encrypted with the KDC's master key](https://datatracker.ietf.org/doc/html/rfc4120#section-5.4.2).

#### Session Key

The logon session key is contained in [an encrypted part](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/asn1.py#L278), encrypted _with the user's master key_ derived from the user's logon password, in the [`KRB_AS_REP`](https://datatracker.ietf.org/doc/html/rfc4120#section-5.4.2) message.

Refer to [the code implementation](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/kerberosv5.py#L325) in Impacket, we can see that the Kerberos client can decrypt the encrypted part to get the logon session key for further usage in [the TGS exchange](kerberos.md#session-key-1):

```python
    # So, we have the TGT, now extract the new session key and finish
    cipherText = asRep['enc-part']['cipher']
...
    # Key Usage 3
    # AS-REP encrypted part (includes TGS session key or
    # application session key), encrypted with the client key
    # (Section 5.4.2)
    try:
        plainText = cipher.decrypt(key, 3, cipherText)
    except InvalidChecksum as e:
        # probably bad password if preauth is disabled
        if preAuth is False:
            error_msg = "failed to decrypt session key: %s" % str(e)
            raise SessionKeyDecryptionError(error_msg, asRep, cipher, key, cipherText)
        raise
    encASRepPart = decoder.decode(plainText, asn1Spec = EncASRepPart())[0]

    # Get the session key and the ticket
    cipher = _enctype_table[encASRepPart['key']['keytype']]
    sessionKey = Key(cipher.enctype,encASRepPart['key']['keyvalue'].asOctets())
```
{% endtab %}
{% endtabs %}

{% embed url="https://datatracker.ietf.org/doc/html/rfc4120#section-3.1" %}

### TGS Exchange

{% tabs %}
{% tab title="KRB_TGS_REQ" %}
The client [_presents the TGT_](https://datatracker.ietf.org/doc/html/rfc4120#section-5.4.1), a [Kerberos authenticator](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/e720dd17-0703-4ce4-ab66-7ccf2d72c579#gt\_4ad68485-ee2b-49ab-a9a7-6c343bce39c6), and the [service principal name (SPN)](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/e720dd17-0703-4ce4-ab66-7ccf2d72c579#gt\_547217ca-134f-4b43-b375-f5bca4c16ce4) in the request sent to the KDC for a service ticket for the server.

#### Kerberos Authenticator

A timestamp encrypted with the TGS session key derived in the `KRB_AS_REP` used to demonstrate the knowledge of the session key in the accompanying ticket.

The authenticator is embedded in a `KRB_AP_REQ` carried by the `KRB_TGS_REQ` message as a `PA_TGS_REQ` padata field, refer to the [\[RFC4120\] section 5.5.1](https://datatracker.ietf.org/doc/html/rfc4120#section-5.5.1).

Implementation in the function [`getKerberosTGS`](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/kerberosv5.py#L384) of the Impacket package:

```python
    # Key Usage 7
    # TGS-REQ PA-TGS-REQ padata AP-REQ Authenticator (includes
    # TGS authenticator subkey), encrypted with the TGS session
    # key (Section 5.5.1)
    encryptedEncodedAuthenticator = cipher.encrypt(sessionKey, 7, encodedAuthenticator, None)
...
    apReq['authenticator']['cipher'] = encryptedEncodedAuthenticator
    encodedApReq = encoder.encode(apReq)
...
    tgsReq['padata'][0]['padata-type'] = int(constants.PreAuthenticationDataTypes.PA_TGS_REQ.value)
    tgsReq['padata'][0]['padata-value'] = encodedApReq
```

#### Ticket-Granting Ticket

Contained in the padata of an encoded AP-REQ request body as seen in the [\[RFC4120\] section 5.2.7.1](https://datatracker.ietf.org/doc/html/rfc4120#section-5.2.7.1).

Implementation in the function [`getKerberosTGS`](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/kerberosv5.py#L373) of the Impacket package:
{% endtab %}

{% tab title="KRB_TGS_REP" %}
The KDC validates the TGT (\[RFC4120]  section 5.3) and the [authenticator](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/e720dd17-0703-4ce4-ab66-7ccf2d72c579#gt\_e72a2c02-84a2-4ce3-b66f-86f725642dc3) (\[RFC4120] section 5.5.1). If these are valid, the KDC returns a [service ticket](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/e720dd17-0703-4ce4-ab66-7ccf2d72c579#gt\_b4041466-ae24-4fd4-83e4-5dbc4f32aaab) (\[RFC4120] section 5.3) and session key the client can use to encrypt communication with the server.

#### Session Key

As in the `KRB_AS_REP` message, a new session key is contained in the encryption part, encrypted by the TGS session key this time, of the `KRB_TGS_REP` message.

See the example code in [Impacket](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/krb5/kerberosv5.py#L446).

The new session key is used in the AP exchange, for example like [this](https://github.com/fortra/impacket/blob/8b3f9eff06b3a14c09e8e64cfc762cf2adeed013/impacket/smb.py#L3251).
{% endtab %}
{% endtabs %}

{% embed url="https://datatracker.ietf.org/doc/html/rfc4120#section-3.3" %}

### AP Exchange

{% tabs %}
{% tab title="KRB_AP_REQ" %}
The client presents the ticket (\[RFC4120] section 5.3) and a new authenticator (\[RFC4120] section 5.5.1). The server will decrypt the ticket, validate the authenticator, and can use any [authorization data](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/e720dd17-0703-4ce4-ab66-7ccf2d72c579#gt\_0eef5aca-03f3-4b09-b79b-cdf7f730ad89) (\[RFC4120] section 5.2.6) contained in the ticket for access control.
{% endtab %}

{% tab title="KRB_AP_REP" %}
Optionally, the client might request that the server verify its own identity. If mutual authentication is requested, the server returns the client's timestamp from the authenticator encrypted with the session key.
{% endtab %}
{% endtabs %}

## Service Principal Name (SPN)

A unique identifier associates a _service instance_ with a service sign-in account.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/ad/service-principal-names" %}

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/04033bd5-913c-4c78-a398-b549b09e65d9" %}

### Format

An SPN must be unique in a forest in which it is registered.

```C++
<service class>/<host>:<port>/<service name>
```

{% embed url="https://learn.microsoft.com/en-us/windows/win32/ad/name-formats-for-unique-spns" %}

Common service classes can be found here:

{% embed url="https://adsecurity.org/?page_id=183" %}

### Registration

Typically, SPN registration is done by a service installation program running with domain administrator privileges.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/ad/how-a-service-registers-its-spns" %}

## Privilege Attribute Certificate (PAC)

The Privilege Attribute Certificate (PAC) was created _to provide the authorization data_, which the Kerberos protocol doesn't provide, for Kerberos Protocol Extensions \[MS-KILE].

Into the PAC structure \[MS-KILE] encodes authorization information, which consists of group memberships, additional credential information, profile, and policy information, and supporting security metadata.

The Kerberos protocol allows a field within the Kerberos ticket to carry authorization information, and Windows uses that field to carry information about Windows groups.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-pac/c38cc307-f3e6-4ed4-8c81-dc550d96223c" %}

## Keytab File

### Creation

{% tabs %}
{% tab title="Command `ktpass`" %}
We can use the command `ktpass` on windows to

* configure the server principal name for the host or service in Active Directory Domain Services (AD DS) and
* generate a .keytab file that contains the shared secret key of the service.

<pre data-overflow="wrap"><code><strong>C:\> ktpass /princ host/User1.contoso.com@CONTOSO.COM /mapuser User1 /pass MyPas$w0rd /out machine.keytab /crypto all /ptype KRB5_NT_PRINCIPAL /mapop set
</strong></code></pre>

{% embed url="https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ktpass" %}
{% endtab %}

{% tab title="Command `kutil`" %}

On Linux, we can use command `kutil`.

```
>ktutil
ktutil: addent -password -p username/domain.com@DOMAIN.COM -k <kvno> -e rc4-hmac
ktutil: wkt ./keytab.file
ktutil: quit
```
{% endtab %}
{% endtabs %}

