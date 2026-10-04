## Some Assembly Required 2

[Link to challenge](https://play.picoctf.org/practice/challenge/131)

### Write-up

1. The challenge presents a web interface with an input box and a submit button. Submitting random text returns "Incorrect!".

2. Analyzing the page source, we find a heavily obfuscated JavaScript file. The script loads a WebAssembly module (`aD8SvhyVkb`) and passes the input to it for validation.

3. The main logic:
   - The JS writes each character of your input to WASM memory using `copy_char`.
   - It then calls `check_flag()`, which returns 1 for correct input and 0 otherwise.
   - The result is displayed as "Correct!" or "Incorrect!".

4. To proceed, we download the WASM file (`aD8SvhyVkb`) from the challenge site.

5. We convert the WASM file to a readable format using `wasm2wat`:
   ```bash
   wasm2wat aD8SvhyVkb -o out.wat
   ```
   This gives us the WebAssembly Text format for analysis.

6. In the `.wat` file, we see that the flag is **not** stored in plaintext. Instead, the data section contains an encoded string at offset 1024:
   ```wat
   (data (;0;) (i32.const 1024) "xakgK\Ns><m:i1>1991:nkjl<ii1j0n=mm09;<i:u\00\00")
   ```

7. Further analysis of the WASM code, specifically the `copy_char` function, reveals that each character of your input is **XORed with 8** before being stored in memory. The comparison in `check_flag()` is then made between your XORed input and the encoded string in WASM.

8. To decode the flag, XOR each character of the encoded string with 8. Example Python code:
   ```python
   encoded = "xakgK\\Ns><m:i1>1991:nkjl<ii1j0n=mm09;<i:u"
   flag = ''.join(chr(ord(c) ^ 8) for c in encoded)
   print(flag)
   ```
   This reveals the flag:
   ```
   picoCTF{6f3bd18312ebf1e48f12282200948876}
   ```
