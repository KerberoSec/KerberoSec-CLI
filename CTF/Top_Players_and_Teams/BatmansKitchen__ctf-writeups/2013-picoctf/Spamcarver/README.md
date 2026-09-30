# Spamcarver

* Problem:
  
  While exploring an alien tomb, you find an ancient jpg of an ancient can of SPAM. It seems valueless, but the guardbots really want it back, so perhaps there's something more here than meets the eye. Maybe it's cursed, or hexed, if you will?

* Solution:

  As the name suggested, this is a data carving problem. By observing the file with hexeditor, we find that it contains the string PK, according to [this tutorial](http://dirtbags.net/ctf/tutorial/carving.html) This is the initials of Phil Katz, creator of the zip file format. Hence we know that there's a zip file hidden inside the jpg file.
  
  Run `foremost spamcarver.jpg`, then we will get a new zip file in the output folder. Run `unzip 00000101.zip `, we get the key.

* Answer:

  7adf6f07e0810003c585a7be97868a90
  
  (I've also searched how to create this kind of image, it turns out you can easily create it by `cat image.jpg compressed.zip > new.jpg`)
