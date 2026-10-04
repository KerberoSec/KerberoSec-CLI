# Math Reversal

## Description

Do some calculations to find the correct flag

## Attachments

[beginnerREChal_1](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/MathReversal/attachments/beginnerREChal_1)

## Solution

- I uploaded the provided binary to the decompiler explorer at [dogbolt.org](https://dogbolt.org/). Here, I took
note of two decompilation outputs: the one provided by BinaryNinja and the one provided by Hex-Rays.
- The [BinaryNinja output](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/MathReversal/BinaryNinjaOutput.txt) provided the most readable C code of all the decompilers. By examining the <code>main()</code>
function, we can see that this program is using a function called <code>checkflag()</code> to verify a
user-provided flag. If we can figure out how to get <code>checkflag()</code> to return true, then we can find
the flag.
- Within the <code>checkflag()</code> function, we can see that the flag is 31 characters long. There also
seems to be a string within the program called <code>flagCheck</code>. In order for <code>checkflag()</code> to return true,
the sum of the ASCII value of a given character in <code>flagCheck</code> and the corresponding character in our
input must be 128 for every pair of characters. In other words, if we know the ASCII values of
<code>flagCheck</code>'s characters, then we can subtract each of them from 128 to get the ASCII values of the
flag.
- Unfortunately, BinaryNinja was not able to get the value of <code>flagCheck</code>, which is why we are
also considering the decompilation [output of Hex-Rays](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/MathReversal/Hex-RaysOutput.txt). Near the top of Hex-Rays's output is an array
of integers, which represents the ASCII values of <code>flagCheck</code>.
- We now have all the information we need. I wrote a [Python script](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/MathReversal/flag_finder.py) to loop over the array from Hex-Rays and subtract each of its
elements from 128. Then, I converted those values into ASCII characters. This yielded the flag.

## Flag

SIVBGR{v3ry_d1ff1cult_passw0rd}
