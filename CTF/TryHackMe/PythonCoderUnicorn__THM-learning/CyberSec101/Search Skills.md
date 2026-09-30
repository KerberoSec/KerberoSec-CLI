
https://tryhackme.com/r/room/searchskills

The goal of this room is to teach:
- Evaluate information sources
- Use search engines efficiently
- Explore specialized search engines
- Read technical documentation
- Make use of social media
- Check news outlets

## evaluate info sources

- **Source**: Identify the author or organization publishing the information. Consider whether they are reputable and authoritative on the subject matter. Publishing a blog post does not make one an authority on the subject.
- 
- **Evidence and reasoning**: Check whether the claims are backed by credible evidence and logical reasoning. We are seeking hard facts and solid arguments.
- 
- **Objectivity and bias**: Evaluate whether the information is presented impartially and rationally, reflecting multiple perspectives. We are not interested in authors pushing shady agendas, whether to promote a product or attack a rival.
- 
- **Corroboration and consistency**: Validate the presented information by corroboration from multiple independent sources. Check whether multiple reliable and reputable sources agree on the central claims.

```
What do you call a cryptographic method or product considered bogus or fraudulent?

snake oil

What is the name of the command replacing `netstat` in Linux systems?

ss      socket statistics
```

## search engine 

Almost every Internet search engine allows you to carry out advanced searches. Consider the following examples:

- [Google](https://www.google.com/advanced_search)
- [Bing](https://support.microsoft.com/en-us/topic/advanced-search-options-b92e25f1-0085-4271-bdf9-14aaea720930)
- [DuckDuckGo](https://duckduckgo.com/duckduckgo-help-pages/results/syntax/)

exact phrase 
```
"exact phrase"
```
site:
```
site: tryhackme.com <keywords>
```
-
```
socks -soc
```
filetype
```
filetype: pdf cyber security
```

https://github.com/cipher387/Advanced-search-operators-list

```
filetype:pdf cyber warfare report

```

## specialized search

### shodan 

Let’s start with [Shodan](https://www.shodan.io/), a search engine for devices connected to the Internet. It allows you to search for specific types and versions of servers, networking equipment, industrial control systems, and IoT devices. You may want to see how many servers are still running Apache 2.4.1 and the distribution across countries. To find the answer, we can search for `apache 2.4.1`, which will return the list of servers with the string “apache 2.4.1” in their headers.

https://trends.shodan.io/ <<< membership needed

` https://www.shodan.io/search?query= `

### Censys

At first glance, [Censys](https://search.censys.io/) appears similar to Shodan. However, Shodan focuses on Internet-connected devices and systems, such as servers, routers, webcams, and IoT devices. Censys, on the other hand, focuses on Internet-connected hosts, websites, certificates, and other Internet assets. Some of its use cases include enumerating domains in use, auditing open ports and services, and discovering rogue assets within a network. You might want to check [Censys Search Use Cases](https://support.censys.io/hc/en-us/articles/20720064229140-Censys-Search-Use-Cases).

```
What is the top country with lighttpd servers?

https://www.shodan.io/search?query=lighttpd
united states

What does BitDefenderFalx detect the file with the hash `2de70ca737c1f4602517c555ddd54165432cf231ffc0e21fb2e23b9dd14e7fb4` as?

Android.Riskware.Agent.LHH
```

## vulnerabilities & Exploits 

## CVE

We can think of the Common Vulnerabilities and Exposures (CVE) program as a dictionary of vulnerabilities. It provides a standardized identifier for vulnerabilities and security issues in software and hardware products.

https://www.cve.org/
https://nvd.nist.gov/

## Exploit Database

There are many reasons why you would want to exploit a vulnerable application; one would be assessing a company’s security as part of its red team. Needless to say, we should not try to exploit a vulnerable system unless we are given permission, usually via a legally binding agreement.

Now that we have permission to exploit a vulnerable system, we might need to find a working exploit code. One resource is the [Exploit Database](https://www.exploit-db.com/). The Exploit Database lists exploit codes from various authors; some of these exploit codes are tested and marked as verified.

[GitHub](https://github.com/), a web-based platform for software development, can contain many tools related to CVEs, along with proof-of-concept (PoC) and exploit codes. To demonstrate this idea, check the screenshot below of search results on GitHub that are related to the Heartbleed vulnerability.

```
What utility does CVE-2024-3094 refer to?

xz  tarball
```

## technical documentation

linux `man` page 

Microsoft provides an official [Technical Documentation](https://learn.microsoft.com/) page for its products.

Product Documentation

Every popular product is expected to have well-organized documentation. This documentation provides an official and reliable source of information about the product features and functions. Examples include [Snort Official Documentation](https://www.snort.org/documents), [Apache HTTP Server Documentation](https://httpd.apache.org/docs/), [PHP Documentation](https://www.php.net/manual/en/index.php), and [Node.js Documentation](https://nodejs.org/docs/latest/api/).

It is always rewarding to check the official documentation as it is the most up-to-date and offers the most complete product information.

```
What is the `netstat` parameter in MS Windows that displays the executable associated with each active connection and listening port?

https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netstat

-b
```

