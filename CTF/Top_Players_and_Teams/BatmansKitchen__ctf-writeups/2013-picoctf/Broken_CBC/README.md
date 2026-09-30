# Broken CBC

* Problem:

  We found this service running on vuln.picoctf.com. Unfortunately the sensitive information such as the encryption keys, IV, and flag have all been deleted. Our cryptographic spies tell us it is still insecure, but we aren't sure how to send it commands. Do you think you can figure it out?

* Solution:

  The website given by the hint of this problem in my opinion is hard to follow, hence I think this website is actually better. Read this website and understand it first [CBC](http://blog.gdssecurity.com/labs/2010/9/14/automated-padding-oracle-attacks-with-padbuster.html) The website gives a thorough introduction to what is padding oracle attack and how it works. I've also included the encryption and decryption diagram in under this directory. There are also some papers to help the understanding of padding oracle (they didn't really help me though...)

  MAKE SURE YOU UNDERSTAND CBC DECRYPTION AND ENCRYPTION AND PADDING ORACLE DECRYPTION BEFORE READING ON!!!!

  NOTE that this method works not only because of padding oracle, but also becuase that the server ignores the first block of decrypted message
  (Our solution will only have blocks after first block decrypted to desired value, if we don't have the initial IV, the first block will decrpty to junk)
  
  Padding oracle encryption can be done as follow:
  
  Choose a block of arbitrary cipher, say all zeros

  Decrypt it using padding oracle decryption

  Now we know the intermidate value for the decryption, we can let plain text equal to our plain text desired(In this case "flag" with padding) and xor plain text and intermidate value to get the desired IV

  Let this IV be the block preceding our chosen cipher block(in this case all zeros) and send it to the server

  I have included my own padding oracle python script in the directory
  NOTE that inside the directory there's also a library pypadbuster created by [escbar](https://github.com/escbar/pypadbuster) that can perform the padding oracle atack with a self defined padding_oracle function. This solution is in others_solution.py
  
  HOWEVER, PYPADBUSTER HAS AN ERROR IN THE PADDING FUNCTION, I HAVE FIXED IT IN THE VERSION IN MY DIRECTORY, IF YOU USE THE ONE FROM GITHUB, IT WILL WORK FOR THIS PROBLEM, BUT MAY NOT WORK WITH OTHERS, USE WITH CAUTION!!!!

  My suggestion is to really understand how padding oracle works, and write your own script

  One thing I've struggled on when writing my own script is that I forgot to receive the first line from the host, so all my intermediate value are off by one, thus my method is not working. This is easily overlooked.

* Answer:
  
  NOW_YOURE_BASICALLY_A_POET
  (There's a pun in this flag: POET(Padding Oracle Exploitation Tool))
