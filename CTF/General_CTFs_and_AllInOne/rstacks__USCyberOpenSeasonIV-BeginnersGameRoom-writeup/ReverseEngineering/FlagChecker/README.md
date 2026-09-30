# Flag Checker

## Description

We found this cryptic Python script that validates the user's flag, but we're having trouble understanding the code. Can you find the correct flag that passes through the program?

## Attachments

[pyrev.py](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/FlagChecker/attachments/pyrev.py)

## Solution

- To get the flag, we need to reverse the actions of the provided Python script. I added some [comments](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/FlagChecker/pyrev_with_comments.py)
to the script labeling variables with their actual values and describing the functionality of sections
of the program.
- From there, it was a matter of undoing the actions of the script in reverse order.
The array <code>phoneSteak</code>, provided at the top of the Python file, is where we start. First, we reverse
the order of the second half of the array. Then, we perform three swaps (see comments for which specific
indices are swapped). Finally, we perform a bitwise XOR of 15 with every element of the array and then add 27 to every
element of the array. Refer to [reversal.txt](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/ReverseEngineering/FlagChecker/reversal.txt) to see these steps carried out.
- The array is now a list of the ASCII codes of the characters of the flag. By converting these
numbers to their ASCII characters, we are able to get the flag.

## Flag

SIVBGR{pyth0n_r3v3rs1ng_pr0}
