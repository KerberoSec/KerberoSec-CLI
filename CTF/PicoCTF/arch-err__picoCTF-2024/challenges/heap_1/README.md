# heap_1
*Can you control your overflow?*

## Solution
1. We just gotta overwrite the "secret key" with something, I just correctly guessed that we should set it to `pico`, this can be done by inserting `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaapico` into our writeable buffer. This will overflow our buffer and write over the "secret key".

## Flag
**Flag:** `picoCTF{starting_to_get_the_hang_b9064d7c}`
