## More Cookies

[Link to challenge](https://play.picoctf.org/practice/challenge/124)

Write-up:

1. We are told only the admin can eccess the page, and that the `auth_name` cookie 
is encrypted. It looks like base64, but decoding it returns nothing useful.

2. As I wasn't being able to progress, I decided to look at Hint 1: 
[Homomorphic Encryption](https://en.wikipedia.org/wiki/Homomorphic_encryption)

3. In challenge description, "Cookies can Be modified Client-side" has weird 
capitalization (CBC). This prompted me to search CBC, since it might be useful for 
the challenge. After some research, 

4. Since this is a CBC bit flip attack, we need to understand how CBC mode works:
   - In CBC mode, each plaintext block is XORed with the previous ciphertext block before encryption
   - This means if we modify a ciphertext block, it will affect the decryption of the next block
   - By carefully flipping bits in the ciphertext, we can control what the decrypted plaintext becomes

5. **Understanding the CBC Vulnerability:**
   The key insight is that CBC decryption works like this:
   ```
   Decrypted_Block = Decrypt(Ciphertext_Block) XOR Previous_Ciphertext_Block
   ```
   
   This means if we flip a bit in a ciphertext block, it will flip the corresponding bit in the next plaintext block when decrypted. We can exploit this to modify the plaintext without knowing the encryption key.

6. The goal is to change our role from a regular user to "admin". 
    The encrypted cookie likely contains our user information in plaintext format like:
   - Username: "guest" or "user"  
   - Role: "user" or similar
   - Admin status: false
   
   We want to modify this to grant ourselves admin privileges.

7. Brute Force Approach:
   Instead of trying to calculate exact bit positions, we can systematically try all possible modifications:
   - For every byte position in the cookie (0 to 127)
   - Try XORing with every possible value (0 to 127)
   - This gives us 16,384 total combinations to test
   - Send each modified cookie to the server and check if we get admin access

8. The Process:
   - Decode the base64 cookie to get raw encrypted bytes
   - For each position, flip bits by XORing with different values
   - Re-encode the modified cookie back to base64
   - Send it to the server in an HTTP request
   - Check if the response contains "picoCTF{"

   Script: `more-cookies.py`

Flag: `picoCTF{cO0ki3s_yum_2d20020d}` (obtained after successful bit flip attack)

[comment]: <i hate crypto>

dCDewrpt6r3rs27HM9qFFg2YZfWnfqjG0dar65Co5bt23Vhubvfpk981jxgYauL5GvC0wI6QiUyH+Or1rYIc8q1Meu2Jz0Ujfw1SQ0MsKu7FgGMidx/gcokhZYmP4mHc
