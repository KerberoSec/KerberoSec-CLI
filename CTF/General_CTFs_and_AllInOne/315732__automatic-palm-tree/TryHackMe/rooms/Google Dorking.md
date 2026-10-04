Google is arguably the most famous example of “Search Engines”, I mean who remembers Ask Jeeves? _shudders_

Now it might be rather patronising explaining how these “Search Engines” work, but there’s a lot more going on behind the scenes then what we see. More importantly, we can leverage this to our advantage to find all sorts of things that a wordlist wouldn’t. Researching as a whole: especially in the context of Cybersecurity encapsulates almost everything you do as a pentester. [MuirlandOracle](https://tryhackme.com/p/MuirlandOracle) has created a [fantastic room](https://tryhackme.com/room/introtoresearch) on learning the attitudes towards how to research, and what information you can gain from it exactly.

"Search Engines" such as Google are huge indexers: specifically, indexers of content spread across the World Wide Web.

These essentials in surfing the internet use “Crawlers” or “Spiders” to search for this content across the World Wide Web, which I will discuss in the next task.

---
What are Crawlers and how do They Work?

These crawlers discover content through various means. One being by pure discovery, where a URL is visited by the crawler and information regarding the content type of the website is returned to the search engine. In fact, there are lots of information modern crawlers scrape, but we will discuss how this is used later. Another method crawlers use to discover content is by following any and all URLs found from previously crawled websites. Much like a virus in the sense that it will want to traverse/spread to everything it can.  

Let's Visualise Some Things...

The diagram below is a high-level abstraction of how these web crawlers work. Once a web crawler discovers a domain such as **mywebsite.com**, it will index the entire contents of the domain, looking for keywords and other miscellaneous information: but I will discuss this miscellaneous information later.

![](https://i.imgur.com/4nrDDa0.png)

In the diagram above, "**mywebsite.com**" has been scraped as having the keywords as “Apple” “Banana" and “Pear”. These keywords are stored in a dictionary by the crawler, who then returns these to the search engine i.e. Google. Because of this persistence, Google now knows that the domain “**mywebsite.com**” has the keywords “Apple", “Banana” and “Pear”. As only one website has been crawled, if a user was to search for “Apple”...“**mywebsite.com**” would appear. This would result in the same behaviour if the user was to search for “Banana”. As the indexed contents from the crawler report the domain as having “Banana”, it will be displayed to the user.

As illustrated below, a user submits a query to the search engine of “Pears". Because the search engine only has the contents of one website that has been crawled with the keyword of “Pears” it will be the only domain that is presented to the user.   

![](https://i.imgur.com/nbbsAp4.png)

However, as we previously mentioned, **crawlers attempt to traverse, termed as crawling, every URL and file that they can find!** Say if “**mywebsite.com**” had the same keywords as before (“Apple", “Banana” and “Pear”), but also had a URL to another website “**anotherwebsite.com**”, the crawler will then attempt to traverse everything on that URL (**anotherwebsite.com**) and retrieve the contents of everything within that domain respectively.  

This is illustrated in the diagram below. The crawler initially finds “**mywebsite.com**”, where it crawls the contents of the website: finding the same keywords (“Apple", “Banana” and “Pear”) as before, but it has additionally found an external URL. Once the crawler is complete on “**mywebsite.com**”, it'll proceed to crawl the contents of the website “**anotherwebsite.com**”, where the keywords ("Tomatoes", “Strawberries” and “Pineapples”) are found on it. The crawler's dictionary now contains the contents of both “**mywebsite.com**” and “**anotherwebsite.com**”, which is then stored and saved within the search engine.

![](https://i.imgur.com/CIM2c6N.png)

Recapping

So to recap, the search engine now has knowledge of two domains that have been crawled:  
1. mywebsite.com  
2. anotherwebsite.com

Although note that “**anotherwebsite.com**” was only crawled because it was referenced by the first domain “**mywebsite.com**”. Because of this reference, the search engine knows the following about the two domains:  

|   |   |
|---|---|
|**Domain Name**|**Keyword**|
|mywebsite.com|Apples|
|mywebsite.com|Bananas|
|mywebsite.com|Pears|
|anotherwebsite.com|Tomatoes|
|anotherwebsite.com|Strawberries|
|anotherwebsite.com|Pineapples|

Or as illustrated below:

![](https://i.imgur.com/BJeI451.png)  

Now that the search engine has some knowledge about keywords, say if a user was to search for “Pears” the domain “**mywebsite.com**” will be displayed: as it is the only crawled domain containing "Pears":  

![](https://i.imgur.com/lBD6FPD.png)  

Likewise, say in this case the user now searches for "Strawberries". The domain "**anotherwebsite.com**" will be displayed, as it is the only domain that has been crawled by the search engine that contains the keyword "Strawberries":

![](https://i.imgur.com/1LGoslC.png)  

This is great...But imagine if a website had multiple external URL's (as they often do!) That'll require a lot of crawling to take place. There's always the chance that another website might have similar information as of that another website crawled: right? So how does the "Search Engine" decide on the hierarchy of the domains that are displayed to the user?

In the diagram below in this instance, if the user was to search for a keyword such as "Tomatoes" (which websites 1-3 contain) who decides what website gets displayed in what order?

![](https://i.imgur.com/OG2Fgsx.png)

A logical presumption would be that website 1 -> 3 would be displayed...But that's not how real-world domains work and/or are named.

So, who (or what) decides the hierarchy? Well...

Name the key term of what a "Crawler" is used to do

**flag: ``**

What is the name of the technique that "Search Engines" use to retrieve this information about websites?

**flag: ``**

What is an example of the type of contents that could be gathered from a website?

**flag: ``**

---
Search Engine Optimisation

Search Engine Optimisation or SEO is a prevalent and lucrative topic in modern-day search engines. In fact, so much so, that entire businesses capitalise on improving a domains SEO “ranking”. At an abstract view, search engines will “prioritise” those domains that are easier to index. There are many factors in how “optimal” a domain is: resulting in something similar to a point-scoring system.

To highlight a few influences on how these points are scored, factors such as:  

• How responsive your website is to the different browser types I.e. Google Chrome, Firefox and Internet Explorer: this includes Mobile phones!

• How easy it is to crawl your website (or if crawling is even allowed ...but we'll come to this later) through the use of "Sitemaps"

• What kind of keywords your website has (i.e. In our examples if the user was to search for a query like “Colours” no domain will be returned: as the search engine has not (yet) crawled a domain that has any keywords to do with “Colours”

There is a lot of complexity in how the various search engines individually "point-score" or rank these domains: including vast algorithms. Naturally, the companies running these search engines such as Google don't share exactly how the hierarchic view of domains ultimately ends up. Although, as these are businesses at the end of the day, you can pay to advertise/boost the order of which your domain is displayed.

There are various online tools: sometimes provided by the search engine providers themselves that will show you just how optimised your domain is. For example, let's use [Google's Site Analyser](https://pagespeed.web.dev/) to check the rating of [TryHackMe](https://tryhackme.com):  

![](https://i.imgur.com/kvaFolh.png)  

![](https://i.imgur.com/6rFnpVc.png)  

According to this tool, TryHackMe has an SEO rating of **85/100** (as of 14/11/2020). That's not too bad and it'll show the justifications as to how this score was calculated below on the page.

But...Who or What Regulates these "Crawlers"?

Aside from the search engines who provide these "Crawlers", website/web-server owners themselves ultimately stipulate what content "Crawlers" can scrape. Search engines will want to retrieve **everything** from a website: but there are a few cases where we wouldn't want **all** of the contents of our website to be indexed! Can you think of any...? How about a secret administrator login page? We don't want **everyone** to be able to find that directory: especially through a google search.

Introducing Robots.txt...