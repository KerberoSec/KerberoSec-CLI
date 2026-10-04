# You Have Mail

## Description

This challenge is composed of an email, more specifically a .eml file. The email introduces the theme for the forensics group, which is a whistleblower announcing that alien life exists on Earth, and the government knows about it.

## Attachments

[URGENT_Proof_of_UFO_Read_in_a_secure_location.eml](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Forensics/YouHaveMail/attachments/URGENT_Proof_of_UFO_Read_in_a_secure_location.eml)

## Solution

- We are provided with an <code>eml</code> file. I used the website https://www.emlreader.com to read this file and
get its attachments.
- Within the email's attachments is a file called <code>evidence.zip</code>. At the end
of the email is a string of hexadecimal numbers that represent the password needed to unzip the
evidence:
```
53 65 63 75 72 65 5f 43 6f 64 65 3a 4f 72 64 65 72 5f 36 36
```
- I converted these numbers to their ASCII characters, which yielded the following string: "Secure_Code:Order_66." I unzipped
<code>evidence.zip</code> and provided that string as the password. Within the zip archive was a file called
<code>evidence.txt</code>, which contained the flag.

## Flag

SIVBGR{th3_ev1d3nc3_1s_h3r3}
