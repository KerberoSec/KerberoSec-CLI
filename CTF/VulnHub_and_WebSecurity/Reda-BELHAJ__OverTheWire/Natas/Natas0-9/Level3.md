# Natas Level 3

The ***URL*** to which you need to connect is *http://natas3.natas.labs.overthewire.org*. The ***username*** is *natas3* and the ***password*** is *sJIJNW6ucpu6HPZ1ZAchaDtwd7oGrD14*. 

1. press Ctrl+U (PC) or ⌥ Option + ⌘ Command + U (Mac) to display the source code. (view-source:http://natas3.natas.labs.overthewire.org/)

```html
<!-- No more information leaks!! Not even Google will find it this time... -->
```
It's a hint to go and check a file called "Robots.txt". Robots.txt is a text file with instructions for search engine crawlers. It defines which areas of a website crawlers are allowed to search [...](https://www.seobility.net/en/wiki/Robots.txt?utm_source=google&utm_medium=cpc&utm_campaign=wiki_en&utm_term={robots%20txt}&utm_content=lp_robots.txt&gclid=CjwKCAiApNSABhAlEiwANuR9YBJg7vpAWY8cgaeH0S2ZLDFehVULDjwaYRg5q0t66Ok-f3Cxs2ErGBoCUgoQAvD_BwE)
```
User-agent: *
Disallow: /s3cr3t/
```
2. Lets check the folder that we got: http://natas3.natas.labs.overthewire.org/s3cr3t/users.txt
```
natas4:Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ
```
