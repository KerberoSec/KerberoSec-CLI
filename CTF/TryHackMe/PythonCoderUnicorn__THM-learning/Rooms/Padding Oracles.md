#cryptography 
https://tryhackme.com/room/paddingoracles

-  Advanced Encryption Standard (AES)

Encryption is key to keeping data safe, but even strong encryption can fail if not implemented correctly. One example is the Padding Oracle attack, a vulnerability that takes advantage of how encrypted data is processed, mainly when padding is used.

Padding oracle attacks happen when an application reveals whether the padding in encrypted data is correct or not through detailed error messages or variations in response time. Attackers can exploit these slight clues to figure out the original data without the encryption key. This attack targets encryption methods like Cipher Block Chaining (CBC), which uses padding to handle data of different lengths. The padding oracle attack is named because the server acts as an "**oracle**" by providing feedback on whether the padding in the ciphertext is valid.

## padding schemes 

Most symmetric encryption algorithms, like AES, require input to be a fixed size for each round of encryption. These are called block ciphers. If the plaintext message exceeds this fixed size, it is divided into smaller blocks of the required size. However, the last block may not have enough data to fill the required size, so padding is added to make it fit. 

<img src="https://imgs.search.brave.com/tEyyZsHOA0lj1Hy28VruDbDzU8pff-NSecNFXUVU61s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy82/LzY3L0NCQ19Mb2dv/XzE5OTItUHJlc2Vu/dC5zdmc" width="50" height="50"> Additionally, because encryption involves multiple blocks, a method is needed to link these blocks together. This is where different chaining methods, such as Cipher Block Chaining (CBC), come into play

Padding is a process used in cryptography to ensure that plaintext data fits the fixed block size required by block ciphers like AES. If the plaintext is not a multiple of the block size (e.g., 16 bytes for AES), extra bytes are added to fill the remaining space in the last block. These added bytes, known as **<span style="color:#a0f958">padding</span>**, are removed during decryption to retrieve the original plaintext. <span style="color:#a0f958">Proper padding handling is crucial to avoid security vulnerabilities</span>.

Several padding schemes exist in cryptography, including PKCS#7, ANSI X.923, and ISO/IEC 7816-4. Each is designed to ensure plaintext aligns with block sizes. 

> [!info] In this task, we will focus on the **PKCS#7** padding scheme, as it is the most commonly used in block cipher encryption.

```
TL = text length (mod 8)
npba = number of padding bytes added
vpb = value of each padding byte

TL npba  vpb
 0  8    0x8 
 1  7    0x7 
 2  6    0x6 
 3  5    0x5 
 4  4    0x4 
 5  3    0x3 
 6  2    0x2 
 7  1    0x1 
```

When messages are encrypted separately, each message must independently meet the block size requirement by adding padding at the end. For the messages "**Try**", "**Hack**", and "**Me**", with a block size of 8 bytes, the PKCS#7 padding scheme is applied to each. Consider the following message:

```
byte  1  2    3    4      5    6    7     8
---------------------------------------------
try   t  r    y   0x05  0x05  0x05 0x05  0x05
hack  h  a    c   k     0x04  0x04 0x04  0x04
me    m  e  0x06  0x06  0x06  0x06 0x06  0x06
```

In Python, the `pad` function from the `Crypto.Util.Padding` module simplifies the process of adding padding to plaintext messages. It takes two arguments: the plaintext data and the block size. The function ensures the data conforms to the block size by appending bytes according to the PKCS#7 padding scheme. In the attached VM, visit the URL `http://padding.thm:5000` and try entering the keyword `TryHackMe` with a block size of 16 bytes. You’ll observe that the function pads the message with the seven number of bytes to meet the block size, as shown below:

- https://pycryptodome.readthedocs.io/en/latest/src/util/util.html
- 
```
message: TryHackMe
Block Size: 16
Results: 
54 72 79 48 61 63 6b 4d 65 07 07 07 07 07 07 07

HelloWorld   16      06
```

Each padded message is processed independently for encryption, ensuring all blocks conform to the required size. This padding scheme maintains integrity during decryption, as the padding bytes clearly indicate the number of padding bytes added.

## block cipher modes

### Modes of Operation

Block ciphers like AES form the backbone of any secure encryption. These algorithms work on data in fixed-size chunks, namely blocks. However, plaintext data rarely aligns perfectly with the block size, and encrypting each block independently can introduce vulnerabilities. To solve these issues, block cipher modes of operation were developed. These modes describe how blocks are processed and chained with each other to achieve either confidentiality, integrity, or both. The most common block cipher modes are:

- **<span style="color:#a0f958">Electronic Codebook</span> (ECB)**: This is the most basic mode; in this mode, each plaintext block is encrypted independently. However, this independence makes ECB insecure for most applications since identical plaintext blocks will result in identical ciphertext blocks, thus revealing patterns in the data.
- **<span style="color:#a0f958">Cipher Block Chaining</span> (CBC)**: In CBC mode, before encryption, each plaintext block is **XORed** with the previous ciphertext block. The first block is XORed with an Initialisation Vector (IV) to introduce randomness. This chaining ensures that identical plaintext blocks encrypt differently if their positions in the sequence or IVs differ.
- **<span style="color:#a0f958">Counter</span> (CTR) Mode**: Instead of chaining blocks, in CTR mode, a counter value is used combined with the block index. Every block is encrypted independently but with a different nonce and counter pair for better security and efficiency.

### Cipher Block Chaining (CBC)

Mode CBC is a widely used encryption mode that secures plaintext by combining each block with the previous ciphertext block before encryption to ensure randomness.

**How Encryption Works in CBC Mode** 

We will now discuss how encryption works in CBC mode, step by step, using the following image and the example plaintext "**TryHackMe**". The block size is 8 bytes, and we will split the encryption process into four steps.

![CBC encryption](https://tryhackme-images.s3.amazonaws.com/user-uploads/62a7685ca6e7ce005d3f3afe/room-content/62a7685ca6e7ce005d3f3afe-1737011294365.svg)

> [!info] **Note:** 
> During the exercise, you can use the [online tool](https://xor.pw/#) to XOR two hex values, if required.

**Step 1: Initialisation Vector (IV) and Splitting the Plaintext**

The plaintext "TryHackMe" consists of 9 characters. Given the block size of 8 bytes, we divide the plaintext into two blocks:

- Block 1: "TryHackM" (8 bytes, no padding needed)
- Block 2: "e" (1 byte), padded with 7 bytes of `\x07` to make it 8 bytes

```
Block 2: "e\x07\x07\x07\x07\x07\x07\x07"

The encryption starts with a random IV
IV: 01 01 01 01 01 01 01 01

```

**Step 2: XOR the First Block with the IV**

The first plaintext block, "**TryHackM**", is converted into its hexadecimal representation:
```
Plaintext Block 1: 54 72 79 48 61 63 6B 4D

block is XOR with the IV

54 72 79 48 61 63 6B 4D XOR 01 01 01 01 01 01 01 01 = 55 73 78 49 60 62 6A 4C

The XOR operation combines the plaintext block with the IV, producing an intermediate value that ensures randomness in the ciphertext.
```

**Step 3: Encrypt the XOR Result**

The intermediate result from Step 2 (`55 73 78 49 60 62 6A 4C`) is encrypted using the AES or DES algorithm and a secret key. This produces the first ciphertext block:
```
Ciphertext Block 1 (C1): A3 3C 9F 12 58 44 76 10

This ciphertext block (C1) is now used as input for encrypting and becomes the IV for the next plaintext block.
```

**Step 4: XOR and Encrypt the Second Block**

The second plaintext block, `e\x07\x07\x07\x07\x07\x07\x07`, is converted into its hexadecimal representation:
```
Plaintext Block 2: 65 07 07 07 07 07 07 07

This block is XORed with the first ciphertext block (C1):
65 07 07 07 07 07 07 07 XOR A3 3C 9F 12 58 44 76 10 = C6 3B 98 15 5F 43 71 17

The XOR result (`C6 3B 98 15 5F 43 71 17`) is then encrypted using the AES algorithm and the same secret key, producing the second ciphertext block:

Ciphertext Block 2 (C2): B7 9F 2D 5A 11 66 4F 7A

The final encrypted message is the combination of both ciphertext blocks, C1 and C2, which are then sent to the receiver.
```

The chaining process in CBC mode ensures that every ciphertext block depends not only on its plaintext but also on the previous block’s ciphertext. This prevents patterns in the plaintext from being visible in the ciphertext, even if the same plaintext is encrypted multiple times.

In Python, the `Crypto.Cipher.AES` module from the `pycryptodome` library can be used for encryption with AES using a block size of 16 bytes. The `AES.new()` method initialises the cipher, and the mode `AES.MODE_CBC` enables CBC for enhanced security. The plaintext must be padded to match the block size, which can be achieved using `Crypto.Util.Padding.pad` as already discussed in the previous task. With a secret key and `IV`, the encryption ensures confidentiality for each 16-byte block. A sample code is shown below:

```python
from Crypto.Cipher import AES 
plaintext = request.form["plaintext"] 
key = request.form["key"] 
plaintext_bytes = pad(plaintext.encode(), block_size) 
cipher = AES.new(key.encode(), AES.MODE_CBC, DEFAULT_IV) encrypted_bytes = cipher.encrypt(plaintext_bytes) 
encrypted_message = binascii.hexlify(encrypted_bytes).decode()
```

Visit the URL `http://padding.thm:5000/encryption` and try entering the text `TryHackMe` with the secret key `abcdefghijklmnop` and using the IV as all `1s` (0x31 in Hex). The application will encrypt the cipher text using the code above and display the output as shown below:

```
Plaintext: TryHackMe
Secret Key: abcdefghijklmnop
IV: 31
Mode: CBC
```

```
The encryption mode in which each plaintext block is XORed with the previous ciphertext block before being encrypted is called?

cipher block chaining

What is the last byte after encrypting the word **Hacker** using the secret **MyActualSecrets1**?

d277566022248ad919930065c6269f54

```

## CBC decryption mode

Decryption in CBC mode is the reverse of encryption; instead of chaining plaintext blocks to produce ciphertext, decryption chains ciphertext blocks to reconstruct the original plaintext. Each ciphertext block is decrypted using the secret key, and the result is XORed with the previous ciphertext block (or the Initialisation Vector for the first block). This process ensures that the original plaintext is fully recovered.

Below is a simplified image of the decryption process. We will walk through the process step by step for "**TryHackMe**".

![](https://tryhackme-images.s3.amazonaws.com/user-uploads/62a7685ca6e7ce005d3f3afe/room-content/62a7685ca6e7ce005d3f3afe-1737011367188.svg)

### Process of Decrypting the Ciphertext

**Step 1: Input Ciphertext and Initialisation Vector (IV)**

For decryption, the ciphertext from encryption is split into its blocks:
- **Ciphertext Block 1 (C1)**: A3 3C 9F 12 58 44 76 10
- **Ciphertext Block 2 (C2)**: B7 9F 2D 5A 11 66 4F 7A

The Initialisation Vector (IV) is also retrieved, as it is required to decrypt the first block:
```
IV: 01 01 01 01 01 01 01 01
```

**Step 2: Decrypt the First Block (C1)**

- **Decrypt C1 Using the Secret Key**: The first ciphertext block (C1) is decrypted using the secret key. This produces an intermediate value:

```
Intermediate Value: D(C1) = 55 73 78 49 60 62 6A 4C

**XOR with IV**: The intermediate value is XORed with the IV to produce the first plaintext block:

Plaintext Block 1 = D(C1) XOR IV 55 73 78 49 60 62 6A 4C XOR 01 01 01 01 01 01 01 01 = 54 72 79 48 61 63 6B 4D

**Convert Back to Characters**: The characters are converted back to their original representation, which in this case would be: "TryHackM". This completes the decryption of the first block.
```

**Step 3: Decrypt the Second Block (C2)**

Now move to the second ciphertext block (C2)

- **Decrypt C2 Using the Secret Key**: The second ciphertext block (C2) is decrypted using the secret key. This produces another intermediate value:

```
Intermediate Value: D(C2) = C6 3B 98 15 5F 43 71 17

**XOR with C1**: The intermediate value is XORed with the previous ciphertext block (C1) to recover the second plaintext block:

Plaintext Block 2 = D(C2) XOR C6 3B 98 15 5F 43 71 17 XOR A3 3C 9F 12 58 44 76 10 = 65 07 07 07 07 07 07 07
```

- **Convert Back to Characters and Remove Padding**: The hexadecimal value 65 corresponds to the character "`e`". The remaining bytes (`\x07\x07\x07\x07\x07\x07\x07`) are padding added during encryption. Remove the padding to recover the original plaintext block, which gives us the character `e`.

Now, combining both blocks would yield the original ciphertext, which is `TryHackMe` in this case.

An important formula to keep in mind for the decryption is:
```
P_i ​=Dk(Ci) XOR Ci−1

P_i      = plaintext block being decrypted
Dk(Ci)   = value obtained by decrypting ciphertext block Ci
			using secret key 'k' and Ci-1
```

Decryption in CBC mode mirrors encryption but works in reverse. Each ciphertext block is decrypted, XORed with the previous block, and the padding is removed to reconstruct the original plaintext. The process relies on both the ciphertext blocks and the IV to ensure accurate decryption.

In Python, the `Crypto.Cipher.AES` module `decrypt()` function can be used to decrypt ciphertext using the AES algorithm. When combined with the CBC mode and a 16-byte key, it allows secure decryption of data encrypted with the same configuration. The decryption process requires the ciphertext, the IV, and the secret key to successfully reconstruct the original plaintext. Below is a sample code that performs the decryption:

```python
plaintext = request.form["plaintext"] ciphertext_bytes = binascii.unhexlify(ciphertext) cipher = AES.new(key.encode(), AES.MODE_CBC, DEFAULT_IV) decrypted_bytes = cipher.decrypt(ciphertext_bytes) decrypted_message = unpad(decrypted_bytes, DEFAULT_BLOCK_SIZE).decode()
```

In the attached VM, you can visit the link `http://padding.thm:5000/decryption` to perform decryption against the ciphertext `de3c4dd5d33e38acc0f2923c1c0a98f9` using the same IV and secret key.
```
Ciphertext (Hex): de3c4dd5d33e38acc0f2923c1c0a98f9
Secret Key: abcdefghijklmnop
IV: 31
Mode: CBC
Result: TryHackMe
```

```
What is the plaintext after decrypting b1e090de4abbc8b54769ba79a98a4cffaf59a89e58bcc474794d1e8b7e5315b2  using the secret key abcdefghijklmnop ?

THM{Encryption_007}

What should the IV size be in bytes if you try decrypting a string using AES (16-byte block size)?

16

```

## how the attack works

Now that you have a solid understanding of how encryption and decryption work in CBC mode, let’s shift our focus to the padding oracle attack. This task will explore how weaknesses in padding validation can be exploited to decrypt a ciphertext without knowledge of the key.

The padding oracle attack's foundation lies in the formula:

**Pi ​= Dk(Ci) XOR Ci−1**

Here, **Pi** ​ represents the plaintext of the **ith** block, **Dk​(Ci)** is the decrypted ciphertext or the intermediate value using the key **k**, and **Ci−1** ​ is the ciphertext of the previous block (or IV for the first block). This formula is crucial in exploiting padding vulnerabilities, highlighting the relationship between **plaintext**, **ciphertext**, and **decryption**. The attack focuses on uncovering **Dk(Ci)** byte by byte by interacting with the oracle, which reveals whether the padding is valid or not. This method doesn't directly expose the plaintext but progressively reveals the intermediary decryption state **Dk(Ci)**.

### Theoretical Understanding

Let’s assume we encrypted the string "`TryHackMe`" using CBC mode, and padding was added to align the plaintext with the block size. We have the following information:

- **IV**: 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 31 (hex representation of ASCII "1").
- **Ciphertext**: 88 12 4e 09 e2 0e ab 43 f7 c3 23 2d 92 5a 1a ee 88 12 4e 09 e2 0e ab 43 f7 c3 23 2d 92 5a 1a ee.

The ciphertext comprises one 16-byte block (**𝐶1**), and the IV (**𝐶0**) is used during decryption. The attack starts by targeting the last byte of the IV (which can also be referred to as modified IV) and systematically works backwards, as shown below:

```
ciphertext       88 12 .. .. 1a ee
combined IV      31 31 .. .. 31 31
decrypt block    ?? ?? .. .. ?? ??
XOR modified IV  0  0  .. .. 00 23
plaintext        ?  ?  .. .. ?  00
```

**Step 1: Targeting the Last Byte**

We will begin by modifying the last byte of the IV `(C0[16]` or `test[16])` to reveal the last byte of the intermediate decrypted block ( `Dk​(C1)[16]` ). The oracle is used to check if the padding is valid. If so, then we know that:

`Dk​(C1​)[16] XOR test[16] = 0x01 `

```
ciphertext       88 12 .. .. 1a ee
combined IV      31 31 .. .. 31 31
decrypt block    ?? ?? .. .. ?? ??
XOR modified IV  0  0  .. .. 00 37
plaintext        ?  ?  .. .. ?  00
```

it is important to note that if the padding is valid, the last byte in the plaintext is supposed to be `0x01`. From this, we will calculate:

```
Dk (C1)[16] = test[16] XOR 0x01

if the valid guess is test[16]=0x37 
then  Dk(C1)[16] = 0x37 XOR 0x01 = 0x36

Once Dk(C1)[16] is known, we will use the formula to find the plaintext byte P1[16] = Dk(C1)[16] XOR C0[16].

If we substitute the real numbers:

P1[16] = 0x37 XOR 0x31 = 0x06

This reveals the last byte of the plaintext block.
```

**Step 2: Moving to the Second-to-Last Byte**

Next, we will target the second-to-last byte of **C1**. We will modify `C0[15]` while fixing `C0[16] `to ensure valid padding of `0x02 0x02`. To reveal `Dk(C1)[15]`, the oracle checks if:
```
Dk(C1)[15] XOR test[15] = 0x02

When the padding is valid, we will calculate:
Dk(C1)[15] = test[15] XOR 0x02

For instance, if test[15]=0x34, then:
Dk(C1)[15] = 0x34 XOR 0x02 = 0x36

The plaintext byte is then recovered using:
P1[15] = Dk(C1)[15] XOR C0[15]

Substituting again :
P1[15] = 0x36 XOR 0x31 = 0x7
```

**Step 3: Revealing All Bytes in the Block**

Now, as an attacker, we will continue this process for all bytes in the block, working from the last byte to the first byte. For each byte, we will modify the test byte to match the required padding value and then calculate `Dk(C1)[i]` once valid padding is found. Once we get that, we derive the plaintext byte `P1[i] `using the formula  `P1[i] = Dk(C1)[i] XOR C0[i] `. By the end of the process, we will fully recover the plaintext block.

**Step 4: Final Plaintext Recovery**

After recovering all bytes in the block, we will combine them to reconstruct the plaintext. For **C1** ​, the recovered plaintext is: `P1 = 54 72 79 48 61 63 6b 4d 65 06 06 06 06 06 06 06` and after removing the padding (`0x06`), the final plaintext will be "**TryHackMe**".

### Testing Using Python Script

Have you noticed that the attack revolves around brute-forcing and trying multiple values, which hints at using **loops**? The entire padding oracle attack can be automated using Python. A script can iteratively modify the bytes of the IV or ciphertext, sending requests to the server and analysing the responses. If the server indicates invalid padding, the script adjusts the byte and tries again until validation. By systematically testing all possible byte combinations, the script reveals the intermediate decrypted values, which are then used to compute the plaintext for the entire ciphertext block by block.

In the attached VM, visit the URL `http://padding.thm:5001`, where you will see a screen that will show the original IV, ciphertext, modified IV, modified ciphertext, etc. and a button to start the brute force attack, as shown below:

The backend code that performs the brute force consists of a nested for loop and performs a padding oracle attack by iterating through all possible byte values (0-255) for each position of the `modified_iv`. It sends the modified ciphertext to the server and checks if the response indicates valid padding. Upon receiving a valid response, it computes the corresponding keystream byte and plaintext byte, gradually reconstructing the original plaintext block-by-block.

code snippet
```python
for iv_index in reversed(range(BLOCK_SIZE)): 
	for byte_value in range(MAX_BYTE_VALUE + 1): 
		modified_iv[iv_index] = byte_value 
		modified_ct = hexlify(modified_iv + orig_ct) 
		# Send the modified ciphertext to the padding oracle 
		response = requests.post(URL, data=modified_ct) 
		# post data to the URL and receives response if the padding is valid or invalid 
		if response.status_code == 200: 
		# Fetch decrypted_text from the response JSON 
		data = response.json() 
		decrypted_text = data.get('decrypted_data', '') 
		print("Byte #:", iv_index) 
		print("Decrypted Text (Hex Bytes):", decrypted_text.encode('utf-8').hex()) 
		print("XOR WITH") 
		print("Modified IV (Bytes):", bytes(modified_iv).hex()) 
		# Append keystream and plaintext 
		keystream_byte = compute_keystream_byte(byte_value, padding)
		keystream.append(keystream_byte) 
		plaintext_byte =compute_plaintext_byte(original_iv[iv_index], keystream[ks_index]) 
		plaintext.append(plaintext_byte)
```

In the above code, the nested for loop facilitates a byte-by-byte decryption process in a padding oracle attack. The outer loop iterates through the bytes of the IV in reverse order, starting from the last byte and working toward the first. This ensures that decryption happens one byte at a time. For each byte, the inner loop tries all possible values (0-255) by modifying the corresponding byte in the `modified_iv`. The modified ciphertext (`modified_ct`), which is a combination of the altered `modified_iv` and the original ciphertext, is then sent to the padding oracle via a POST request. If the server responds with a status code `200`, indicating valid padding, the corresponding decrypted text is extracted. The keystream and plaintext bytes are computed for the current position, gradually reconstructing the original plaintext.

Click on the `Start Bruteforce` button to launch the attack. The complete process would extract the plaintext

```
What is the flag value after decrypting the ciphertext?

THM-{brUt3-f0rC3}

While performing a padding oracle attack, what is the expected value for the last plaintext byte if you **only** modify the 16th byte of the modified IV? Use notations like 01, 02, 03, etc. only.

01

The foundation of the padding oracle lies in the formula **Pi ​= Dk(Ci) {OPERATOR} Ci−1**. What is the missing operator in the formula?

xor

```

## automation

PadBuster. This Perl-based tool simplifies the process by automating the decryption of ciphertext using a padding oracle.

**How PadBuster Works:**

- **Encrypted Text**: The attacker requires the ciphertext, typically found in cookies, query parameters, or POST data.
- **Oracle URL**: A padding oracle vulnerability relies on a system endpoint that validates or rejects ciphertext based on padding validity.
- **PadBuster Automation**: PadBuster manipulates the ciphertext byte-by-byte, sends it to the Oracle URL, and determines valid padding based on the server's response.

In the attached VM, visit the website `http://padding.thm:5002`, and you will see the following screen showing encrypted text. The length of the encrypted text

```
313233343536373839303132333435362cb8770371460c5a2dc6b6a7e65289b8
```
 is 32 bytes since the block size is 16. Therefore, the first 16 bytes are IV, and the remaining 16 are ciphertext.

As a pentester, you have identified another endpoint `http://padding.thm:5002/decrypt?ciphertext=value` (scanning and brute-forcing), which decrypts the ciphertext and returns an invalid padding error if it encounters invalid padding.

```
http://padding.thm:5002/decrypt?ciphertext=313233343536373839303132333435362cb8770371460c5a2dc6b6a7e65289b8

TryDecryptMe
```

In the above command, `http://padding.thm:5002/decrypt?ciphertext=313233343536373839303132333435362cb8770371460c5a2dc6b6a7e65289b8` is the oracle URL where the ciphertext is passed as a query parameter for validation. The next argument, `313233343536373839303132333435362cb8770371460c5a2dc6b6a7e65289b8`, represents the encrypted (concatenated IV and ciphertext) in lower hex encoding. The block size 16 specifies the encryption block size for AES-CBC. Finally, the `-encoding 1` option explicitly tells PadBuster that the ciphertext is in lower hex format, which is one of the supported encoding types. You can explore the complete options [here](https://www.kali.org/tools/padbuster/).

```
padBuster http://padding.thm:5002/decrypt?ciphertext=313233343536373839303132333435362cb8770371460c5a2dc6b6a7e65289b8 313233343536373839303132333435362cb8770371460c5a2dc6b6a7e65289b8 16 -encoding 1
```

Once you enter the above command, the script will ask you to enter the ID (`1` or `2`) that matches the error condition. We know from the initial error response that the error condition matches the response code `400`. Therefore, we would press `2` and `Enter`. The script would continue brute-forcing and extract the plaintext for you as shown below:

Continuing from the already-executing script, the program will extract the ciphertext and display its ASCII, Base64, and Hex values. Once you decrypt a ciphertext using PadBuster, you can encrypt a different plaintext as well using the parameter `-plaintext text_to_encrypt`.

```
What is the status code shown on the page when an "Invalid padding" error occurs?

400

What is the decrypted value (ASCII) for the ciphertext 31323334353637383930313233343536bdcc4a2319946dc9b30203d89dba9fce with a block size of 16?

31323334353637383930313233343536bdcc4a2319946dc9b30203d89dba9fce

paste: 
http://padding.thm:5002/decrypt?ciphertext=

Decrypted text: Got_The_Flag007
```

## best practices

Padding oracle effectively assists in decrypting sensitive data without knowing the encryption key. As a pentester, ensure the following practices to exploit the vulnerability:

- **Black-Box Testing**: Identify encrypted data in application inputs or responses (cookies, responses). Once you have the encrypted data, modify the ciphertext byte-by-byte and observe server behaviour for error patterns that reveal padding issues. 
- **Grey-Box Testing**: The pentester has access to partial web application source code or API documentation to analyse how padding errors are handled, craft targeted ciphertexts, and monitor server responses.
- **Use Automation**: Use tools like PadBuster to automate the process of identifying server responses and modifying ciphertexts or initialisation vectors to increase the exploitation efficiency.

## Mitigation Measures for Secure Coders

As a secure coder, you can take the following measures to prevent the web app from padding oracle attack: 

- **Use Authenticated Encryption**: Make sure to use authentication encryption like AES-GCM or AES-CCM, which combine encryption and authentication to prevent ciphertext manipulation.
- **Avoid Revealing Errors:** Avoid displaying errors like invalid padding in a production environment that would provide additional knowledge to a pentester while evaluating the web app.
- **Validate Inputs Securely**: Avoid processing invalid input, such as ciphertext, on the server side. For example, filter invalid ciphertext without performing decryption. 
- **Keep Libraries Updated**: Use the latest cryptographic libraries to avoid vulnerabilities from outdated implementations.

