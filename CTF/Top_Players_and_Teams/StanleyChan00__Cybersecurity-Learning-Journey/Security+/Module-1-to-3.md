# Module 1: Fundamental Security Concepts

## Security Concepts

### Information Security 

This part of the lesson went over the CIA Triad, which I covered previously in the TryHackMe Pre Security Course [here](../TryHackMe/Pre-Security/Module-7-Attacks-Defenses.md#the-cia-triad).

### Cyber Security Framework

Within Cybersecurity, there is a sort of framework/blueprint which serves as a general guideline in how we manage our security risks in the digital space. 

They're called "Functions" and are as follows(They're fairly straightforward):

#### 5 Cybersecurity Functions:

1) **Identify**: This involves  identifying risks, threats, vulnerabilities, assets, and more. It's where we take inventory and survey the layout of our environment.
2) **Protect**: These are the factors that act more passively to stop attacks BEFORE they begin like firewalls, antivirus, Multi-Factor Authentication, etc.
3) **Detect**: As opposed to identify, this is where we catch attacks or anomalies AS they happen like through SIEM alerts. 
4) **Respond**: This is where we take action after an attack or incident. We contain any damage, stop the threat, and prevent any damage from getting worse.
5) **Recover**: This is where we heal and restore our systems back to normal(like through backups) and learn from the incident to prevent it from happening again in the future. 

(Note, it seems there is an updated version of these functions to include a 6th function, **"Govern"**, which comprises the organizational structure that provides oversight for the entire Security Operation and manages these other 5 functions.)

### Access Control

This is how we manage the Security of how users interact with our systems. There are 4 elements:

- **Identification:** This is how a user claims a specific identity, like typing in a username.
- **Authentication:** Unlike identification, this is how we CONFIRM the user's identity, like through passwords
- **Authorization:** These are permission levels and limits access to specific resources or systems to specific users. It determines the privilege levels of each user or group.
- **Accounting:** This is when we track the activity of our users and log everything that happens.

## Security Controls

These are the actual mechanisms put into place for the Security Operations of an organization. We classify them in two ways: Categories and "types"(Which entails the functions of what we are trying to achieve). 

### Security Control Categories 

There are 4 categories here:

1) **Managerial:** This is the leadership, oversight, policies, etc that govern the security operation. 
2) **Operational:** These are the day-to-day operations handled by the **people** working to keep the security up on a daily basis.
3) **Technical:** These are the technologies that automatically handle security for us like firewalls, software, hardware, etc.
4) **Physical:** These are the mechanisms which protect us physically rather than digitally. This entails things like gates, security cameras, alarms, etc.

### Security Control Types

There are 6 types of Security Controls.

1) **Preventive:** This prevents an attack from occurring and actively stops it if it happens. For example, like a firewall or a lock. 
2) **Deterrent:** As opposed to preventive which actively blocks attacks, deterrents only discourage attack attempts. This would be like a "No Trespassing" warning sign on private property or a security camera.
3) **Detective:** This identifies when Security events occur and logs it. This would be things like SIEM alerts or motion detectors.
4) **Corrective:** This "corrects" the damage or effect of a security attack, attempting to reverse or mitigate any damage. We also take steps to prevent it from happening again. This would be like restoring a backup. 
5) **Compensating:** When a primary security control is compromised or is not working/sufficient, then this is the alternative that also works to support the security to compensate for that "loss". For example, if we are unable to patch a vulnerability of an app quick enough, we may just block it using the firewall instead. This could also be like a backup generator when the power goes out.
6) **Directive:** This would be us "directing" specific actions of people or handling procedures/setting policies. For example, directing users to store sensitive files into an encrypted/protected folder.

Professor Messer has a nice chart to visualize this below.

<img width="991" height="427" alt="Control Types:Categories Examples" src="https://github.com/user-attachments/assets/17b99a35-9014-40ad-8f87-87b5ac852c52" />

### Information Security Roles and Responsibilities 

These are some of the roles and responsibilities in Information Security. It's quite straightforward.

- **Chief Information Officer(CIO)** and **Chief Security Officer**: They handle the executive responsibilities and overall direction of the organization in regards to security and data.
- **Managers**: They manage the local domains within their specific department and are responsible for enforcing the security policies there
- **Technical Staff**: They handle the actual operational duties of the security. This would be roles like the Information Systems Security Officer(ISSO)
- **Non-Technical Staff**: These are the ordinary workers in the organization whose job in regards to security is to comply with the security directives.
- **Due Care/Liability**: This is the practical execution of our security protocols like training staff, keeping systems updated, etc... Liability is the legal consequences if security fails

### Information Security Business Units

The following 3 units are some of the most common institutional "teams" organized together for specified security.

- **Security Operations Center(SOC)**: This is where SOC analyst lives. It's the heart of defense in detecting and responding to security incidents
- **DevSecOps**: These are the people that manage security during the entire time in which software is being built, ensuring the software is built with the precept of being secure from the onset rather than patched afterwards. 
- **Cyber Incident Response Team(CIRT)**: This is a dedicated, specialized team that goes directly to individual security incidents to handle them.

# Module 2: Comparing Threat Types

Much of this module consists of basic security concepts that can be understood or deduced intuitively. So for value of time and efficiency, I will just be noting what the lessons went over. 

## Threat Actors

This segment essentially just covered different types of threat actors as well as their attributes. 

* Vulnerability + Threat = Risk
* Known threats vs adversary behaviors(Identifiable threats and tools, etc vs how threat actors behave)
* Internal & external threat actors
* High or low capability and funding/resource levels of these threat actors, creating different levels of threats. 
* Various motivations of threat actors: Malicious vs accidental. Chaotic, financial, political, and curious motivations.
* White Hat vs Black Hat Hackers(Authorized "ethical" hackers vs non-authorized hackers)
* Nation-state Actors and Advanced Persistent Threat(APT: gaining unauthorized access and staying undetected for a long time "persistently". Usually done by nation states)
* Organized crime, as well as corporate competition, threat actors

## Attack Surfaces

* What attack surfaces are, the various types of attack surfaces(Like physical, network, application, and human surfaces), as well as threat vectors(Specific method or path of attack)
* Potential software vulnerabilities like flaws in code, delays in patching updates, outdated systems, as well as client-based vs agentless software(Installed software on the device itself vs non-installed software working remotely or as a network protocol, etc)
* Unsecured Network vectors and Potential vulnerabilities in open service ports(See TryHackMe write up on ports [here](../TryHackMe/Pre-Security/Module-2-Networking.md#ports))
* Lure-Based Vectors(Bait, removable devices, executable files, etc)
* Message-based Vectors
* Supply Chain Attack Surface & Managed Service Providers(MSPs: Third party that remotely handles the IT & Security of a company)

## Social Engineering 

* Human-based attack vectors, purposes, and potential scenarios like persuading someone to give up sensitive data
* Impersonation and Pretexting(The script they prepare beforehand to trick you)
* Phising, Vishing(V = Voice), SmiShing(SMS text messages), and Pharming(Sending users to fake websites. Redirecting a URL through DNS spoofing is an example which visually looks like you've got a correct URL typed but the request is poisoned likely through the DNS server which sends you to a fake website).
* Typosquatting(Registering variations of domains of official websites that have been misspelled or looks similar such that whenever someone mistypes that URL, they will be sent to this fake website.) and email spoofing(touched upon [here](../TryHackMe/Pre-Security/Module-3-Web.md#txt-record) in the TryHackMe Web module)

### Watering Hole Attack

If an attacker is unable to get access to someone's network because they are so secure, they could instead attempt a watering hole attack.

Rather than attempting to get into the victim's/organizations network directly, they will instead attack a third party that the victim trusts and uses. By doing so, they can infect or gain access to their target victim. 

For example, say someone wants to attack an employee. However, that employee is very secure on his own and is inaccessible. The attacker notices that he uses a coffee shop web server to order coffee everyday. 

If this attacker could gain access to the coffee shop's web server, they would now have various potential options and attack vectors to infect or attack the employees system. They may target a group of individuals within an organization rather than a singular employee and thus go for a third party website the organization frequently uses, like an industry blog. 

It's like waiting at a lake for an animal to come drink water and killing it there, rather than chasing the animal itself around. 

# Module 3: Cryptography 

Some of the concepts in this module like symmetric/asymmetric encryption were covered already in the TryHackMe course [here](../TryHackMe/Pre-Security/Module-7-Attacks-Defenses.md#cryptography-concepts).

Some quick notes on top of this:

Cryptanalysis: The art of cracking cryptography.

In regards to encryption, the longer the length of the key, the stronger the encryption and the harder it is to crack. It scales exponentially.

Advanced Encryption Standard(AES) is the current most common encryption algorithm. AES-256 uses 256 bits for the key and is thus much stronger than the AES-128 bit version. Larger keys also take more power and time to encrypt. 

## Hashing 

Hashing is when we take data of any length and convert it, using an algorithm, into a fixed length string that now represents that data. 

That hash will be the same length no matter what data is input into it. If a single letter `a` is input to be hashed, then that hash will always be the same fixed length as another input like `abcdefghijklmnopqrstuvwxyz`.

In contrast to encryption, this hash can not be reverted back to its original contents or be decoded. It is one-way. Meaning once hashed, that original data is gone and cannot be retrieved or "unlocked" to reveal the original contents. 

This is used for passwords like the Kerberos protocol I covered in-depth previously [here](../TryHackMe/Cybersecurity-101/Module-1-to-3.md#kerberos) or checksums to verify downloaded files to achieve integrity. 

Hashing needs to be "anti-collision" meaning that two different data inputs cannot create the same hash. Doing so is called a collision and needs to be avoided in the algorithm or extremely rare.

**Secure Hash Algorithm(SHA)**: This is currently the primary and most common hashing algorithm used. Specifically SHA-256 which uses 256 bits, meaning the resulting hash will always be 256 bits or 64 hexadecimal characters.

**Message Digest Algorithm(MD5)** This is an older hashing algorithm which shouldn't be used for anything important due to its collision risk. 

### Salting Hashes

If we were storing hashes of passwords for a service, some of our users may use the exact same password as another user. 

In doing so, their resulting hash will now be the exact same as one another and thus produces many security problems like leakage. For example, if a malicious attacker has access to the database and cracks one user's password, then they now will be able to access all the accounts that have the exact same hash, automatically. 

In order to prevent this, we "salt" the hashes.

As it sounds, we "sprinkle" random data on top of the password before it gets converted into a hash. In doing so, we ensure the users' resulting hash will now each be unique regardless of whether or not their passwords are the same.

This also prevents a "Rainbow Table" attack. 

This attack essentially uses a database of a vast amount of potential passwords and their resulting hash that's generated. 

Thus if hashes aren't salted, they will be able to use their "Rainbow Table" to simply look up someone's hash within their database and obtain their password in seconds. 

Salting hashes prevent this from happening entirely due to the unique resulting hash that is generated.

## Digital Signatures

Using asymmetric keys and hashing, we can have digital signatures to achieve authentication, integrity, as well as non-repudiation(The principle that prevents someone from being able to deny that they performed an action, like sent a message).

It works like this:

1) The string someone would like to send to another will be hashed. For example, the string could be someone typing out their name or it could be a message to a candidate that they will be hired.
2) That hash is then "encrypted" using that person's PRIVATE key. The result is the digital signature
3) That digital signature is sent along with the original plaintext
4) The receiver uses the sender's PUBLIC key to decrypt the signature.
5) The receiver now takes the original plaintext sent along with the signature and runs it through the same hashing algorithm
6) Finally, IF the hashes now match, that verifies the digital signature.

Throughout this process we can see a few things.

The hashing is what achieves integrity as IF the two hashes match, that tells us that the data sent was not changed.

On top of this, we achieve authentication and non-repudiation through the use of the private key because it is only the sender that has the private key(unless it was stolen). 

The combination of these two factors is what allows us to trust the digital signature was indeed from the user and was not altered on the way through. 

