# Certificate Service

Active Directory Certificate Services (AD CS), Microsoft’s Active Directory Public Key Infrastructure (PKI) implementation, provides everything including:

* encrypting file systems
* digital signatures
* user authentication

> AD CS is not installed by default but deployed widely.

{% embed url="https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/active-directory-certificate-services-overview" %}

## Overview

A server role, introduced in Windows 2000, can be deployed in one of two configurations:

* a standalone certification authority (CA)
* an enterprise CA that _integrates with AD_

## Trust Store

All ADCS-related containers are stored in [the configuration naming context](adds/#default-partitions) under Public Key Services container, hence all domain controllers within a forest hold a replication of the content.

```
CN=Public Key Services, CN=Services, CN=Configuration, DC={forest root domain}
```

### Certification Authorities

A container contains trusted root certificates propagated to _the Trusted Root Certification Authorities certificate store_ on each Windows machine.

To consider a certificate as trusted, the certificate’s trust chain must eventually end with one of the root CA’s defined in this container.

### Enrollment Services

This container is used to store Enterprise CA objects. Clients use this container to locate Enterprise CAs in the forest.

Enterprise CA certificates are propagated to _the Intermediate Certification Authorities certificate store_ on each Windows machine.

### NTAuthCertificates

This container defines CA certificates that enable authentication to AD

### AIA

This container holds the AD objects of intermediate and cross CAs

### Certificate Templates

This container contains enterprise certificate templates used by Enterprise CAs.

{% embed url="https://www.pkisolutions.com/understanding-active-directory-certificate-services-containers-in-active-directory/" %}

## Certificate Enrollment

Users obtain certificates from CA based on the objects in the _Enrollment Services container_ through the certificate enrollment process.

### Certificate Template

AD CS Enterprise CAs issue certificates with settings defined by certificate templates.

AD CS specifies that a certificate template is enabled on an Enterprise CA by adding the template’s name to the `certificatetemplates` field of the AD object with objectClass of `pKIEnrollmentService`.

### Extended Key Usages (EKU)
