# NAVSAT

* Problem:

  Near the Sun, you find a malfunctioning warp beacon which is broadcasting a distress signal in a navigational channel. It looks like it's been damaged by solar radiation, and some of its data have been corrupted. If you can recover it, perhaps it will point at you to something interesting.

* Solution:

  Using a hex editor (I used ghex), we can see that the magic number of the file has been broken, thus we manually fix it using the hex editor. Here is a reference for [magic number](http://en.wikipedia.org/wiki/List_of_file_signatures). In particular, we change the first two bytes to 50 4B. Then the zip file will be fixed
  
  NOTE we can actually see the key in the hex editor, without fixing the zip file...

* Answer:
  
  Next stop Tau Eridani
