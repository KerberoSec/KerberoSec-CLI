# Yummy

* Problem:

  You want to find out the docking bay numbers for space ships that are ready to launch. Luckily for you, the website for the docking bay ship [status page](https://2013.picoctf.com/problems/yummy) doesn't seem so secure....
  
  Enter the docking bay for any of the ships that are awaiting launch.

* Solution:

  Checking the source code reveals 
`<!-- DEBUG: Expected Cookie: "authorization=administrator"`
use the console and run
`document.cookie="authorization=administrator"`
refresh the page 
and do what the instruction says

* Answer:

  DX7-2 or DX9-5 or DX4-9 or DX6-7 
(This is 4 keys, any of them works)
