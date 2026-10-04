---
author: NotCare
pubDatetime: 2023-10-01T12:18:00Z
title: LAB: SQL Truncate Attack
postSlug: lab-sql-truncate
featured: true
draft: false
tags:
  - lab
  - walkthrough
  - diy-infosec
ogImage: ""
description: DIY Infosec Lab for SQL Truncation attack
---

# About

Make your own lab for practicing and learning SQL truncation attack. The guide follows you through the attack vector, how do we exploit the vulnerability and lab guide.

## what is sql truncation attack?

_SQL truncation is a flaw in the database configuration in which an input is truncated (deleted) when added to the database due to surpassing the maximum defined length. The database management system truncates any newly inserted values to fit the width of the designated column size._

Let's get started!

# Table of Contents

# Lab Guide

Follow along the guide on my github to setup the lab and deploy the app.
[Github SQL Truncation Attack](https://github.com/charfweh/infosec-labs/tree/master/SQL-Injection)

# Attack Vector

The attack vector lies in underlying schema of the database and how MySQL uses something called `@@sql_mode`

## Scenario

Consider you want to take over admin account but you dont know the password, so by exploiting this vulnerability, an arbitrary user can get access to admin by creating a new admin account even though the original admin account exist with its own original password.

Lets try to understand more of it in depth and practically.

## Database schema

*[Image: image]*
As you can see the `email` has datatype of `varchar()` and its length is `20`, so what if we pass in email that is longer than 20 characters, with this particular settings and configuration provided in the lab, what will happen is creation of a new `admin` account with the user supplied `password`

Sample values:
*[Image: image]*

## MySQL sql_mode

Now a normal `sql_mode` looks something along the lines of

```bash
STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
```

Important thing to notice is `STRICT_TRANS_TABLES`, now before the mysql decided to include the default mode in every configuration, the absence of `STRICT_TRANS_TABLE` allows the attacker to input more than what it can save.

From the MySQL Documentation, we see

```markdown
---SNIPPED---
Strict mode produces an error for attempts to create a key that exceeds the maximum key length. When strict mode is not enabled, this results in a warning and truncation of the key to the maximum key length.
---SNIPPED---
_Link in Reference_
```

So the lab doesn't have this option, well, of course to explain and demonstrate the vulnerability.

# Walkthrough

Upon visiting the site, we get the following page. We also see a potential `admin@lab.com` email.

*[Image: image]*

Let's create a account with `test@gmail.com`

*[Image: image]*
We see we're successfully registered, upon logging in with it, we get
*[Image: image]*
Well, okay fine, the point of this lab is to create a account with `admin@lab.com` and with our supplied password

*[Image: image]*

Let's register the account again, but this time, we will intercept the request with burp and modify the `email` with `whitespace` in `Repeater Tab`.

If you look closely, we're modifying the email with `admin%40lab.com++++++++++++++++1`, remember the `+` is unicode encode of `whitespace`. The key thing to note here is the length of this is greater than the `20 chars`.
On the other hand we see we've successfully registered with the account.

*[Image: image]*

Let's login with admin account and our supplied password and viola!

*[Image: image]*
We're in. _cue mr.robot_

For more reading and resources as to where and how the vulnerability came into place, check References.

# References

- https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#sql-mode-strict
- https://resources.infosecinstitute.com/topics/hacking/sql-truncation-attack/
- https://heinosass.gitbook.io/leet-sheet/web-app-hacking/interesting-outdated-attacks/sql-truncation
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4106

Thanks for reading! Contribution is welcomed.
