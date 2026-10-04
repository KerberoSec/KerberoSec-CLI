# heap_0
*Are overflows just a stack concern?*

## Solution
1. Uugh, binary... I hate this... Let's learn some basic binary exploitation I guess...
2. So, I connect to a server that has a few options to interact with it. I can view the heap, get the flag (which won't work if a certain value on the heap is set) and I can write to "my own personal space" on the heap. I can be a naughty boy and write a huge string to the heap, which will overwrite this "secret value" that needs to be set to a particular value. Doing this will let me use the "get flag" functionality to get the flag.

## Flag
**Flag:** `picoCTF{my_first_heap_overflow_76775c7c}`
