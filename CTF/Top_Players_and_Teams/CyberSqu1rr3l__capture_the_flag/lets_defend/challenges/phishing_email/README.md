```
d ss.  d    d d   sss. d    d d d s  b   sSSSs        d sss   d s   sb d s.   d d      
S    b S    S S d      S    S S S  S S  S     S       S       S  S S S S  ~O  S S      
S    P S    S S Y      S    S S S   SS S              S       S   S  S S   `b S S      
S sS'  S sSSS S   ss.  S sSSS S S    S S              S sSSs  S      S S sSSO S S      
S      S    S S      b S    S S S    S S    ssSb      S       S      S S    O S S      
S      S    S S      P S    S S S    S  S     S       S       S      S S    O S S      
P      P    P P ` ss'  P    P P P    P   "sss"        P sSSss P      P P    P P P sSSs                                                                                      
```
Your email address has been leaked and you receive an email from Paypal in German. [^1]

Try to analyze the suspicious email.
-----------------------------------------------------------------------------------------
**What is the return path of the email?**

Upon locating the phishing email under the *Desktop* folder and entering the provided
password to open it in Mozilla Thunderbird, we read the email contents and inspect the
message furhter through *More > View Source*. Here, we can find out the `Return-Path` 
directly below the message signature and authentication results.

**What is the domain name of the url in this mail?**

In order to quickly find all URLs, we search for `href` in the email source text and
discover the *HTTPS* link with the domain name and a cryptic directory and file path
following that.

**Is the domain mentioned in the previous question suspicious?**

At first, the domain name might be linked to *Google* and therefore legitimate, but on
further inspection, the lack of spacing seems odd. In order, to find out more, we query
the domain in quoation marks in a search engine of our choice and discover several sites
[^2] that list the domain as a phishing page.

**What is the body SHA-256 of the domain?**

For this, we open *VirusTotal* [^3] and under details, we find out the body *SHA 256*
hash for the suspicious domain.

**Is this email a phishing email?**

Judging for all our past findings, we should safely draw a conclusion about whether
this email is a phishing email or not.

[^1]: https://app.letsdefend.io/challenge/phishing-email\
[^2]: https://malwr-analysis.com/tag/storage-googleapis-com-scam/
[^3]: https://www.virustotal.com/gui/home/search
