```
 _____   _                   _                _                 __  _ 
 \ ___| | |_____   _____    | |   __ _  ___ _| | __ _ _   _ __ _\ \| |
 / _|   | / _ \ \ / / _ \   | |  / _` |/ _ \__ |/ _` | | | |__` |\ ` |
| (___  | \__  \ V /\__  |__| | | | | | (_) || | (_| | |_| |  | |/ . |
 \____| |_|___/ \_/ |___/_____| |_| |_|\___/__/ \__, | .__/   |_/_/|_|
                                                   |_|\___|           
```
We have moved past an easy substitution cipher. The main weakness of a simple
substitution cipher is the repeated use of a simple key. In the previous exercise we
were able to introduce arbitrary plaintext to expose the key. In this example, the
cipher mechanism is not available to us. However, we have intercepted more than one
message. The password to the next level is found in the file *krypton4*. We have also
found three other files *found1*, *found2* and *found3*. Note, that the message
plaintexts are in American English and that they were produced from the same key. [^1]

Solution
----------------------------------------------------------------------------------------
For this task, we have moved on from `caesar` encryption and want to use *frequency 
analysis* to map encrypted letters to the more prevalent ones in English. It is known,
that the most common letter in English is "E", and the alphabet can be sorted to the
ordering "ETAONIHSRLDUCMWYFGPBVKJXQZ" of most frequency. Now, it is our goal to find
the most frequent letters in the found ciphertexts to map them to the predicted
characters. With the following command, we sort the letters by occurence.

```bash
sed 's/./&\n/g' found* | sort | uniq -ic | sort -rn
```
After formatting the result from the previous command, we get the ordering
"SQJUBNGCDZVWMYTXKELAFIORHP" of the frequency analysis from the found ciphertexts. We
can then proceed to try decrypt the password ciphertext with the frequency analysis
directly with 
`cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'ETAONIHSRLDUCMWYFGPBVKJXQZ'`. But,
since this doesn't directly work, we guess the correct alphabet alignment out of
context. Our initial assumption is, that "S" maps to "e" with 456 occurences. The
letter "Q" could either be "t" or "a", so we try it out to spot any likely words.

```bash
cat krypton4 | tr 'SQ' 'et'                                 # KeVVW BGeJD eVeIe VXBMN YtUUK BNWCU ANMJe
cat krypton4 | tr 'SQ' 'ea'                                 # KeVVW BGeJD eVeIe VXBMN YaUUK BNWCU ANMJe
```
Here, the phrase "YaUUK" gives the idea, that *password* could be concealed in the
ciphertext and we proceed with mapping it accordingly. And indeed, this was a good
guess, as we can next suspect the phrase *well done* in the ciphertext.
```bash
cat krypton4 | tr 'SYQUUKBNW' 'epassword'                   # weVVd oGeJD eVeIe VXoMr passw ordCs ArMJe
cat krypton4 | tr 'SYQUUKBNWVG' 'epasswordln'               # welld oneJD eleIe lXoMr passw ordCs ArMJe
cat krypton4 | tr 'SYQUUKBNWVGCJDIXMA' 'epasswordlnithvfub' # welld oneth eleve lfour passw ordis brute
```
Finaly, after some further conclusions about the context of this challenge plaintext,
we derive the password for the next level.

[^1]: https://overthewire.org/wargames/krypton/krypton3.html
