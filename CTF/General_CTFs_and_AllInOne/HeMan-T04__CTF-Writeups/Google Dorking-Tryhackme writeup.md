# Google Dorking: Tryhackme Writeup
*This writeup explains the Google Dorking tryhackme room and my approach of doing the task given in the room. https://tryhackme.com/room/googledorking*

## Task One (Ye Ol' Search Engine):
This talks about search engines and web indexers, how they work and what we can use it for. it uses Google as a prime example as it is the most used search engine.<br>
>### Rodger dodger ! :
>### There is nothing to do here. Press Complete and move to the next task

## Task Two (Let's Learn About Crawlers):
This section that explains the use of crawlers and the "How" a website is indexed.<br>
*Hint: To solve the questions of this task you can search the webpage for keywords by Ctrl+f*
>### Question 1: Name the key term of what a "Crawler" is used to do?
>The answer to this question can be found reading the below given paragraph or by searching for "crawler" and seeing what sentences contains the word that is the answer<br><br>
>
>### Ans 1: Index 
<br>

>### Question 2: What is the name of the technique that "Search Engines" use to retrieve this information about websites?
>If you have read the information given in the task this answer will get to you automatically but to find it without reading is a bit harder you have to search (Ctrl+f) for "Search Engines" as clue given in the question and after reading all the results thouroughly you will find the answer in below given paragraph.
<br><br>
>
>### Ans 2: Crawling
<br>

>### Question 3: What is an example of the type of contents that could be gathered from a website?
>Answer to this question can be found for searching the word "contents". It can have multiple answers as when a website is scrapped it can gather any and every information present on the site like urls of another website given in crawled website or information given on specific subjects. But we find the correct answer in the below given paragraph<br><br>
>
>### Ans 3: Keywords
<br>

## Task 3 (Enter: Search Engine Optimisation):
This section goes over SEO and how websites can be ranked by the amount of keywords and hashtags that it meets in searchabitlty for users, social media and search engines.<br>
In this task we use [SEO Checkup tool](https://web.dev/measure/) to get insights for tryhackme website.<br><br>

>### Question 1: Use the same SEO checkup tool and other online alternatives to see how their results compare for https://tryhackme.com and http://googledorking.cmnatic.co.uk
>In this question you just have to see the diffrence between two websites one tryhackme and other can be your choice of website as the abve given one doesn't exists.
>### Ans 1: You don't have to do anything just press complete and move to the next.

## Task 4 (Beepboop: Robots.txt):
This section goes over Robots.txt. What are they, few keywords of robots.txt,how to hide directories an files from being indexed, and which crawlers have access to index the website.
>### Question 1: Where would "robots.txt" be located on the domain "ablog.com"
>Answer to this is given in the paragraphs of the task as robots.txt is a container or file containing what can be indexed or what can't be so crawler should reach it the first so it is served in the root directory. I have provided the para where the answer is below.<br><br>
>
>### Ans 1: ablog.com/robots.txt
<br>

>### Question 2: If a website was to have a sitemap, where would that be located?
> A sitemap is a file with xml format which contains index for crawlers to use
> ### Ans 2:  /sitemap.xml
<br>

>### Question 3: How would we only allow "Bingbot" to index the website?
> In robots.txt User-agent keyword defines whcih crawler can index the website and combined with other keyword such as allow sets permissions to the allowed crawler.<br><br>
> 
> ### Ans 3: User-agent:Bingbot
<br>

>### Question 4:How would we prevent a "Crawler" from indexing the directory "/dont-index-me/"?
> Using the example given in the section.<br><br>
> 
>### Ans 4: Disallow: /dont-index-me/
<br>

>### Question 5: What is the extension of a Unix/Linux system configuration file that we might want to hide from "Crawlers"?
>The hint for this says “system files are usually 3/4 characters!” so that means the configuration file extension is slightly short than the usual abbreviation of config
>### Ans 5: .conf
<br>

## Task 5 (Sitemaps):
This section Talks about Sitemaps and why sitemaps are favourable for the search engines. It is self explanatory, Once you have read it questions are easy to do. <br>
>### Question 1: What is the typical file structure of a "Sitemap"?
>The answer to this question is mentioned in this section and the section before it.
>### Ans 1: xml 
<br>

>### Question 2: What real life example can "Sitemaps" be compared to?
>The sitemap is the map to help the little crawlers to not get lost on a website.
>### Ans 2: Map
<br>

>### Question 3: Name the keyword for the path taken for content on a website
>The first explanation of routes are in the lesson’s sentence “The blue rectangles represent the route to nested-content, similar to a directory I.e. “Products” for a store.”
>### Ans 3: Route
<br>

## Task 6 (What is Google Dorking?):
As the title of the task says this section talks about google dorking, google used for advanced searching, how to gather specfic information which is indexed by google and how to use it for our advantage and how what makes google dorking appealing.<br>
>### Question 1: What would be the format used to query the site bbc.co.uk about flood defences
> To search a specific site we use site:domain.com keyword and if we want to find a specific topic in that site we add that topic after the site keyword.
> ### Ans 1: site:bbc.co.uk flood defences
<br>

>### Question 2: What term would you use to search by file type?
> There is table given with specific keywords in the task.
> ### Ans 2: filetype:
<br>

>### Question 3: What term can we use to look for login pages?
> The Hint in this says “term: query” so if you think about an intitle on a web address and web page title, it may say website.com/login, or the page title itself may say “login”
> ### Ans 3: intitle:login