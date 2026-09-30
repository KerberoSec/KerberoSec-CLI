# xorcellent flag checker

## Description

Can you successfully figure out the flag to correctly pass this checker?

## Attachments

[rev](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/xorcellentFlagChecker/attachments/rev)

## Solution

- I would argue that this is more of a reverse engineering challenge.
- We are provided with an executable called <code>rev</code>. I uploaded this file to the decompiler explorer at
[dogbolt.org](https://dogbolt.org/) and selected the [output of Hex-Rays](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/xorcellentFlagChecker/Hex-RaysOutput.txt). We can see the <code>main()</code> function of the program near the
end of the decompiler output.
- Here, we see that the program accepts input for the flag and checks it
with a function called <code>sub_11A9()</code>, which is defined just above <code>main()</code>. From this function, we learn that
the flag is exactly 22 characters long and can be constructed by doing a bitwise XOR on each pair of
elements (with matching indices) in the <code>byte_4050</code> and <code>byte_4070</code> arrays. These two arrays are defined at the
top of the Hex-Rays output.
- With this information, I wrote a [Python script](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/xorcellentFlagChecker/flag_finder.py) to create an array of the values resulting from performing
XOR on each pair of elements from <code>byte_4050</code> and <code>byte_4070</code> (named <code>lst1</code> and <code>lst2</code> in my script, respectively).
I then converted each of these values to their ASCII characters, which yielded the flag.

## Flag

SIVBGR{x0r_B@s1cs_R3v}
