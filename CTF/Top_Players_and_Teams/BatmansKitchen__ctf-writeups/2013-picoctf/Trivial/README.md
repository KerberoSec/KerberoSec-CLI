# Trivial

* Problem:

  An unlocked terminal is displaying the following:
    
    `Encryption complete, ENC(???,T0pS3cre7key) = Bot kmws mikferuigmzf rmfrxrwqe abs perudsf! Nvm kda ut ab8bv_w4ue0_ab8v_DDU`

  You poke around and find this interesting file.

* Solution:
  
  A brief look at the code tells us that this is a rotation cipher. Hence the way to decrypt it is rotate it back by the same amount. Since the rotation number is a constant for each character, we can slightly modify the encrypt.py and write a decrypt.py. This is included in my directory

  Running it gives "You hawe successfully decrypwed the message! The key is th4ts_w0rs3_th4n_DES"

  (THIS IS WHAT IT IS!!! TRUST YOURSELF)

* Answer:

  th4ts_w0rs3_th4n_DES
