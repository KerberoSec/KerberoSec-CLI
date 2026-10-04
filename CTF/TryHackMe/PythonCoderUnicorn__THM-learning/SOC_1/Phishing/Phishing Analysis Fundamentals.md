
#FreeRoom #Phishing 
https://tryhackme.com/room/phishingemails1tryoe

Spam and Phishing are common social engineering attacks. In social engineering, phishing attack vectors can be a phone call, a text message, or an email. As you should have already guessed, our focus is on email as the attack vector. 

We all should be somewhat familiar with what **spam** is. No matter what, these emails somehow find their way into our inboxes. 

The first email classified as spam dates back to 1978  [https://www.britannica.com/topic/spam], and it's still thriving today.   

**Phishing** is a serious attack vector that you, as a defender, will have to defend against.

An organization can follow all the recommended guidelines when it comes to building a layered defense strategy. Still, all it takes is an inexperienced and unsuspecting user within your corporate environment to click on a link or download and run a malicious attachment which may provide an attacker a foothold into the network. 

Many products help combat spam and phishing, but realistically these emails still can get through. When they do, as a Security Analyst, you need to know how to analyze these emails to determine if they're malicious or benign.

Furthermore, you will need to gather information about the email to update your security products to prevent malicious emails from making their way back into a user's inbox. 

In this room, we'll look at all the components involved with sending emails across the Internet and how to analyze email headers.

## email address 

It's only appropriate to start this room by mentioning the man who invented the concept of emails and made the @ symbol famous. The person responsible for the contribution to the way we communicate was Ray Tomlinson. 

The invention of the email dates back to the 1970s for [ARPANET](https://www.britannica.com/topic/ARPANET). Yep, probably before you were born. Definitely, before I was born. :)

```
username  @  domain 

billy@johndoe.com
```

## email delivery

A handful of protocols are involved with the "magic" that takes place when you hit SEND in an email client. 

By now, you should already know that certain protocols were created to handle specific network-related tasks, such as email. 

There are 3 specific protocols involved to facilitate the outgoing and incoming email messages, and they are briefly listed below.

- **SMTP** (**Simple Mail Transfer Protocol)**: It is utilized to handle the sending of emails. 
- **POP3 (Post Office Protocol)**: Is responsible transferring email between a client and a mail server. 
- **IMAP (Internet Message Access Protocol)**: Is responsible transferring email between a client and a mail server.

**POP3**
- Emails are downloaded and stored on a single device.
- Sent messages are stored on the single device from which the email was sent.
- Emails can only be accessed from the single device the emails were downloaded to.
- If you want to keep messages on the server, make sure the setting "Keep email on server" is enabled, or all messages are deleted from the server once downloaded to the single device's app or software.

**IMAP**
- Emails are stored on the server and can be downloaded to multiple devices.
- Sent messages are stored on the server.
- Messages can be synced and accessed across multiple devices.

```
1. user@emaildomain.com
2. SMTP server (port 25) 
3. DNS server
4. SMTP server
5. firewall
6. internet
7. firewall
8. SMTP server
9. POP3/IMAP server
10. user2@otherdomain.com

secure IMAP port 993
secure SMTP port 465
secure POP3 port 995
```

## email headers 

Before we begin, we need to understand that there are two parts to an email:
- the email **header** (information about the email, such as the email servers that relayed the email)
- the email **body** (text and/or HTML formatted text)

The syntax for email messages is known as the **[Internet Message Format](https://datatracker.ietf.org/doc/html/rfc5322)** (**IMF**).

Let's look at email headers first. 

**Note**: Depending on your email client, whether a web client or a desktop app, the steps to view these email header fields will vary, but the concept is the same. 

Review this Knowledge Base (KB) article from Media Temple on viewing the raw/full email headers in various email clients [here](https://mediatemple.net/community/products/grid/204644060/how-do-i-view-email-headers-for-a-message).

What do you look for when analyzing a potentially malicious email?  

Let's start with the following email header fields:
1. **From**: the sender's email address
2. **Subject**: the email's subject line
3. **Date**: the date when the email was sent
4. **To**: the recipient's email address

```
Received: from 10.222.142.150
 by atlas206.free.mail.ne1.yahoo.com with HTTPS; Mon, 21 Jun 2021 15:36:02 +0000
Return-Path: <reback-a3970-837890-838253-c8b776d9=952622232=8@ant.anki-tech.com>
X-Originating-Ip: [43.255.56.161]
Received-SPF: pass (domain of ant.anki-tech.com designates 43.255.56.161 as permitted sender)
Authentication-Results: atlas206.free.mail.ne1.yahoo.com;
 dkim=pass header.i=@ant.anki-tech.com header.s=default;
 spf=pass smtp.mailfrom=ant.anki-tech.com;
 dmarc=pass(p=NONE) header.from=ant.anki-tech.com;
X-Apparently-To: alexa@yahoo.com; Mon, 21 Jun 2021 15:36:02 +0000
X-YMailISG: iU.RbH8WLDuS8PKXbPwmeJ5ksCZTcrgGSzQNPLV2GG3TS1LJ
 tLtofC8wExjmLmWTFhcEr1guoWTIyO9uPLSlg2sv9ZNXf366atDDf8yKQApo
 rfdxFKAErJalk4hzdsHGAinSPoQR6AZmaFo83HsoOemdBOz7hjSYwHAjfpZn
 G9EYqjGm8Krb5Wf9RVTqVUh_xamOJSRA7Srl1b3d73aea31ilEOb1ddfzZ_W
 Wl37yrp9kU6_dIWFGR.1pABp95cRj_mDJUpvJnSpMferOr8Jj7OBJO3VAdnx
 DNgWFFnIsacy_4uofvHG_Bk7r.Q6FA2Kr1fnyhS_o.ZHpkgjE4eggUHG2b3J
 gSzYSw57V_QMOP7vW6MMkQiAVAiN7H_z.548QaUg7pzS0g0a4aLuJm5FjfwT
 FMgAS1tZVU9qfjpKbFxDxL8AnHLCw3BtZaMhipp7XiTb3PZcaQDvNq3PRyyr
 QtzrJ19GnAd7D_CF9RA.HCQm6V.pT6I_z0rJEIpY33Ip8.S5vkDW1rEl_h6g
 UiigoHtg4WZbNWyyKiypPtdSv6X5WA_Pzwjfy0fT5_GaATPCqPdXoNcWukUN
 1pvdU3RK_74JlDv0MqUVWhk58jgmaJXEeJbOI54D4xka6ssN1ierLAjAS9Su
 pR3KDBKy2V4.pbcSh7EgOH2irCM.Fovz2wcAjiVuKjUhf5CmMLZLNekaHLaj
 e6HU9iAHEimvhdEBvDFcWGUABRhF6VWyY9xFYdshH7oq3gtyOOFpAVlvqBAC
 xVuGuuFXclC9TBdbJqCr9e_8D9cwTyO3st8fyn8GPU2NTWa5I8j8cNN1mgkd
 1ke1woYCWpGHhV.8Azo1dUKj7ZtRT8XUSX4v8HplLW_5XRd9WNP34T6r6fi3
 fEFWPig.1cxOgP7H.yQuP0HNVQxqkw9e5FIN1WfkcozlaId5B3Y3NvQxlbsM
 mmQ8JR5MyDBxRxW73FpVh61bNbblqqF9jscelIlrLONLWaPkDEwxB_i.4fKI
 wM.2N6f8.fR43PeUu2EvTw6yc7neGF07e10QbdDTIqWeDait3iSySeYYBLhJ
 VZOSW1ku2KQLPsgjyV52T0qjyyRHffjLC.vR64xoeJZ1fAjNOBpHldjIulHJ
 FqZXiMQm1Rla8HBJ9c3qDUlyjjitP6K_Dsyklk.ihg.amIBY4hsOpkVV.Shp
 Ahb0rdBWUQ.qi4N6oI6s_e4ZmrznRsZ5UXb4Nv.RGYu4JanohwrB3IGyQ7k8
 BSO_IgPPgegEIxw-
Received: from 43.255.56.161 (EHLO smtp3-160.piican.com)
 by 10.222.142.150 with SMTP;
 Mon, 21 Jun 2021 15:36:02 +0000
DKIM-Signature: a=rsa-sha256; bh=TQXVGYjb6bIRm7BAsWwSHB6HsI0KKcmsmmgRm0n9HHo=;
 c=relaxed/relaxed; d=ant.anki-tech.com;
 h=Subject:From:To:Sender:Reply-To:Date:List-Unsubscribe:X-CampaignID:Message-ID:X-Mailer-Info:MIME-Version:Content-Type;
 s=default; t=1624289739; v=1;
 b=DLxYfx9u4fxp918X8lTCAy4atskJfkci5d3ygf5hsz1Yv3SynxMbN1e0xTG/jgK1WcxZkUqN
 lUzgbaGhP62BIv2PvwA45trwdbiJO8wWv9KtsUc41nQCXJXGltdE876ffdH9PQTF8n2ayDe0tb/
 58eeVz2hOuaPS7hBzKx3IC3U=
Subject: Help protect your budget by protecting your home
From: "ADT Security Services" <newsletters@ant.anki-tech.com>
To: alexa@yahoo.com
Sender: newsletters@ant.anki-tech.com
Reply-To: reply@ant.anki-tech.com
Date: 21 Jun 2021 15:35:39 -0000
List-Unsubscribe: <https://ant.anki-tech.com/ga/unsubscribe/2-952622232-3970-423304-838253-d0890c7eb0b8a71-17b3b9c21a?confirmed=1>,
 <mailto:reback-a3970-837890-838253-c8b776d9=952622232=8u@ant.anki-tech.com>
X-CampaignID: s4:837890-96baa36ffd77a89b
Message-ID: <mid-34511e6d7ca189088b5e6e69df06a139-109@ant.anki-tech.com>
X-Mailer-Info: 8.E2M5cDM.4MzN4kDM.AZz9malJHQ5FGav9mLj9Wb.5UjM2IjMyMjM.4MDOyUzM
MIME-Version: 1.0
Content-Type: multipart/alternative;
 boundary="==42dfce3ded6d18843fe38aaa93a8071c"
Content-Length: 11355

This is a multi-part message in MIME format.

--==42dfce3ded6d18843fe38aaa93a8071c
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

1-844-674-3380 ( tel:1-844-674-3380 )

( https://ant.anki-tech.com/ga/click/2-952622232-3970-423304-838253-590962-=
350694bcf9-17b3b9c21a )
( https://ant.anki-tech.com/ga/click/2-952622232-3970-423304-838253-590962-=
350694bcf9-17b3b9c21a )

1-844-674-3380 ( tel:1-844-674-3380 )

( https://ant.anki-tech.com/ga/click/2-952622232-3970-423304-838253-590962-=
350694bcf9-17b3b9c21a )

* Traditional security/28.99: Requires 36-month monitoring
contract starting at $28.99/mo (24-month monitoring contract in
California, total fees from $695.76). Service and installation
charges vary depending on system configuration, equipment and
services selected. Applies to Traditional Service level only.
Landline phone required. Upon early termination by Customer, ADT
may charge 75% of the monthly service charges due for the balance
of the initial contract term. Excludes ADTs Quality Service Plan
(QSP).

$100 ADT VISA Reward Card: Requires 36-month monitoring contract
starting at $28.99/mo (24-month monitoring contract in
California, total fees from $695.76), and enrollment in ADT Easy
Pay. Requires minimum purchase price of $449. One (1) Visa Reward
card valued at $100 is redeemable seven (7) days after system is
installed, wherein an email is sent to the customer's email
address associated with their account with a promo code. The
customer must validate the promo code on the website provided in
the email and a physical card will be sent in the mail.
Installation must occur within 60 days of offer expiration date
to receive card. Applicable to new and resale sale types only.
Card is issued by MetaBank, N.A., Member FDIC, pursuant to a
license from Visa U.S.A. Inc. No cash access or recurring
payments. Can be used everywhere Visa debit cards are accepted.
Card valid for up to 6 months; unused funds will forfeit after
the valid thru date. Card terms and conditions apply.

**ADT Money-Back Guarantee: Money back guarantee only applies
after ADT has made attempts to resolve a system related issue and
has not been able to resolve that issue within the first 6 months
of your contract. Equipment must be fully removed before a refund
will be processed. Conditions preventing normal system operation
cannot be caused by the customer.

Interactive Services: ADT Command Interactive Solutions Services
(ADT Command) helps you manage your home environment and family
lifestyle. Requires purchase of an ADT alarm system with 36 month
monitoring contract ranging $45.99-$59.99/mo with QSP (24-month
monitoring contract in California, total fees ranging
$1103.76-$1439.76), enrollment in ADT Easy Pay, and a compatible
device with Internet and email access. These interactive services
do not cover the operation or maintenance of any household
equipment/systems that are connected to the ADT Command
equipment. All ADT Command services are not available with all
interactive service levels. All ADT Command services may not be
available in all geographic areas. You may be required to pay
additional charges to purchase equipment required to utilize the
interactive service features you desire.

General: Additional charges may apply in areas that require guard
response service for municipal alarm verification. System remains
property of ADT. Local permit fees may be required. Prices and
offers subject to change and may vary by market. Additional taxes
and fees may apply. Satisfactory credit required. A security
deposit may be required. Simulated screen images and photos are
for illustrative purposes only.

Licenses: 2021 ADT LLC dba ADT Security Services. All rights
reserved. ADT, the ADT logo, 800.ADT.ASAP and the product/service
names listed in this document are marks and/or registered marks.
Unauthorized use is strictly prohibited. Third-party marks are
the property of their respective owners. License information
available at www.ADT.com/legal or by calling 800.ADT.ASAP. CA
ACO7155, 974443, PPO120288; FL EF0001121; LA F1639, F1640, F1643,
F1654, F1655; MA 172C; NC Licensed by the Alarm Systems Licensing
Board of the State of North Carolina, 7535P2, 7561P2, 7562P10,
7563P7, 7565P1, 7566P9, 7564P4; NY 12000305615; PA 09079; MS
15019511.

ADT LLC dba ADT Security Services
1501 Yamato Road
Boca Raton, FL 33431-0835

Privacy Policy ( https://ant.anki-tech.com/ga/click/2-952622232-3970-423304=
-838253-590963-f4dc7d545f-17b3b9c21a ) |
Unsubscribe ( https://ant.anki-tech.com/ga/click/2-952622232-3970-423304-83=
8253-590964-9ca2d1e342-17b3b9c21a )

Unsubscribe me from this mailing list ( https://ant.anki-tech.com/ga/unsubs=
cribe/2-952622232-3970-423304-838253-d0890c7eb0b8a71-17b3b9c21a )=

--==42dfce3ded6d18843fe38aaa93a8071c
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org=
/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns=3D"http://www.w3.org/1999/xhtml">
<head>

  <title>ADT</title>
</head>
<body>
<p><a style=3D"text-decoration: none; color: #000000; margin-left: 180px;" =
href=3D"tel:1-844-674-3380"><strong>1-844-674-3380</strong></a></p>
<table width=3D"600" align=3D"center">
<tbody>
<tr>
<td rowspan=3D"2" align=3D"left"><a href=3D"https://ant.anki-tech.com/ga/cl=
ick/2-952622232-3970-423304-838253-590962-350694bcf9-17b3b9c21a"></a><=
/td>
<td align=3D"right"><a href=3D"https://ant.anki-tech.com/ga/click/2-9526222=
32-3970-423304-838253-590962-350694bcf9-17b3b9c21a"></a></td>
</tr>
<tr>
<td class=3D"bodycopy" style=3D"font-family: Helvetica, Arial, Sans-Serif; =
text-align: right; color: #000000; font-weight: normal; font-size: 24px; wo=
rd-break: keep-all;" align=3D"right" valign=3D"top"><a style=3D"text-decora=
tion: none; color: #000000;" href=3D"tel:1-844-674-3380"><strong>1-844-674-=
3380</strong></a></td>
</tr>
<tr>
<td colspan=3D"2"><a href=3D"https://ant.anki-tech.com/ga/click/2-952622232=
-3970-423304-838253-590962-350694bcf9-17b3b9c21a"></a></td>
</tr>
</tbody>
</table>
<table width=3D"620" align=3D"center">
<tbody>
<tr align=3D"justify">
<td style=3D"font-family: Arial, sans-serif; font-size: 10px; text-align: l=
eft; color: #000000; padding: 10px;">* Traditional security/28.99: Requires=
 36-month monitoring contract starting at $28.99/mo (24-month monitoring co=
ntract in California, total fees from $695.76). Service and installation ch=
arges vary depending on system configuration, equipment and services select=
ed. Applies to Traditional Service level only. Landline phone required. Upo=
n early termination by Customer, ADT may charge 75% of the monthly service =
charges due for the balance of the initial contract term. Excludes ADTs Qua=
lity Service Plan (QSP). <br /><br />$100 ADT VISA Reward Card: Requires 36=
-month monitoring contract starting at $28.99/mo (24-month monitoring contr=
act in California, total fees from $695.76), and enrollment in ADT Easy Pay=
. Requires minimum purchase price of $449. One (1) Visa Reward card valued =
at $100 is redeemable seven (7) days after system is installed, wherein an =
email is sent to the customer's email address associated with their account=
 with a promo code. The customer must validate the promo code on the websit=
e provided in the email and a physical card will be sent in the mail. Insta=
llation must occur within 60 days of offer expiration date to receive card.=
 Applicable to new and resale sale types only. Card is issued by MetaBank, =
N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. No cash acce=
ss or recurring payments. Can be used everywhere Visa debit cards are accep=
ted. Card valid for up to 6 months; unused funds will forfeit after the val=
id thru date. Card terms and conditions apply. <br /><br />**ADT Money-Back=
 Guarantee: Money back guarantee only applies after ADT has made attempts t=
o resolve a system related issue and has not been able to resolve that issu=
e within the first 6 months of your contract. Equipment must be fully remov=
ed before a refund will be processed. Conditions preventing normal system o=
peration cannot be caused by the customer. <br /><br />Interactive Services=
: ADT Command Interactive Solutions Services (ADT Command) helps you manage=
 your home environment and family lifestyle. Requires purchase of an ADT al=
arm system with 36 month monitoring contract ranging $45.99-$59.99/mo with =
QSP (24-month monitoring contract in California, total fees ranging $1103.7=
6-$1439.76), enrollment in ADT Easy Pay, and a compatible device with Inter=
net and email access. These interactive services do not cover the operation=
 or maintenance of any household equipment/systems that are connected to th=
e ADT Command equipment. All ADT Command services are not available with al=
l interactive service levels. All ADT Command services may not be available=
 in all geographic areas. You may be required to pay additional charges to =
purchase equipment required to utilize the interactive service features you=
 desire. <br /><br />General: Additional charges may apply in areas that re=
quire guard response service for municipal alarm verification. System remai=
ns property of ADT. Local permit fees may be required. Prices and offers su=
bject to change and may vary by market. Additional taxes and fees may apply=
. Satisfactory credit required. A security deposit may be required. Simulat=
ed screen images and photos are for illustrative purposes only. <br /><br /=
>Licenses: 2021 ADT LLC dba ADT Security Services. All rights reserved. ADT=
, the ADT logo, 800.ADT.ASAP and the product/service names listed in this d=
ocument are marks and/or registered marks. Unauthorized use is strictly pro=
hibited. Third-party marks are the property of their respective owners. Lic=
ense information available at www.ADT.com/legal or by calling 800.ADT.ASAP.=
 CA ACO7155, 974443, PPO120288; FL EF0001121; LA F1639, F1640, F1643, F1654=
, F1655; MA 172C; NC Licensed by the Alarm Systems Licensing Board of the S=
tate of North Carolina, 7535P2, 7561P2, 7562P10, 7563P7, 7565P1, 7566P9, 75=
64P4; NY 12000305615; PA 09079; MS 15019511. <br /><br />ADT LLC dba ADT Se=
curity Services <br />1501 Yamato Road <br />Boca Raton, FL 33431-0835 <br =
/><br /><a href=3D"https://ant.anki-tech.com/ga/click/2-952622232-3970-4233=
04-838253-590963-f4dc7d545f-17b3b9c21a"> Privacy Policy</a> | <a style=3D"t=
ext-decoration: underline; color: #000000;" href=3D"https://ant.anki-tech.c=
om/ga/click/2-952622232-3970-423304-838253-590964-9ca2d1e342-17b3b9c21a"> U=
nsubscribe </a></td>
</tr>
<!--<![endif]--></tbody>
</table>
<p style=3D"text-align: center;"><a href=3D"https://ant.anki-tech.com/ga/un=
subscribe/2-952622232-3970-423304-838253-d0890c7eb0b8a71-17b3b9c21a">Unsubs=
cribe me from this mailing list</a></p>

--==42dfce3ded6d18843fe38aaa93a8071c--
{"mode":"full","isActive":false}
```

You can review this email in the `Email Samples` directory on the Desktop within the attached virtual machine. The email is titled `email1.eml`.   

From the above image, there are other email header fields of interest. 

1. **X-Originating-IP**: The IP address of the email was sent from (this is known as an **[X-header](https://help.returnpath.com/hc/en-us/articles/220567127-What-are-X-headers-)**)
2. **Smtp.mailfrom**/**header.from**: The domain the email was sent from (these headers are within **Authentication-Results**)
3. **Reply-To**: This is the email address a reply email will be sent to instead of the **From** email address

To clarify, in the email in the sample above, the **Sender** is newsletters@ant.anki-tech.com, but if a recipient replies to the email, the response will go to reply@ant.anki-tech.com, which is the **Reply-To**, and **NOT** to newsletters@ant.anki-tech.com.

## types of phishing

Now that we covered the general concepts regarding emails and how they travel from sender to recipient, we can now talk about how this method of communication is used for nefarious purposes. 

Different types of malicious emails can be classified as one of the following:

- **[Spam](https://www.proofpoint.com/us/threat-reference/spam)**: unsolicited junk emails sent out in bulk to a large number of recipients. The more malicious variant of Spam is known as **MalSpam**.
- **[Phishing](https://www.proofpoint.com/us/threat-reference/phishing)**: emails sent to a target(s) purporting to be from a trusted entity to lure individuals into providing sensitive information. 
- **[Spear phishing](https://www.proofpoint.com/us/threat-reference/spear-phishing) -** takes phishing a step further by targeting a specific individual(s) or organization seeking sensitive information.  
- **[Whaling](https://www.rapid7.com/fundamentals/whaling-phishing-attacks/)**: is similar to spear phishing, but it's targeted specifically to C-Level high-position individuals (CEO, CFO, etc.), and the objective is the same. 
- [**Smishing**](https://www.proofpoint.com/us/threat-reference/smishing): takes phishing to mobile devices by targeting mobile users with specially crafted text messages. 
- [**Vishing**](https://www.proofpoint.com/us/threat-reference/vishing): is similar to smishing, but instead of using text messages for the social engineering attack, the attacks are based on voice calls.

When it comes to phishing, the modus operandi is usually the same depending on the objective of the email.

For example, the objective can be to harvest credentials, and another is to gain access to the computer. 

Below are typical characteristics phishing emails have in common:

- The **sender email name/address** will masquerade as a trusted entity (**[email spoofing](https://www.proofpoint.com/us/threat-reference/email-spoofing)**)
- The email subject line and/or body (text) is written with a **sense of urgency** or uses certain keywords such as **Invoice**, **Suspended**, etc. 
- The email body (HTML) is designed to match a trusting entity (such as Amazon)
- The email body (HTML) is poorly formatted or written (contrary from the previous point)
- The email body uses generic content, such as Dear Sir/Madam. 
- **Hyperlinks** (oftentimes uses URL shortening services to hide its true origin)
- A [malicious attachment](https://www.proofpoint.com/us/threat-reference/malicious-email-attachments) posing as a legitimate document

We'll look at each of these techniques (characteristics) in greater detail in the next room within the Phishing module.

**Reminder**: When dealing with hyperlinks and attachments, you need to be careful not to accidentally click on the hyperlink or the attachment. 

Hyperlinks and IP addresses should be '**defanged**'. Defanging is a way of making the URL/domain or email address unclickable to avoid accidental clicks, which may result in a serious security breach. It replaces special characters, like "@" in the email or "." in the URL, with different characters. For example, a highly suspicious domain, http://www.suspiciousdomain.com, will be changed to hxxp[://]www[.]suspiciousdomain[.]com before forwarding it to the SOC team for detection.

Analyze the email titled `email3.eml` within the virtual machine and answer the questions below.

