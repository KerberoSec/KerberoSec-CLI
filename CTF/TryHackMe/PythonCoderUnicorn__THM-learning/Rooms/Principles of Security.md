
PRINCIPLES OF SECURITY 

the CIA triad = Confidentiality, Integrity and Availability
continuous cycle 
1 element relies on another 

Confidentiality = the protection of data from unauthorized access and misuse. 

Integrity =  the condition where information is kept accurate and consistent unless authorized changes are made.

Availability = In order for data to be useful, it must be available and accessible by the user.

levels of access given to individuals are determined on two primary factors:

The individual's role/function within the organisation
The sensitivity of the information being stored on the system

access rights of individuals, two key concepts are used: 
- Privileged Identity Management (PIM) 
- Privileged Access Management (PAM).

users should be given the minimum amount of privileges, 
and only those that are absolutely necessary for them to perform their duties. 

Bell-La Padula Model is used to achieve confidentiality
- "no write down, no read up"
- everyone's responsibilities/roles are well-defined.
- military 

The Biba model is arguably the equivalent of the Bell-La Padula model
- "no write up, no read down"
-  subjects can create or write content to objects at or below their level 
- but can only read the contents of objects above the subject's level.

- organisations or situations where integrity is more important than confidentiality.

Threat modelling is the process of reviewing, improving, and testing the security protocols 

principles all return to:

Preparation
Identification
Mitigations
Review

frameworks such as 

- STRIDE (Spoofing identity, Tampering with data, Repudiation threats, Information disclosure, Denial of Service and Elevation of privileges) 
- PASTA (Process for Attack Simulation and Threat Analysis)

Spoofing 
- equires you to authenticate requests and users accessing a system. Spoofing involves a malicious party falsely identifying itself as another. API keys
Tampering
- Data that is accessed must be kept integral and accurate. (food seals on package)
Repudiation
- use of services such as logging of activity for a system or application to track.
DoS 
- abuse of the application/service won't result in bringing the whole system down.
Elevation of Priv
- a user was able to escalate their authorization to that of a higher level i.e. an administrator

Computer Security Incident Response Team (CSIRT) 
prearranged group of employees with technical knowledge about the systems and/or current incident.

- Preparation
- Identification
- containment
- eradication of threat 
- recovery
- lessons learned 

Pen Testing 

A Penetration test or pentest is an ethically-driven attempt to 
test and analyse the security defences to protect these assets 
and pieces of information. A penetration test involves using 
the same tools, techniques, and methodologies that someone 
with malicious intent would use and is similar to an audit.

Recall that a penetration test is an authorised audit of a computer 
system's security and defences as agreed by the owners of the systems. 
The legality of penetration is pretty clear-cut in this sense; anything 
that falls outside of this agreement is deemed unauthorised.

Companies that provide penetration testing services are held against legal frameworks 
and industry accreditation. For example, the National Cyber Security Centre (NCSC) 

The ROE is a document that is created at the initial stages of a penetration testing engagement.

- Permission = document gives explicit permission for the engagement (legal protection)
- test scope = document that specifies targets for engagement
- rules = define exactly what techniques permitted 

Methodology 

1. info gather: collect as much public data about target (OSINT & research)
2. enumeration: network scans, find servers
3. exploitation: Vulnerabilities discovered on a system or app 
4. privilege Escalation: exploited a system or app, 
    attempt to expand your access horizontally (other users) or vertically (getting admin)
5. post-exploit 
    - what other hosts can be targeted ?
    - what additional info can be found from host ?
    - covering your tracks 
    - reporting

OSSTMM

The Open Source Security Testing Methodology Manual provides a detailed 
framework of testing strategies for systems, software, applications, 
communications and the human aspect of cybersecurity.

focus is on 

- telecommunications
- wired networks 
- wireless communications

strategies in depth but obtuse to understand

OWASP

The "Open Web Application Security Project" framework is a community-driven 
and frequently updated framework used solely to test the security of 
web applications and services.

easy to understand but unclear type of vulnerability web app has 
updated frequently but no suggestions for software dev 
framework has no accreditation

NIST 

The NIST Cybersecurity Framework is a popular framework used to improve 
an organisations cybersecurity standards and manage the risk of cyber threats. 

widely used and many iterations of frameworks 
detailed standards but weak auditing policies 
no cloud computing 

NCSC CAF

The Cyber Assessment Framework (CAF) is an extensive framework of fourteen 
principles used to assess the risk of various cyber threats and an 
organisation's defences against these.

framework includes = data security, system security, ID access control ...

gov't cybersecurity agency 

BOXES 

3 primary scopes when testing an app/service 

BLACK BOX testing 
- tester has no info about the inner workings of the app/service 
- tester acts as regular user, no programming is used 
- significant amount of time spent on info gather & enumeration

GREY BOX testing 
- most popular Pen Testing
- tester has some info about the internal parts of app/service
- tester is in black box scenario but quicker 

WHITE HAT testing
- software devs testing app & internal parts 
- whole attack surface tested , most time consuming 

ACME 
- permission
- test scope
- rules

info gather OSINT   Abby Feltwood LinkedIn with email a.feltwood@acme.co.uk
enumeration         IP 96.37.50.151   web vul = yes  login= no 
exploitation        use Metasploit vuln to gain access on ACME website
post exploit        goal: maintain access to system & extract data 
clean up 
Pen Test Report     explain results, security issues, flaws, tech stack used 

