# Domain Service

## Overview

AD DS_, a directory service_ stores and publishes information about Active Directory objects such as users, groups, computers, domains, organizational units, and security policies for use by users and administrators in a hierarchical structure.

Active Directory is either deployed as [AD DS](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-adts/b645c125-a7da-4097-84a1-2fa7cea07714#gt\_2e72eeeb-aee9-4b0a-adc6-4476bacf5024) or as [AD LDS](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-adts/b645c125-a7da-4097-84a1-2fa7cea07714#gt\_afdbd6cd-9f55-4d2f-a98e-1207985534ab).

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/be604ce1-ee5a-40bb-beeb-d00e7aa5cbf5" %}

{% embed url="https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc758436(v=ws.10)" %}

### Domain Controller

Domain controllers in a domain participate in replication and contain a complete copy of all directory information for their domain.

The DCs interoperate as peers to ensure that a local change to an object replicates correctly across DCs.

AD DS is implemented as `Ntdsa.dll` running in the `Lsass` process on the DC.

### RootDSE

The logical root of a directory server, whose distinguished name (DN) is the empty string (nameless entry).

The purpose of the rootDSE is to provide data about the directory server. As a mechnism for clients of an LDAP server to interact with the server itself, rather than with particular objects contained by the server. The rootDSE is not part of any namespace

The rootDSE contains the configuration status of the server, it contains attributes that represent the features, capabilities, and extensions provided by the particular server.

> Access to this entry is typically available to _unauthenticated clients_.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/adschema/rootdse" %}

## Data Store

The Active Directory directory service uses a data store for all directory information. This data store is often referred to as the _directory_.

The directory is stored on domain controllers and can be accessed by network applications or services.

{% embed url="https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc736627(v=ws.10)" %}

### File `Ntds.dit`

Directory data is stored in the `Ntds.dit` file on the domain controller.

### Partition

Directory partitions are also known as _naming contexts_.

A directory partition is a contiguous portion of the overall directory that has independent replication scope and scheduling data.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/ad/naming-contexts-and-partitions" %}

### Default Partitions

Data is stored on each domain controller in the directory store, which is divided logically into four distinct directory partition types to store and copy different types of data:

* domain
* configuration
* schema
* application data.

{% tabs %}
{% tab title="Domain" %}
All domain controllers within a particular domain hold a replica of the domain partition for their domain.
{% endtab %}

{% tab title="Configuration" %}
All domain controllers within a forest hold a replica of _the schema and configuration partitions for that forest_.
{% endtab %}

{% tab title="Schema" %}

{% endtab %}

{% tab title="Application Data" %}
Application directory partitions hold directory data specific to a particular application and can be stored by domain controllers belonging to different domains.
{% endtab %}
{% endtabs %}

## Naming

{% embed url="https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc739093(v=ws.10)" %}

## Account Database

An account database maintains the [security principals](../../auth/overview.md#security-principal) and necessary information for authentication and other purposes.

### Password Attributes

> Also, while section 6.2 of \[RFC2829] specifies that an object possessing a `userPassword` attribute is a _prerequisite_ to being able to perform a simple bind using that object's credentials, Active Directory _does not_ use the `userPassword` attribute to store the user's password in most cases, and possession of such an attribute is not a prerequisite to performing a simple bind against an object.

Access to the password attribute of an account object is granted only to the account holder, never to anyone else, not even administrators. Only processes with Trusted Computing Base privilege: processes running in the security [_context_](https://learn.microsoft.com/en-us/windows/desktop/SecGloss/c-gly) of the LSA: are allowed to read or change password information.

The password attribute of an account object is further protected by a second encryption using a system key.

{% embed url="https://learn.microsoft.com/en-us/windows/win32/secauthn/account-database" %}

## Replication

Changes made to the directory on one domain controller are replicated to other domain controllers in the domain, domain tree, or forest.

Private directory data is stored securely, and public directory data is stored on a _shared system volume_ where it can be replicated to other domain controllers in the domain.

{% embed url="https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc737144(v=ws.10)" %}

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-drsr/06205d97-30da-4fdc-a276-3fd831b272e0" %}

### Site

Sites, defined as groups of well-connected computers, determine how directory data is replicated.

Active Directory relies on the concept of sites within where Active Directory replicates directory information more frequently to help keep replication efficient.

The domain controllers in other sites also receive the changes, but less frequently.

[Microsoft Learn: Sites overview](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc782048\(v=ws.10\))

### Partition

Changes to each directory partition are replicated to all other domain controllers that hold a copy of that partition.

## Management

### Ntdsutil

[Microsoft Learn: Ntdsutil](https://learn.microsoft.com/en-us/previous-versions/orphan-topics/ws.10/cc755915\(v=ws.10\)?redirectedfrom=MSDN)\
[LOLBAS: Ntdsutil.exe](https://lolbas-project.github.io/lolbas/OtherMSBinaries/Ntdsutil/)

## Security

Security is integrated with Active Directory through

* logon authentication
* access control to objects in the directory.

### Access Control

Every object in Active Directory has an [nTSecurityDescriptor](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-ada3/b4a3c9be-5388-4e0d-9f5e-96d21a801a3f) [attribute](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-adts/b645c125-a7da-4097-84a1-2fa7cea07714#gt\_108a1419-49a9-4d19-b6ca-7206aa726b3f) whose value is the security descriptor that contains _access control information for the object_. A [DC](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-adts/b645c125-a7da-4097-84a1-2fa7cea07714#gt\_76a05049-3531-4abd-aec8-30e19954b4bd) performs an [access check](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-adts/b645c125-a7da-4097-84a1-2fa7cea07714#gt\_d7906f17-bb2c-4193-a3f0-848bcc351dec) to determine whether the security context, and thus the requester, is authorized for the type of access that has been requested before allowing any further processing to continue.

* Security Context
* Security Descriptor

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/2f146d9e-393d-4c90-a9c7-780b73884a60" %}

### Security Descriptor

An object or its attributes may not be visible to a requester if the requester is not granted the necessary rights.

Two types of ACEs used here:

* Simple\
  A simple ACE applies to an entire object.
* Object-specific\
  An object-specific ACE, on the other hand, can apply to any individual attribute of an object or to a set of attributes.

## Reference

[Microsoft Learn: Active Directory Domain Services Overview](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview)\
[Microsoft Learn: Understanding Active Directory](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc781408\(v=ws.10\))
