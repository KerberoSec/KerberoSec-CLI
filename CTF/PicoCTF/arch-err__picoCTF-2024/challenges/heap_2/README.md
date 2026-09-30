# heap_2
*Can you handle function pointers?*

## Solution
1. So, we're given access to a server similar to the challenges [heap_0](../heap_0) and [heap_1](../heap_1). After a bit of investigation we figured out that we need to write the address of the `win` function in the code to the variable `x`.
2. Writing to the variable `x` is easy, we just need to overflow our own writeable buffer. This can be done by prepending `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` when we write to *our* buffer, everything after that padding will be written to the variable `x`.
3. Now we've got to figure out what the address to the win function is. We found two ways of doing this, either you can run `nm chall | grep win`, or you can open the binary with `gdb` (`gdb ./chall`) and then run the command `info address win` in gdb. This gives us the final address of `0x4011a0`
4. After a bit of testing we concluded that we most likely need to send in the address in a low-endian format, so this would mean that we need to send `\xa0\x11\x40\x00` instead. We tried a bunch of formats but never got to the answer. When we eventually ran out of time, we checked a writeup that said we had it all along, it just turns out that we needed to send the address as encoded data, not as the actual string `\xa0\x11\x40\x00`. Doing this with a simple `echo -e ...` piped into the netcat connection finally gave us the flag. See `solve.sh` for details.
4. `solve.sh`

## Flag
**Flag:** `picoCTF{and_down_the_road_we_go_ba77314d}`
