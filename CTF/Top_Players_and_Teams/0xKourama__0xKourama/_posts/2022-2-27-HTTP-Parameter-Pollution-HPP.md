---
title: HTTP Parameter Pollution HPP
layout: post
categories: [Web-Vulnerabilities,HPP]
tags: [Vulnerability,HPP]
toc: true
published: true
---

# HTTP Parameter Pollution (HPP)

| Content             |
| ------------------- |
| 📚 What is HPP ?    |
| 🤔 Why HPP Happen ? |
| 💥 Exploitation     |
| ⚔ Impact            |
| 🔎 How To Find      |
| ⚙ Remediation       |
| 📕 Referance        |

## 📚 What is HPP ?
HTTP Parameter Pollution tests the applications response to receiving multiple HTTP parameters with the same name.
For example, if the parameter username is included in the GET or POST parameters twice.

This evasion technique is based on splitting an attack vector between multiple instances of a parameter with the same name (?param1=value1&param1=value2).

Some taking the first occurance **(param1) value1**, some taking the last occurance **(param1) value2**, and some reading it as an array.

---
## 🤔 Why HPP Happen ?

The main reason this attack can be realized is because the input is not sanitized properly. HPP injects encoded query string delimiters in existing or other HTTP parameters (i.e. GET/POST/Cookie), which make it feasible to supersede parameter values that already exist to inject a new parameter or exploit variables from direct access. This attack affects all web technologies, whether running client-side or server-side.

---
## 💥 Exploitation 

![](https://i.imgur.com/hEEI06C.png)

Table of Servers & Programming Languages and how to handle HPP

![](https://i.imgur.com/Jjhqmur.png)

![](https://i.imgur.com/71XulfK.png)

Example of php Language that used the LAST parameter

---
## ⚔ Impact

HTTP parameter pollution may be dangerous, depending on the function that the parameters have in the web application. For example, if the attacker can use HPP to confuse a web application, they may delete important records in the database.

---
## 🔎 How To Find

Test HPP Manually Try to inject another paramter with the same name to abuse logical flow or broken access control values

---
## ⚙ Remediation

In order to prevent these kinds of vulnerabilities, an extensive and proper input validation should be performed. There are safe methods to conform to with each web technology/language. Moreover, awareness about the fact that clients/users can provide more than one parameter should be raised.

---
## 📕 Referance

[**Imperva**](https://www.imperva.com/learn/application-security/http-parameter-pollution/)

[**PayloadsAllTheThings**](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/HTTP%20Parameter%20Pollution)

[**OWASP**](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/04-Testing_for_HTTP_Parameter_Pollution)

[**Hacktricks**](https://book.hacktricks.xyz/pentesting-web/parameter-pollution)

[**Acunetix**](https://www.acunetix.com/blog/whitepaper-http-parameter-pollution/)

[**PwnFunction**](https://www.youtube.com/watch?v=QVZBl8yxVX0)
