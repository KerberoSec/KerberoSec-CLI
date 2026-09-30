### Problem Statement
```txt
Files can always be changed in a secret way. Can you find the flag?
[cat.jpg](https://mercury.picoctf.net/static/a614a27d4cb251d04c7d2f3f3f76a965/cat.jpg)
```

---

First we check details about the file using the [`file`](https://linux.die.net/man/1/file) and the [`identify`](https://linux.die.net/man/1/identify) commands:
```console
$ file cat.jpg
cat.jpg: JPEG image data, JFIF standard 1.02, aspect ratio, density 1x1, segment length 16, baseline, precision 8, 2560x1598, components 3

$ identify cat.jpg
cat.jpg JPEG 2560x1598 2560x1598+0+0 8-bit sRGB 878136B 0.000u 0:00.000
```

Nothing special, so we proceed to check for hidden strings in the file using: [`strings`](https://linux.die.net/man/1/strings)

```console
$ strings cat.jpg | head -n 25
JFIF
0Photoshop 3.0
8BIM
PicoCTF
http://ns.adobe.com/xap/1.0/
<?xpacket begin='
' id='W5M0MpCehiHzreSzNTczkc9d'?>
<x:xmpmeta xmlns:x='adobe:ns:meta/' x:xmptk='Image::ExifTool 10.80'>
<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>
 <rdf:Description rdf:about=''
  xmlns:cc='http://creativecommons.org/ns#'>
  <cc:license rdf:resource='cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9'/>
 </rdf:Description>
 <rdf:Description rdf:about=''
  xmlns:dc='http://purl.org/dc/elements/1.1/'>
  <dc:rights>
   <rdf:Alt>
    <rdf:li xml:lang='x-default'>PicoCTF</rdf:li>
   </rdf:Alt>
  </dc:rights>
 </rdf:Description>
</rdf:RDF>
</x:xmpmeta>

```

We notice that the data we get is in xml format. We'll save this to `information.xml`

After analysis of the xml file, we see the following line:
```xml
<cc:license rdf:resource='cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9'/>
```

The resource field looks like `base64` encoded data.
After decoding this, we get:

```console
$ echo cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9 | base64 -d
picoCTF{the_m3tadata_1s_modified}
```

We have thus obtained the flag

---
#### The Flag
    picoCTF{the_m3tadata_1s_modified}

Link to the challenge: [information](https://play.picoctf.org/practice/challenge/186)
