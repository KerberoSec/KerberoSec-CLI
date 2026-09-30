#Phishing #FreeRoom 
https://tryhackme.com/room/phishingemails2rytmuv

Now that we covered the basics concerning emails in [Phishing Emails 1](http://tryhackme.com/jr/phishingemails1tryoe), let's dive right into actual phishing email samples. 

Each email sample showcased in this room will demonstrate different tactics used to make the phishing emails look legitimate. The more convincing the phishing email appears, the higher the chances the recipient will click on a malicious link, download and execute the malicious file, or even send the prince of some country a wire transfer. 

> [!warning] Warning: 
> The samples throughout this room contain information from actual spam and/or phishing emails. Proceed with caution if you attempt to interact with any IP, domain, attachment, etc.

## cancel your PayPal order

The email sample in this task will highlight the following techniques:  

```
Spoofed email address
URL shortening services
HTML to impersonate a legitimate brand

----------------------------------------------
Your Receipt for Payment to Amazing stuff
- - - - - - - - - -  - - - - - - - 
service@paypal.com <noreplyexhmhkhs@<s7sh...>@sultanbogor.com
To: 0008812033347779xxxxxid@mail.info.cnsmr.sg3.yahoo.net

----------------------------------------------

1. This is an unusual email recipient address. This is not the email address associated with the Yahoo account. 

2. This mismatch should immediately stand out. The sender's details (service@paypal.com) don't match the sender's email address (gibberish@sultanbogor.com). 

3. The subject line hints that you made a purchase or a transaction of some sort. If you don't recall this account, then it will grab your attention. This social engineering tactic is to prompt you to interact with the email with haste.
```

email body text 

```
.                                           Sun, July 11, 2021 9:29 PM
.                                     Transaction ID: 7422190xxxxxxxxx
Hello Customer,

You sent a payment of $120.00 USD to Amazing Stuff
(helpcenter@<fake email>)

It may take a few moments for this transaction to appear in your account. 

Merchant                               Instructions to merhcant
Amazing Stuff                     You haven't entered any instructions
helpcenter@<fake email>.com
899-xxx-xxxx
Email address - confirmed              Shipping details
.                                      no shipping details yet.
ppmxtrollingxxxx@<fake>.com

Description                 Unit price      Qty        Amount
Amazing Stuff Gift Card     $30.00 USD      4          $120.00 USD
(EMAIL DELEVERY)
Item# 123333

If you didn't make this order or if you believe an unauthroized person is attempting to access your account, please click the button below for cancer your order.
.             (     Cancel the order   )

.              Issues with this transaction?
You have 180 days from the date of the transaction to open a dispute in the Resolution Center.

Questions? Go to the Help Center at www.paypal.com/help

<footer info >
```

look at the raw HTML of the email (hyperlinks)
```html
<a href="https://<suspicious url.gd/kjhhs">Cancel the order </a>
```

```
What phrase does the gibberish sender email start with?

noreply 

```

## track your package 

```
Spoofed email address
Pixel tracking
Link manipulation

----------------------------------
Track your package: # LZ8942357ENN
- - -  - - -  -   -   -  - - - 
Distribution Center <contact@beginpro.club> 
To: <blank>@yahoo.com

[for your security we disabled all images and links in the email]

Track your package: # LZ8942357ENN
----------------------------------

1. The email is tailored to appear that it's sent from a mail distribution center of some sort. 
2. The subject line adds to the pretense with a 'tracking number.' 
3. The link in the email body matches the subject line.

```

source code
```html
<a href="http://devret.xyz/4833xxxxxxxxxxxxxxxxxx"></a>
<img src="http://devret.xyz/Creatives/Tracking.png" useMap="#grmk" >
```

There are many reasons for spammers to embed tracking pixels (very small images) into their spam emails. To read more about this concept, refer to this post on The Verge [here](https://www.theverge.com/22288190/email-pixel-trackers-how-to-stop-images-automatic-download).

## select your email provider to view document

```
- Urgency
- HTML to impersonate a legitimate brand
- Link manipulation
- Credential harvesting
- Poor grammar and/or typos

-----------------------------------------
From: Nir Barak <nir@prolifty.com>
To: eForm2290 Support
Sent: Thu 7/25/2021 1:35 PM
Subject: RE: Claim #HBD-4633 |> FSG Reality Holdings LLC

Citrix Attachments       Expires July 15, 2021
You have a new fax! Click the attachment to view     4.6 MB
[ Download Document Here ]
A contact uses Citrix Files to share documents securely 

Please see the attached document and do get back to me with your review option.
THANK YOU
-----------------------------------------

if click on download 
- sends you to  app.popt.in/landing/e00xxxxxxxx
- redirects to  bdkmotorsport.com/wp-duuua/  for Adobe Document Cloud
- log in with Outlook > enter credentials => "invalid credentials" even if entering real == credential harvesting

- Analysis: [https://app.any.run/tasks/12dcbc54-be0f-4250-b6c1-94d548816e5c/#]
```

## please update your payment details 

```
- Spoofed email address
- Urgency
- HTML to impersonate a legitimate brand
- Poor grammar and/or typos
- Attachments

-----------------------------------
Netfllx ID Suspended
Netlix billing <z99@musacombi.online>
Bcc: <blank>@yahoo.com

Your account is on hold.

Please update your payment details

Hello Customer,

We're having some trouble with your current billing information.
Please open file [PDF] to update your account.

Need help? We're here if you need it. Visit the Help Center or contact us now.

-Your friends at Netflix

Questions? Call 007-xxx-xxx-xxxx
Please do not reply to this email, as we are unable to respond from this email address. If you r need help or would like to contact us, please visit out Help Center at help.netflix.com

Payment-up....pdf
-----------------------------------

1. This email is made to appear that it's from Netflix Billing, but the sender address is z99@musacombi.online. 
2. Here is the element of urgency. The account was suspended, so the victim must act quickly. 
3. There is more of this sense of urgency in the email body.

```

```
What should users do if they receive a suspicious email or text message claiming to be from Netflix?

https://www.consumeraffairs.com/news/police-warn-of-new-netflix-email-phishing-scam-121718.html

Netflix are advised to forward the message to phishing@netflix.xom
```

## your recent purchase 

```
- Spoofed email address
- Recipient is BCCed
- Urgency
- Poor grammar and/or typos
- Attachments

------------------------------------
Re: Action Required - Your recent purchase "Double Jackpot Slots Las Vegas" on the App Store - Date: Fri 03
- - - - - - - - - - - - - -
Apple Support <donoreply-storexxxxxxxxxxxxx@sumpremed.com
To: norepy.payament_@app.apple.iusxxx.com
Bcc: <blank>@yahoo.com

Double Jack....dot 
165 KB
------------------------------------

1. This email is made to appear that it's from Apple Support, but the sender's address is gibberish@sumpremed.com. 
2. This email wasn't sent directly to the victim's inbox but rather BCCed ([Blind Carbon Copy](https://www.technology.pitt.edu/help-desk/how-to-documents/using-blind-carbon-copy-bcc-feature-protect-privacy-email-addresses)). The recipient email looks like another spoofed email to appear as a legitimate Apple email address. 
3. Here is the element of urgency. Action is required on behalf of the victim.

if to open the .dot file  opens in Word
word document is a fake Apple receipt and a very long redirect link with 'app' and 'ios'
```

## DHL Express courier shipping notice

```
- Spoofed email address
- HTML to impersonate a legitimate brand
- Attachments

---------------------------------
DHL Express Courier Shipping notice CBJ202xxxxxxx
- - - - - - - - - - -
DHL Express <info@glamcarxxxxxxxx.de>

To view this email as a web page, go here
DHL banner      Help Center
Thank you for scheduling a courier shipment with DHL!

See attached for confirmation B/L
CBJ202xxxxxxx

Reception

Important
- Ensure your package are packed and labeled correctly to avoid damage or delays. Follow DHL's Packaging Advice

Should you need to make changes to your pickup, visit MyDHL+ and go to My Pickups.

Please do not reply to this email - inbox is not monitored.

CBJ202xxxxxxx.xlsx
---------------------------------

1. The sender's email doesn't match the company that is being impersonated, which in this case is DHL.
2. The subject line gives the impression that there is a package DHL will ship for you.
3. The HTML in the email body was designed to look like it was sent from DHL.

if to open the .xlsx document to find chinese characters 
then the payload run but errors

regasms.exe
```

---------

Additional Resources:

- [https://www.knowbe4.com/phishing](https://www.knowbe4.com/phishing)[](https://www.knowbe4.com/phishing)
- [https://www.itgovernance.co.uk/blog/5-ways-to-detect-a-phishing-email](https://www.itgovernance.co.uk/blog/5-ways-to-detect-a-phishing-email)
- [https://cheapsslsecurity.com/blog/10-phishing-email-examples-you-need-to-see/](https://cheapsslsecurity.com/blog/10-phishing-email-examples-you-need-to-see/)
- [https://phishingquiz.withgoogle.com](https://phishingquiz.withgoogle.com/)

![[Pasted image 20250225144641.png]]

