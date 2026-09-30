#Subscribers 
https://tryhackme.com/room/redteamrecon

“Know your enemy, know his sword.” wrote Miyamoto Musashi in his book, A Book of Five Rings: The Classic Guide to Strategy. He also wrote, “You win battles by knowing the enemy’s timing, and using a timing which the enemy does not expect.” Although this was written when swords and spears won battles, it also applies to cyberspace, where attacks are launched via keyboards and crafted packets. The more you know about your target’s infrastructure and personnel, the better you can orchestrate your attacks.

In a red team operation, you might start with no more than a company name, from which you need to start gathering information about the target. This is where reconnaissance comes into play. Reconnaissance (recon) can be defined as a preliminary survey or observation of your target (client) without alerting them to your activities. If your recon activities create too much noise, the other party would be alerted, which might decrease the likelihood of your success.

The tasks of this room cover the following topics:

- Types of reconnaissance activities
- WHOIS and DNS-based reconnaissance
- Advanced searching
- Searching by image
- Google Hacking
- Specialized search engines
- Recon-ng
- Maltego

- Discovering subdomains related to our target company
- Gathering publicly available information about a host and IP addresses
- Finding email addresses related to the target
- Discovering login credentials and leaked passwords
- Locating leaked documents and spreadsheets

Reconnaissance can be broken down into two parts:
- passive reconnaissance 
- active reconnaissance

In this room, we will be focusing on passive reconnaissance, i.e., techniques that don’t alert the target or create 'noise'. In later rooms, we will use active reconnaissance tools that tend to be noisy by nature.

## Taxonomy of reconnaissance 

Reconnaissance (recon) can be classified into two parts:

1. **Passive Recon**: can be carried out by watching passively
2. **Active Recon**: requires interacting with the target to provoke it in order to observe its response.

Passive recon doesn't require interacting with the target. In other words, you aren't sending any packets or requests to the target or the systems your target owns. Instead, passive recon relies on <span style="color:#a0f958">publicly available information</span> that is collected and maintained by a third party. Open Source Intelligence (OSINT) is used to collect information about the target and can be as simple as viewing a target's publicly available social media profile. 

Example information that we might collect includes domain names, IP address blocks, email addresses, employee names, and job posts. In the upcoming task, we'll see how to query DNS records and expand on the topics from the [Passive Reconnaissance](https://tryhackme.com/room/passiverecon) room and introduce advanced tooling to aid in your recon.

<span style="color:#a0f958">Active recon requires interacting </span>with the target by sending requests and packets and observing if and how it responds. The responses collected: or lack of responses: would enable us to expand on the picture we started developing using passive recon. An example of active reconnaissance is using Nmap to scan target subnets and live hosts. Other examples can be found in the [Active Reconnaissance](https://tryhackme.com/room/activerecon) room. Some information that we would want to discover include live hosts, running servers, listening services, and version numbers.

Active recon can be classified as:

1. **External Recon**: Conducted outside the target's network and focuses on the externally facing assets assessable from the Internet. One example is running Nikto from outside the company network.
2. **Internal Recon**: Conducted from within the target company's network. In other words, the pentester or red teamer might be physically located inside the company building. In this scenario, they might be using an exploited host on the target's network. An example would be using Nessus to scan the internal network using one of the target’s computers.

## built-in tools 

Before we start using the `whois` tool, let's look at WHOIS. WHOIS is a request and response protocol that follows the [RFC 3912](https://www.ietf.org/rfc/rfc3912.txt) specification. A WHOIS server listens on TCP port 43 for incoming requests. The domain registrar is responsible for maintaining the WHOIS records for the domain names it is leasing. `whois` will query the WHOIS server to provide all saved records. In the following example, we can see `whois` provides us with:

- Registrar WHOIS server
- Registrar URL
- Record creation date
- Record update date
- Registrant contact info and address (unless withheld for privacy)
- Admin contact info and address (unless withheld for privacy)
- Tech contact info and address (unless withheld for privacy)

```
whois thmredteam.com
nslookup cafe.thmredteam.com

# Domain Information Groper (dig)
dig cafe.thmredteam.com @1.1.1.1

traceroute cafe.thmredteam.com

dig clinic.thmredteam.com
host clinic.thmredteam.com

```

## advanced searching

Being able to use a search engine efficiently is a crucial skill. The following table shows some popular search modifiers that work with many popular search engines.

```
"search phrase"
OSINT filetype:pdf
salary site: blog.tryhackme.com 
pentest -site:example.com 
walkthrough intitle:TryHackMe 
challenge inurl:tryhackme
```

Search engines crawl the world wide web day and night to index new web pages and files. Sometimes this can lead to indexing confidential information. Examples of confidential information include:

- Documents for internal company use
- Confidential spreadsheets with usernames, email addresses, and even passwords
- Files containing usernames
- Sensitive directories
- Service version number (some of which might be vulnerable and unpatched)
- Error messages

Combining advanced Google searches with specific terms, documents containing sensitive information or vulnerable web servers can be found. Websites such as [Google Hacking Database](https://www.exploit-db.com/google-hacking-database) (GHDB) collect such search terms and are publicly available. Let's take a look at some of the GHDB queries to see if our client has any confidential information exposed via search engines. GHDB contains queries under the following categories:

```
# footholds 
intitle: "index of" "nginx.log"

# files containing usernames
intitle:"index of" "contacts.txt"

# sensitive directories
inurl:/certs/server.key

# web server detection 
intitle:"GlassFish Server - Server Running"

# vulnerable servers
intext:"user name" intext:"orion core" -solarwinds.com

# error messages
intitle:"index of" errors.log

```

You might need to adapt these Google queries to fit your needs as the queries will return results from all web servers that fit the criteria and were indexed. To avoid legal issues, it is best to refrain from accessing any files outside the scope of your legal agreement.

### social media

Social media websites have become very popular for not only personal use but also for corporate use. Some social media platforms can reveal tons of information about the target. This is especially true as many users tend to overshare details about themselves and their work. To name a few, it's worthwhile checking the following:

- LinkedIn
- Twitter
- Facebook
- Instagram

Social media websites make it easy to collect the names of a given company's employees; moreover, in certain instances, you might learn specific pieces of information that can reveal answers to password recovery questions or gain ideas to include in a targeted wordlist. Posts from technical staff might reveal details about a company’s systems and vendors. 

- For example, a network engineer who was recently issued Juniper certifications may allude to Juniper networking infrastructure being used in their employer’s environment.

### Job Ads

Job advertisements can also tell you a lot about a company. In addition to revealing names and email addresses, job posts for technical positions could give insight into the target company’s systems and infrastructure. The popular job posts might vary from one country to another. Make sure to check job listing sites in the countries where your client would post their ads. Moreover, it is always worth checking their website for any job opening and seeing if this can leak any interesting information.

Note that the [Wayback Machine](https://archive.org/web/) can be helpful to retrieve previous versions of a job opening page on your client’s site.

```
How would you search using Google for `xls` indexed for http://clinic.thmredteam.com?

filetype:xls site:clinic.thmredteam.com

How would you search using Google for files with the word `passwords` for http://clinic.thmredteam.com?

passwords site:clinic.themredteam.com
```

## specialized search engines 

There are a handful of websites that offer advanced DNS services that are free to use. Some of these websites offer rich functionality and could have a complete room dedicated to exploring one domain. For now, we'll focus on key DNS related aspects. We will consider the following:

- [ViewDNS.info](https://viewdns.info/)
- [Threat Intelligence Platform](https://threatintelligenceplatform.com/)

#### ViewDNS.info

[ViewDNS.info](https://viewdns.info/) offers _Reverse IP Lookup_. Initially, each web server would use one or more IP addresses; however, today, it is common to come across shared hosting servers. With shared hosting, one IP address is shared among many different web servers with different domain names. With reverse IP lookup, starting from a domain name or an IP address, you can find the other domain names using a specific IP address(es).

 reverse IP lookup to find other servers sharing the same IP addresses used by `cafe.thmredteam.com` 

1 IP => many addresses

#### Threat Intelligence Platform

[Threat Intelligence Platform](https://threatintelligenceplatform.com/) requires you to provide a domain name or an IP address, and it will launch a series of tests from malware checks to WHOIS and DNS queries. The WHOIS and DNS results are similar to the results we would get using `whois` and `dig`, but Threat Intelligence Platform presents them in a more readable and visually appealing way. There is extra information that we get with our report.

- we look up `thmredteam.com`, we see that Name Server (NS) records were resolved to their respective IPv4 and IPv6
- we searched for `cafe.thmredteam.com`, we could also get a list of other domains on the same IP address.

#### Censys

[Censys Search](https://search.censys.io/) can provide a lot of information about IP addresses and domains. In this example, we look up one of the IP addresses that `cafe.thmredteam.com` resolves to. We can easily infer that the IP address we looked up belongs to Cloudflare. We can see information related to ports 80 and 443, among others; however, it's clear that this IP address is used to server websites other than `cafe.thmredteam.com`. In other words, this IP address belongs to a company other than our client, [Organic Cafe](https://cafe.thmredteam.com/). It's critical to make this distinction so that we don’t probe systems outside the scope of our contract.

#### Shodan

You might remember using [Shodan](https://www.shodan.io/) in the [Passive Reconnaissance](https://tryhackme.com/room/passiverecon) room. In this section, we will demonstrate how to use Shodan from the command line.

To use Shodan from the command-line properly, you need to create an account with [Shodan](https://www.shodan.io/), then configure `shodan` to use your API key using the command, `shodan init API_KEY`.

You can use different filters depending on the [type of your Shodan account](https://account.shodan.io/billing). To learn more about what you can do with `shodan`, we suggest that you check out [Shodan CLI](https://cli.shodan.io/). Let’s demonstrate a simple example of looking up information about one of the IP addresses we got from `nslookup cafe.thmredteam.com`. Using `shodan host IP_ADDRESS`, we can get the geographical location of the IP address and the open ports, as shown below.

```
shodan myip
```

## Recon-ng 

[Recon-ng](https://github.com/lanmaster53/recon-ng) is a framework that helps automate the OSINT work. It uses modules from various authors and provides a multitude of functionality. Some modules require keys to work; the key allows the module to query the related online API. In this task, we will demonstrate using Recon-ng in the terminal.

From a penetration testing and red team point of view, Recon-ng can be used to find various bits and pieces of information that can aid in an operation or OSINT task. All the data collected is automatically saved in the database related to your workspace. For instance, you might discover host addresses to later port-scan or collect contact email addresses for phishing attacks.

You can start Recon-ng by running the command `recon-ng`. 
Starting Recon-ng will give you a prompt like `[recon-ng][default] >`. 
Need to select the installed module you want to use.
- if this is the first time you're running `recon-ng`, you will need to install the module(s) you need.

#### creating a workspace 

```
workspaces create WORKSPACE_NAME
recon-ng -w WORKSPACE_NAME
```

#### seeding a database 

In reconnaissance, you are starting with one piece of information and transforming it into new pieces of information. 

- For instance, you might start your research with a company name and use that to discover the domain name(s), contacts and profiles. Then you would use the new information you obtained to transform it further and learn more about your target.

Let’s consider the case where we know the target's domain name, `thmredteam.com`, and we would like to feed it into the Recon-ng database related to the active workspace. If we want to check the names of the tables in our database, we can run `db schema`.

We want to insert the domain name `thmredteam.com` into the domains table. We can do this using the command `db insert domains`.

```
recon-ng -w thmredteam
[...]
[recon-ng][thmredteam] > db insert domains
domain (TEXT): thmredteam.com

[recon-ng][thmredteam] > marketplace search
```

#### recon-ng marketplace 

We have a domain name, so a logical next step would be to search for a module that transforms domains into other types of information. Assuming we are starting from a fresh installation of Recon-ng, we will search for suitable modules from the marketplace.

Before you install modules using the marketplace, these are some useful commands related to marketplace usage:

```
marketplace search KEYWORD
marketplace info MODULE
marketplace install MODULE
marketplace remove MODULE

Categories: discovery, import, recon and reporting
subcategories exist
some modules require a key:    `*` under the `K` column.
some modules have dependencies `*` under the `D` column

recon
L domains-companies, domains-contacts, domains-hosts
```

```
recon-ng -w thmredteam
[...]
[recon-ng][thmredteam] > db insert domains
domain (TEXT): thmredteam.com

[recon-ng][thmredteam] > marketplace search domains-
[*] Searching module index for 'domains-' ...

PATH  | VERSION | STATUS | UPDATED | D | K
--------------------------------------------

```

example
```
recon/domains-hosts/google_site_web | 1.0 | not installed | 2019-06-24 |

marketplace info google_site_web

marketplace install google_site_web
```

#### working with installed modules 

```
modules search
modules load MODULE

modules load viewdns_reverse_whois
options list
options set <option> <value>
```

```
recon-ng -w thmredteam
[recon-ng][thmredteam] > load google_site_web 
[recon-ng][thmredteam][google_site_web] > run

[*] Country: None 
[*] Host: cafe.thmredteam.com
...
[*] Country: None 
[*] Host: clinic.thmredteam.com
...

```

#### API keys

Some modules cannot be used without a key for the respective service API. `K` indicates that you need to provide the relevant service key to use the module in question.

```
keys list
keys add KEY_NAME KEY_VALUE
keys remove KEY_NAME
```

#### general module use 

```
modules load MODULE
Ctrl + C                # unloads module
info
options list
options set NAME VALUE
run
```

```
How do you start `recon-ng` with the workspace `clinicredteam`?

recon-ng -w clinicredteam

How many modules with the name `virustotal` exist?
marketplace search virustotal
2

There is a single module under `hosts-domains`. What is its name?
marketplace search hosts-domains
migrate_hosts

`censys_email_address` is a module that “retrieves email addresses from the TLS certificates for a company.” Who is the author?

marketplace info censys_email_address
censys inc

```

## Maltego

[Maltego](https://www.maltego.com/) is an application that blends mind-mapping with OSINT. In general, you would start with a domain name, company name, person’s name, email address, etc. Then you can let this piece of information go through various transforms.  

The information collected in Maltego can be used for later stages. For instance, company information, contact names, and email addresses collected can be used to create very legitimate-looking phishing emails.

Think of each block on a Maltego graph as an entity. An entity can have values to describe it. In Maltego’s terminology, a **transform** is a piece of code that would query an API to retrieve information related to a specific entity. The logic is shown in the figure below. _Information_ related to an entity goes via a _transform_ to return zero or more entities.

Every transform might lead to several new values. For instance, if we start from the “DNS Name” `cafe.thmredteam.com`, we expect to get new kinds of entities based on the transform we use. For instance, “To IP Address” is expected to return IP addresses as shown next.

```
on Maltego is to right-click on the “DNS Name”
cafe.thmredteam.com

1. Standard Transforms
2. Resolve to IP
3. To IP Address (DNS)

apply another transform for one of the IP addresses. Consider the following transform:

1. DNS from IP
2. To DNS Name from passive DNS (Robtex)

end up with a graph
```

Now that we have learned how Maltego’s power stems from its transforms, the only logical thing is to make Maltego more powerful by adding new Transforms. Transforms are usually grouped into different categories based on data type, pricing, and target audience. Although many transforms can be used using Maltego Community Edition and free transforms, other transforms require a paid subscription. A screenshot is shown below to give a clearer idea.

Using Maltego requires activation, even if you opt for Maltego CE (Community Edition). Therefore, the following questions can be answered by visiting [Maltego Transform Hub](https://www.maltego.com/transform-hub/) or by installing and activating Maltego CE on your own system (not on the AttackBox).

https://www.maltego.com/transform-hub/

```
What is the name of the transform that queries NIST’s National Vulnerability Database?

NIST NVD

What is the name of the project that offers a transform based on ATT&CK?

MISP Project
```

