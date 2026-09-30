# Try Them All!

* Problem:

  You have found a passwd file containing salted passwords. An unprotected configuration file has revealed a salt of `8093`. The hashed password for the 'admin' user appears to be `e403394e95009842a555119622681556`, try to brute force this password.

* Solution:

  Writing a python script and compute the hashcode for all words in `/usr/share/dict/words + salt` with function in hashlib gives the answer

* Answer:
  
  approving

