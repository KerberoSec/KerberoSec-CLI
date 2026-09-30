# Where Can My Robots Go?
## About

### General Information

__Challenge__: Where do robots find what pages are on a website? Hint: What does disallow tell a robot?

__Challege Category__: MISC

__Challenge Difficulty__: Easy

__Skills__: None, (Optional Topic: Web Crawlers)

## Solution

As the question suggests where do robots find pages on website, well that's robots.txt, so let's view the web page at ```/robots.txt``` i.e https://ctflearn.com/robots.txt

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Where%20Can%20My%20Robot%20Go%3F/1.png)

Here, it tells the all(*) User-Agents to not crawl on the directory page: ```/70r3hnanldfspufdsoifnlds.html``` let's go and view this directory. 

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Where%20Can%20My%20Robot%20Go%3F/2.png)

Here, we found the flag to this challenge.

__Flag__: CTFlearn{r0b0ts_4r3_th3_futur3}

## References

__NOTE__: If you want to know more about web crawlers, User Agents, and their permissions check out my blog [here](#).
