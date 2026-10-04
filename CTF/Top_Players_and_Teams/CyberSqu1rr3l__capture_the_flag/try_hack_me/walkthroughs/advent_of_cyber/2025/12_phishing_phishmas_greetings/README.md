```
▛▀▖▌  ▗    ▌  ▗            ▛▀▖▌  ▗    ▌             ▞▀▖         ▐  ▗          
▙▄▘▛▀▖▄ ▞▀▘▛▀▖▄ ▛▀▖▞▀▌ ▄▄▖ ▙▄▘▛▀▖▄ ▞▀▘▛▀▖▛▚▀▖▝▀▖▞▀▘ ▌▄▖▙▀▖▞▀▖▞▀▖▜▀ ▄ ▛▀▖▞▀▌▞▀▘
▌  ▌ ▌▐ ▝▀▖▌ ▌▐ ▌ ▌▚▄▌     ▌  ▌ ▌▐ ▝▀▖▌ ▌▌▐ ▌▞▀▌▝▀▖ ▌ ▌▌  ▛▀ ▛▀ ▐ ▖▐ ▌ ▌▚▄▌▝▀▖
▘  ▘ ▘▀▘▀▀ ▘ ▘▀▘▘ ▘▗▄▘     ▘  ▘ ▘▀▘▀▀ ▘ ▘▘▝ ▘▝▀▘▀▀  ▝▀ ▘  ▝▀▘▝▀▘ ▀ ▀▘▘ ▘▗▄▘▀▀
```
In this THM room, we learn how to spot phishing emails from Mahare's Eggsploit Bunnies
sent to The Big Festive Company (TBFC) users. [^1]

Classify the 1st email, what's the flag?
-----------------------------------------------------------------------------------------
The PayPal-looking email "Invoice from Santa Claus (4103)" is particularly tricky to
identify as a *phishing* email. Yet, we can observe a *spoofing* attempt if we compare
the `RETURN-PATH` "bounces+SRS=qVbic=PZ[@]bbunny378[.]onmicrosoft[.]com" with the sender
address. This can be confirmed by the failed SPF, DKIM and DMARC test results as well.
Further, we can observe a sense of urgency because the victim's PayPal money appears to
be in danger. In this case, we assume that the user did not send money to "Santa Clause"
and is puzzled about the *fake invoice* to a transaction that did not happen.

Classify the 2nd email, what's the flag?
-----------------------------------------------------------------------------------------
The "New Audio Message from McSkidy" email can be characterized to be a *phishing*
attempt with the goal of the victim believing the fake *impersonation* of McSkidy and
then opening the *malicious attachment*. At first, the `FROM` display header appears to
be legitimate but in the underlying header we can discover the return path
"zxwsedr[@]easterbb[.]com" which does not match with the expected address. Further, in
the authentication results we can see that the signature did not verify with the *Sender
Policy Framework* (SPF), *DomainKeys Identified Mail* (DKIM) and the *Domain-based
Message Authentication* (DMARC), which all fail. This confirms the (failed) *spoofing*
attempt which would usually be detected and rejected by modern email clients.

Classify the 3rd email, what's the flag?
-----------------------------------------------------------------------------------------
This email titled "URGENT: McSkidy VPN access for incident response" immediately strikes
to be a *phishing* email due to its *sense of urgency* and *impersonation* as McSkidy, it
is however very unlikely, that the real McSkidy would choose the complicated email
address "mcskiddyy202512[@]gmail[.]com" from a public domain. Further, upon reading the
content of the email, we suspect a *social engineering text* without many internal hints
towards any connection to the company since the "Team" addressing and the name of the
"Blue Team" department is very generic too. This email was created without much attention
to detail, yet, it can be effective on few victims in a large group of recipients since
humans are usually likely to help, especially if it comes from one of their co-workers
and it involves an urgent accident with a (somewhat) believable story.

Classify the 4th email, what's the flag?
-----------------------------------------------------------------------------------------
The Dropbox-alike *phishing* email "TBFC HR Department shared 'Annual Salary Raise
Approval.pdf' with you" links to a legitimate site and is therefore hard to spot. The
*social engineering text* of the email content to lure a victim into thinking they are
getting a raise in their salary if they approve a file is especially attractive. The
sender's email address in the return path and from don't match, which hints towards an
*impersonation* of the Dropbox account with an *external sender domain*.

Classify the 5th email, what's the flag?
-----------------------------------------------------------------------------------------
This email titled "Improve you event logistics this SOC-mas season" can be classified as
a *spam* email since it urges its recipients towars engagement in promotion. Here, we can
see a marketing email offering logistics solutions with a valid sender address and no
pressing urgency towards clicking on any external links.

Classify the 6th email, what's the flag?
-----------------------------------------------------------------------------------------
When investigating the email "TBFC-IT shared Christmas Laptop Upgrade Agreement with you"
we notice that the sender has a similar but not quite familiar domain with the chosen
email address "tbfc-it[@]tbƒc[.]com". This is a prime example of *typosquatting or
punycodes* attacks where the domain "tbfc" is slightly varied with a character from the
Unicode set to represent the "f". An easy way to spot this misleading, is to look at the
`RETURN-PATH` which lists the email address "tbfc-it[@]xn--tbc-n5a[.]com" with the ACE
prefix and the encoded non-ASCII characters instead of "tbfc". Note, that the ACE prefix
`xn-` is used in DNS to encode non-ASCII characters to domain names. We can use free
punycode to domain name converters, such as [^2] or [^3] to verify this manually. Thus,
it becomes clear why this *phishing* email is featuring *impersonation* of the TBFC-IT
deparment. We are not immediately sure, what the purpose of this malicious email could be
with an external sender domain and a link to Microsoft tools page. But then, we recognize
the tracking link in the end and suspect a *social engineer text* which is correct.

[^1]: https://tryhackme.com/room/spottingphishing-aoc2025-r2g4f6s8l0
[^2]: https://mothereff.in/punycode
[^3]: https://www.punycoder.com/
