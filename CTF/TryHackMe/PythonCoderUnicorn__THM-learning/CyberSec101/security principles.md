https://tryhackme.com/r/room/securityprinciples

#FreeRoom 

# Security Principles

## CIA 

confidentiality . integrity . availability

- Confidentiality ensures that only the intended persons or recipients can access the data.
- Integrity aims to ensure that the data cannot be altered; moreover, we can detect any alteration if it occurs.
- Availability aims to ensure that the system or service is available when needed.

- Authenticity: Authentic means not fraudulent or counterfeit. Authenticity is about ensuring that the document/file/data is from the claimed source.

- Nonrepudiation: Repudiate means refusing to recognize the validity of something. Nonrepudiation ensures that the original source cannot deny that they are the source of a particular document/file/data. This characteristic is indispensable for various domains, such as shopping, patient diagnosis, and banking.

The need to tell authentic files or orders from fake ones is indispensable. Moreover, ensuring that the other party cannot deny being the source is vital for many systems to be usable.

Donn Parker proposed the Parkerian Hexad, a set of six security elements. They are:

```
Availability
Utility
Integrity
Authenticity
Confidentiality
Possession
```

- Utility: Utility focuses on the usefulness of the information. For instance, a user might have lost the decryption key to access a laptop with encrypted storage. Although the user still has the laptop with its disk(s) intact, they cannot access them. In other words, although still available, the information is in a form that is not useful, i.e., of no utility.

- Possession: This security element requires that we protect the information from unauthorized taking, copying, or controlling. For instance, an adversary might take a backup drive, meaning we lose possession of the information as long as they have the drive. Alternatively, the adversary might succeed in encrypting our data using ransomware; this also leads to the loss of possession of the data.

## DAD 

Disclosure . Alteration. Destruction/ Denial

- Disclosure is the opposite of confidentiality.
- Alteration is the opposite of Integrity
- Destruction/Denial is the opposite of Availability
- 

## fundamental concepts of security models

- CIA triad 

foundational security models:

- Bell-LaPadula Model
- The Biba Integrity Model
- The Clark-Wilson Model

### Bell LaPadula model

3 rules

- simple security property = property is "no read up", a subject at a lower security level cannot read an object at a higher security level
- star security property = "no write down",  a subject at a higher security level cannot write to an object at a lower security level.
- discretionary-security property = uses an access matrix to allow read and write operations

> “write up, read down.” 

### Biba model 

2 main rules

- simple integrity property = "no read down", higher integrity subject should not read from lower 
- start integrity property = "no write up", a lower integrity subject should not write to a higher 

> “read up, write down.”

### Clark-Wilson Model

- Constrained Data Item (CDI): This refers to the data type whose integrity we want to preserve.

- Unconstrained Data Item (UDI): This refers to all data types beyond CDI, such as user and system input.

- Transformation Procedures (TPs): These procedures are programmed operations, such as read and write, and should maintain the integrity of CDIs.

- Integrity Verification Procedures (IVPs): These procedures check and ensure the validity of CDIs.

## ISO/IEC 19249

```
International Organization for Standardization (ISO)
International Electrotechnical Commission (IEC)
```

### 5 architectural principles:

1. `domain separation` = every set of related components is grouped as a single entity (apps, data, etc) and will have its own domain and assigned common set of security attributes. {included in Goguen-Meseguer Model}

2. `layering` =  a system is structured into many abstract levels allows for imposing security policies at different levels & validate operation. (OSI model 7 layers)

3. `encapsulation` = (OOP) hide low level implementations and prevent direct manipulation of the data in an object by providing specific methods for that purpose. {clock object that increment()} {an API to access data}

4. `redundancy` = this principle ensures availability and integrity. {hardware servers with 2 power supplies}

5. `virtualization` = cloud services, sharing single hardware with many operating systems, sandboxing capabilities

### 5 design principles:

1. `lest privilege` = the 'need-to-know-basis', least amount of permissions

2. `attack surface minimization` = Every system has vulnerabilities that an attacker might use to compromise a system. These vulnerabilities represent risks that we should aim to minimize

3. `centralized parameter validation` = Many threats are due to the system receiving input, especially from users.  Invalid inputs can be used to exploit vulnerabilities in the system (DOS or RCE). parameter validation is a necessary step to ensure the correct system state. Considering the number of parameters a system handles, the validation of the parameters should be centralized within one library or system.

4. `Centralized General Security Services` = we should aim to centralize all security services. create a centralized server for authentication, prevent creating a single point of failure

5. `Preparing for Error and Exception Handling` = principle teaches that the systems should be designed to fail safe. (if a firewall crashes, it should block all traffic instead of allowing all traffic.)

## zero trust 

_Trust but verify_ & _zero trust_

Trust but Verify: This principle teaches that we should always verify even when we trust an entity and its behaviour.

Zero Trust: This principle treats trust as a vulnerability, and consequently, it caters to insider-related threats. After considering trust as a vulnerability, zero trust tries to eliminate it. It is teaching indirectly, “never trust, always verify.”

- every entity is considered adversarial until proven otherwise.

Authentication and authorization are required before accessing any resource

## threat vs risk

- Vulnerability: Vulnerable means susceptible to attack or damage. In information security, a vulnerability is a weakness.

- Threat: A threat is a potential danger associated with this weakness or vulnerability.

- Risk: The risk is concerned with the likelihood of a threat actor exploiting a vulnerability and the consequent impact on the business.

