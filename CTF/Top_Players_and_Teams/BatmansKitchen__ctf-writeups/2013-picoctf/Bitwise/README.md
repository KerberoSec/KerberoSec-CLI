# Bitwise

* Problem:

  You see the doors to the loading bay of the hangar, but they are locked. However, you are able to extract the password verification program from the control panel... Can you find the password to gain access to the loading bay?

* Solution (in python):

  Modify the python script, iterate over each element in verify_arr
since elements are char, iterate i over `range(0,256)` and compute 
`(((i << 5) | (i >> 3)) ^ 111) & 255` check when it matches the element in verify_arr

* Answer: 

  ub3rs3cr3t
