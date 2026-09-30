# Broken RSA

* Problem:
 
  This RSA service seems to be broken. They encrypt the flag and send it to you each time... but they throw out the private key and you never get to see it. Any ideas on how to recover the flag?

  Running on vuln.picoctf.com

* Hint:

  Connect from the shell with 'nc vuln.picoctf.com 6666'. Read up on RSA and try to figure out why this might be bad... Good luck!

* Solution:

  At first, we noticed that although the server used RSA encryption, but it does use it completely, it only uses the n value generated and computed pow(message, 3, n), this tells us that e is hardcoded to 3. Since this is a low exponent, we can try to find the plain text using [Hastad's broadcast Attack](http://en.wikipedia.org/wiki/Coppersmith%27s_Attack). 

  This problem is tricky, not because it's difficult to find the solution, but because the solution will not always work. We need to find three sets of N and C pairs, so that we can craft a M^3 < N1N2N3. the Ns also need to coprime each other, or else we will have a mess to deal with. For finding N pairs, we can use `m**3-c` and compute the gcd for three tries (see code for more detail). This will not always give us n, but it is the best we can do. Then we use the chinese remainder theorem to construct M^3. After that we just have to to the cubic root, however, this number is so large that even python's pow will overflow, hence we use a binary search to find the closest integer cubic root, convert that to hex and then decode it to string, we get the key.

  I have included my solution in solution.py. My script will also store the computed flag and n pairs in the file dump.txt, so that it can use other methods to do the chinese remainder theorem, as stated in [this solution](http://jonathanzong.com/picoctf/2013/05/07/broken-rsa-180)

* Answer:

  RSA_isn't_so_great_after_all?!
