# Wireshark doo dooo do doo

## Information about the CTF
Can you find the flag? `shark1.pcapng`.

## How to solve it
Open the file with Wireshark and go to Analyze -> Follow -> TCP Stream

Now change the stream number in the bottom left corner until something useful shows up.

And stream 5 looks promising as this piece of string appears "`cvpbPGS{c33xno00_1_f33_h_qrnqorrs}`", which could look like the letters has been shifted.

Trying to insert the string in [CyberChef](https://gchq.github.io/CyberChef/) with the `ROT13` recipe gives us the flag.
