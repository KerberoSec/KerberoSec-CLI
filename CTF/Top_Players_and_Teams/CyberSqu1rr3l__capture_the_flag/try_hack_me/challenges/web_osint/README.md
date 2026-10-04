```
 __    __     _       ___  __   _____    __  _____ 
/ / /\ \ \___| |__   /___\/ _\  \_   \/\ \ \/__   \
\ \/  \/ / _ \ '_ \ //  //\ \    / /\/  \/ /  / /\/
 \  /\  /  __/ |_) / \_// _\ \/\/ /_/ /\  /  / /   
  \/  \/ \___|_.__/\___/  \__/\____/\_\ \/   \/                                                     
```
In this TryHackMe challenge, we conduct basic open source intelligence research on a
website. [^1]

Task 2: Whois Registration
-----------------------------------------------------------------------------------------
**What is the name of the company the domain was registered with?**

On first instinct, we query a simple `whois` search and thus get the result in
*Registrar* part of the `RepublicOfKoffee.com`.

```
$ whois 'RepublicOfKoffee.com'
   Domain Name: REPUBLICOFKOFFEE.COM
   Registry Domain ID: 2582024072_DOMAIN_COM-VRSN
   Registrar WHOIS Server: whois.namecheap.com
   Registrar URL: http://www.namecheap.com
   Updated Date: 2023-01-11T04:28:54Z
   Creation Date: 2021-01-01T17:33:07Z
   Registry Expiry Date: 2024-01-01T17:33:07Z
   Registrar: NameCheap, Inc.
   Registrar IANA ID: 1068
   Registrar Abuse Contact Email: abuse@namecheap.com
   Registrar Abuse Contact Phone: +1.6613102107
   Name Server: NS1.BRAINYDNS.COM
   Name Server: NS2.BRAINYDNS.COM
   DNSSEC: unsigned
   URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/

Domain name: republicofkoffee.com
Registry Domain ID: 2582024072_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.namecheap.com
Registrar URL: http://www.namecheap.com
Updated Date: 2023-01-11T04:28:54.15Z
Creation Date: 2021-01-01T17:33:07.00Z
Registrar Registration Expiration Date: 2024-01-01T17:33:07.00Z
Registrar: NAMECHEAP INC
Registrar IANA ID: 1068
Registrar Abuse Contact Email: abuse@namecheap.com
Registrar Abuse Contact Phone: +1.9854014545
Reseller: NAMECHEAP INC
Domain Status: https://icann.org/epp#clientTransferProhibited
Registrant Name: Redacted for Privacy
Registrant Organization: Privacy service provided by Withheld for Privacy ehf
Registrant Street: Kalkofnsvegur 2
Registrant City: Reykjavik
Registrant State/Province: Capital Region
Registrant Postal Code: 101
Registrant Country: IS
Registrant Phone: +354.4212434
<--snip-->
```

**What phone number is listed for the registration company?**

The phone number is listed in the *Registrar Abuse Contact Phone* section in the header
of the `whois` query. Note, that we want to omit the country code and the dot character
for the flag.

**What is the first nameserver listed for the site?**

In the `whois` query, we can spot two name servers, the first of which is the flag for
this task. A nameserver is used to map URL domains with IP addresses of a web server and
is therefore an important part of the *Domain Name System* (DNS). [^2]

**What is listed for the name of the registrant?**

In the `whois` query result, we further find out admin name as follows.
```
Admin Name: Redacted for Privacy
Admin Street: Kalkofnsvegur 2
Admin City: Reykjavik
Admin State/Province: Capital Region
Admin Postal Code: 101
Admin Country: IS
Admin Phone: +354.4212434
Admin Email: 744b407022364a2f8212bb43b0f7edf8.protect@withheldforprivacy.com
```

**What country is listed for the registrant?**

From the `whois` search we are only left with the country code *IS* which stands for
Iceland, matching with *Reykjavik*.

Task 3: Ghosts of Websites Past
-----------------------------------------------------------------------------------------
**What is the first name of the blog's author?**

By accessing the Wayback Machine [^3] by the Internet Archive we are able to access
historical information for the target domain `RepublicOfKoffee.com`.
The earliest snapshot of the website was taken on December 31'st 2015 and the first blog
on it was posted by the author *Steve*.

**What city and country was the author writing from?**

In their first post, the author writes about their coffee experience in the city of
*Gwangju, South Korea* which is likely the location they are writing from.

**What is the name of the temple inside the National Park the author frequently visits?**

In another post, the author writes about the *Mudeungsan National Park* area and the
only temple that comes to mind here, is the *Jeungsimsa Temple*.

Task 4: Digging into DNS
-----------------------------------------------------------------------------------------
**What was RepublicOfKoffee.com's IP address as of October 2016?**

With the ViewDNS [^4] web tool it is possible to look up registration information and
whether the target website is hosted on a shared or dedicated IP address.
After entering `RepublicOfKoffee.com` in the *IP History* field of the ViewDNS website,
we can search for the IP address as of 2016-10 and are prompted with `173.248.188.152`
for the flag.

**Based on the other domains hosted on the same IP address, what kind of hosting service
can we safely assume our target uses?**

This time we search for the IP address `173.248.188.152` as found in the previous task
in the *Reverse IP Lookup* field of ViewDNS. Based on the observation that the IP address
is in heavy use and the target likely has a tight budget without many visitors on the
website, they probably use a *shared* hosting service.

Task 5: Taking Off The Training Wheels
-----------------------------------------------------------------------------------------
**What is the second nameserver listed for the domain?**

Once again, we fire up a `whois` search query and retrieve all the necessary information
from it. From here, we can see that the second name server for `heat.net` is listed as 
*NS2.HEAT.NET*.

```
$ whois heat.net
   Domain Name: HEAT.NET
   Registry Domain ID: 4878759_DOMAIN_NET-VRSN
   Registrar WHOIS Server: whois.godaddy.com
   Registrar URL: http://www.godaddy.com
   Updated Date: 2023-01-14T15:28:59Z
   Creation Date: 1997-02-03T05:00:00Z
   Registry Expiry Date: 2024-02-04T05:00:00Z
   Registrar: GoDaddy.com, LLC
   Registrar IANA ID: 146
   Registrar Abuse Contact Email: abuse@godaddy.com
   Registrar Abuse Contact Phone: 480-624-2505
   Domain Status: https://icann.org/epp#clientDeleteProhibited
   Domain Status: https://icann.org/epp#clientRenewProhibited
   Domain Status: https://icann.org/epp#clientTransferProhibited
   Domain Status: https://icann.org/epp#clientUpdateProhibited
   Name Server: NS1.HEAT.NET
   Name Server: NS2.HEAT.NET
   DNSSEC: unsigned
   URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/

Domain Name: HEAT.NET
Registry Domain ID: 4878759_DOMAIN_NET-VRSN
Registrar WHOIS Server: whois.godaddy.com
Registrar URL: https://www.godaddy.com
Updated Date: 2023-01-14T10:28:57Z
Creation Date: 1997-02-03T00:00:00Z
Registrar Registration Expiration Date: 2024-02-04T00:00:00Z
Registrar: GoDaddy.com, LLC
Registrar IANA ID: 146
Registrar Abuse Contact Email: abuse@godaddy.com
Registrar Abuse Contact Phone: +1.4806242505
Registry Registrant ID: Not Available From Registry
Registrant Name: Registration Private
Registrant Organization: Domains By Proxy, LLC
Registrant Street: DomainsByProxy.com
Registrant Street: 2155 E Warner Rd
Registrant City: Tempe
Registrant State/Province: Arizona
Registrant Postal Code: 85284
Registrant Country: US
Registrant Phone: +1.4806242599
Registry Admin ID: Not Available From Registry
Admin Name: Registration Private
Admin Organization: Domains By Proxy, LLC
Admin Street: DomainsByProxy.com
Admin Street: 2155 E Warner Rd
Admin City: Tempe
Admin State/Province: Arizona
<--snip-->
```

**What IP address was the domain listed on as of December 2011?**

The IP history in ViewDNS [^4] provides us with the requested IP address
`72.52.192.240` for December 19th in 2011.

**Based on domains that share the same IP, what kind of hosting service is the domain
owner using?**

Since the domain `heat.net` results in quite a few other domains, to be exact 45 that
share the latest server IP `208.117.87.195`, the domain owner is likely using a 
*shared* hosting service.

**On what date did was the site first captured by the internet archive?**

**What is the first sentence of the first body paragraph from the final capture of
2001?**

**Using your search engine skills, what was the name of the company that was responsible
for the original version of the site?**

After searching for `heat.net` in the Wayback Machine [^3], we can see that the
site prevailed in the form of snapshots since June 1st 1997.

**What does the first header on the site on the last capture of 2010 say?**

The final capture on July 6th 2001 features the following first sentence on the page.

> After years of great online gaming, it’s time to say good-bye.

**Using your search engine skills, what was the name of the company that was responsible
for the original version of the site?**

After searching for "heat[.]net" in quotation marks in a search engine of our choice,
the first entry is already the name of the company *SegaSoft* that created `heat.net`
in form of a Wikipedia entry.

**What does the first header on the site on the last capture of 2010 say?**

The last Wayback capture on December 30th 2010 titles the first header with a significant
change from video games.

> Heat.net: Heating and Cooling

Task 6: Taking A Peek Under The Hood Of A Website
-----------------------------------------------------------------------------------------
**How many internal links are in the text of the article?**

Since searching for the links with a preceeding `href` in the whole page source only
results in too many links outside of the article text body, we need to do this manually
by hovering over the links with the mouse cursor.
Finally, there are *five* link points that direct to an internal `heat.net` site.

**How many external links are in the text of the article?**

The same procedure repeats itself and reveals that there is only *one* site pointing to
an external site.

**What is the website in the article's only external link?**

The only external site that is referenced is called `purchase.org`.

**Try to find the Google Analytics code linked to the site.**

By searching for *ua-* in the complete page source, we are rewarded with the Google
Analytics Tracking code *UA-251372-24*.

**Is the the Google Analytics code in use on another website?**

We suspect that the tracking code is unique for every website and that Google does not
reuse them in any way. However, we can check for the UA code on a lookup website. [^5]
This way, we confirm that the UA code does indeed, not appear on any other website.

**Does the link to this website have any obvious affiliate codes embedded with it?**

Affiliate codes serve as an identification with which website operators mark outgoing
links to clearly assign visitors for marketing. When searching for a `tag` in the
website's source code, there are no tags appended to the outgoing links.

Task 7: Connect the Dots
-----------------------------------------------------------------------------------------
**The target `heat[.]net` links to the external site `purchase[.]org`.
 Confirm the link between the two sites.**

After searching for the IP history of the two domains, we realize that the two of them
both had the same IP address owner in 2011 and 2012 of the company *Liquid Web, L.L.C*.

[^1]: https://tryhackme.com/room/webosint
[^2]: https://kinsta.com/blog/what-is-a-nameserver/
[^3]: https://web.archive.org/
[^4]: https://viewdns.info/
[^5]: https://www.nerdydata.com
