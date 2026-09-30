<h1>
  Prompt
</h1>

*[Image: alt text]*

<h1>
  Writeup
</h1>

```
$ binwalk -e dolls.jpg 
$ cd _dolls.jpg.extracted 
$ cd base_images
$ binwalk -e 2_c.jpg 
$ cd _2_c.jpg.extracted 
$ cd base_images 
$ binwalk -e 3_c.jpg 
$ cd _3_c.jpg.extracted
$ cd base_images
$ binwalk -e 4_c.jpg
$ cd _4_c.jpg.extracted
$ cat flag.txt
```

<h1>
  Flag
</h1>

picoCTF{ac0072c423ee13bfc0b166af72e25b61}
