# TryHackMe Pre Security: Module 7: Attacks and Defenses

## The CIA Triad

As we already briefly went over in Module 5, CIA stands for **Confidentiality**, **Integrity**, and **Availability**. 

Essentially all of Cybersecurity revolves around ensuring that these three elements are secure either through attacking these points or defending them. 

### Confidentiality

This is the pillar that ensures that sensitive data is ONLY viewable to those with authorized access to it. 

**Any** potenial leak that allows **anyone** else to be able to access these contents without permission is a vulnerability to our security and said vulnerabilities can have disastrous effects through a malicious actor.

From login credentials, to bank information, to identity thefts, to personal data and more. It's crucial to ensure confidentiality is achieved.

### Integrity

This pillar ensures that no data can be modified without proper authorization.

If integrity is compromised, we can never trust anything that we are interacting with. Any of it could have been altered by a malicious actor. 

In doing so, we may be sending bank transfers or sensitive data to unintended people without even knowing it. We may be receiving false or altered data and more. 

So it's crucial to ensure that integrity is achieved so that we can have confidence in what we interact with.

### Availability

Availability is the pillar in which services or data is available for use when it has to be needed. 

For example, a company's service may need to be online and available for use constantly. Whether that reasoning be for security/health or for financial motivations as downtime would cut off revenue for the entire time that it is down(along with the effects in PR & customer satisfaction). 

Thus, shutting down this service and making it unavailable for use is an attack vector that needs to be protected against. 

Not doing so could cause massive financial implications or damages to livelihoods.

## Cryptography Concepts

Cryptography is a huge way in which we achieve confidentiality. In essence, it's the process of encrypting data such that no one can read the actual content other than the intended parties. 

This is done through encryption methods, which is just scrambling data in a way that hides it to those whom don't have the "key" to descramble it and decipher the contents. 

There are two types of Encryptions: **Symmetric** and **Asymmetric** Encryption. But first, some simple terms covered in this lesson:

* **Plaintext:** This is the unencrypted text that is readable.
* **CipherText:** This is the encrypted text that is not readable and hides the actual data.
* **Key:** This is what allows us to decipher the encrypted text and turn it into readable data or to encrypt data and turn it into unreadable data
* **Algorithm:** This is how the key is used to decipher the encryption(or to encrypt data itself). It's the formula for encryption/decryption. 

### Symmetric Encryption 

The distinguishing factor of this type of encryption is that the **same** key used for encryption will be used for decryption. Meaning that the sender and receiver **both** use the same exact key to encrypt and decrypt the data. 

This is like locking a safebox and handing it over to a friend who also has a copy of the key used to unlock that safe. An example of this type of encyrption is the age old Caesar Cipher which is visually illustrated in the picture below:

<img width="80%" height="80%" alt="Caesar Cipher" src="https://github.com/user-attachments/assets/90a707ee-ef6a-4dae-b82f-ff67fc222f9b" />

It's a very simple encryption. In the image, for example, every letter in the data we want to encrypt will just get shifted 3 letters forward. 

* `A` becomes `D`
* `B` becomes `E`
* etc

So in doing this, the word `Hello`(the plaintext) would become `KHOOR`(the ciphertext).

We can also see that the algorithm would in simple terms just be $Ciphertext = Plaintext + X$. And the key would be $X = 3$.

This kind of encryption is very fast and efficient. However, the problem lies in how the keys are sent over and shared to another without anyone else being able to see or use that key as well. 

Encrypting the key itself doesn't work beacuse then you'd have to encrypt the key that unlocks that key and thus you'd end up in an infinite loop. Asymmetric encryption solves this problem. 

### Asymmetric Encryption 

The difference here is that the encryption and decryption keys are not the same. The encryption key is public and shared to anyone while the decryption key is kept secret.

In this case, anyone can encrypt a message using this encryption but ONLY the holder of the private key can decrypt and read that message. 

This solves the problem of Symmetric encryptions because there is no longer a need to share the secret key. There is a public and a private key and *only* the public key is needed to encrypt and send secure data to another.

Anything I need to send a secret message to my friend is through my friend's public key. I use that key to "lock" my message and no one else can open that lock besides my friend or whoever that has that private key. 

The downside though is that it's extremely slow and requires more CPU power. So large files or services like streaming can't use it. However, **Hybrid encryptions** are used which allows for a lot more flexibility.

Hybrid Encryptions combined both these methods by, in essence, using asymmetric encryption to create a secure channel in which the symmetrically encrypted key as well as the symmetrically encrypted data files can be shared securely.

This combines the speed and efficiency of symmetric encryptions with the security of asymmetric encryptions. HTTPS for example uses hybrid encryption. 

## Become a Hacker

As covered in Module 1, offensive security has the role of actively attempting to break into systems, in a controlled manner, to find exploitative weaknesses that can be patched up.

In order to perform in this role effectively, we need to place ourself in the mindset of a malicious attacker and constantly be asking questions like 

* "What is exposed? What can be exposed?"
* "What can be accessed? What can we do with that access"?
* "What assumptions does the system make in how we will act? Can we act differently in a way the system does not expect?"
* And so on.

Some quick key terms:

* **Red Teaming:** A real world test of a security’s defense that acts like an authentic malicious attacker. As in, it happens by suprise/without notice and tests the system/defense team as a whole. 
* **Penetration Test**: This is like a structured inspection where every vulnerability is identified and exploited
* **Vulnerability:** A weakness in a system that can be exploited
* **Exploit:** Taking advantage of a vulnerability in a system
* **Scope:** The boundries of what is allowed during offensive security "attack"

### Lab

This lab had us "attack" a new business owner's website.

Here, we started off by attempting to identify any hidden pages that may not have been properly blocked off from the public. In this case, we can just keep trying different URLs like `http://www.onlineshop.thm/admin`, etc. 

This can be time consuming and impractical in real world scenarios. 

But there is a tool ethical hacker's use called `Gobuster` which is used in the terminal and allows us to scan a URL for a set of defined keywords as hidden pages.

The command for it may look like this:

`gobuster dir --url http://www.onlineshop.thm/ -w /usr/share/wordlists/dirbuster/directory-list.txt`

`gobuster` calls the gobuster tool.

`dir` tells the command to specifically look for directories/files. It directs the command in scanning for the hidden pages we are looking for. 

`--url http://www.onlineshop.thm/` specifies the target we want to scan

`-w` stands for wordlist and tells the command that the following is where it will find all the words to scan that target URL for. 

`/usr/share/wordlists/dirbuster/directory-list.txt` This is the file path to the wordlist we are using to scan. 

We then used that command in the terminal. The login web page popped up with a 200 status code, meaning it connected to the page successfully. 

So in entering that URL, we now have access to the login page which was supposed to be restricted. This now opens up more possibilities. 

In this case, we can attempt to login and gain access. 

This lab has us trying a few common passwords with the username "admin". Just like gobuster though, there is a tool to try to brute force it with a set of potential passwords for it to try. This tool is called "Hydra" and this type of attack is called a **dictionary attack**. 

The command for this tool looks like this:

`hydra -l admin -P passlist.txt www.onlineshop.thm http-post-form "/login:username=^USER^&password=^PASS^:F=incorrect" -V`

`hydra` calls the hydra tool.

`-l admin` is using the username "admin". `-l` indicates a single username while `-L` would give the option to try multiple usernames.

`-P passlist.txt` gives a list of passwords to try. `p` would be a single password. 

`www.onlineshop.thm` is the target 

`http-post-form` the protocol and method used to login to the website. In this case HTTP & a POST request as a form submission.

`"/login:username=^USER^&password=^PASS^:F=incorrect" ` has `/login` specifying the web page. While the username and password part tells the command the structure in which the username/password is expected to be used by the website. `F=incorrect` tells Hydra what it will see when it fails.

`-V` stands for Verbose which displays the login attempts on our terminal for us. 

We finally ran this command on our terminal in the lab and found the login as `username = admin` and `password = qwerty` after 17 attempts and was able to login to the admin account of the site!

I will note though that this isn't as easy to do on a real system as even attempting it like this would automatically and very quickly be flagged and blocked via the firewall. 

However, other mitigations of this may possibly be used like running the traffic through VPNs, delaying the attempts and buffering it so it does not seem out of the ordinary, and more. 

## Become a Defender

The blue team! 

Defending systems consists of defending against attacks as they happen and handling them appropriately as well as before they ever happen in the first place through prevention. 

Some simple concepts provided by the lesson:

* **Prevention:** Adding security defenses that prevent the attacks before they even happen such as firewalls and antivirus software, etc
* **Detection:** Monitoring our systems and identifying potential threats.
* **Mitigation:** Once a threat or potential threat is detected, mitigation is us taking action to stop, prevent or limit any further damage or leakage in vulnerabilities that were possibly exploited. 
* **Analysis:** Investigating exactly what happened, how it happened, as well as finding how exactly what was affected.
* **Response and Improvement:** Resolves the threat and takes steps to improve our defenses to reduce the risk of similar attacks in the future.

We can imagine cybersecurity defense like defending a city.

In a city, we are defending the buildings, homes, and people. We use cameras, patrols, and reports to detect threats. Potential threats are then identified and then mitigated or stopped via law enforcement. 

Cybersecurity is similar. In our case, we are defending servers, data, users, etc. We use logs, alerts, or network traffic as our "cameras" to detect potential threats. Once potential threats are identified, like unusual IP address activity, steps are taken to mitigate or stop them like blocking them through the firewall. 

### Mindset

As seen in the last lesson, any weakness or openings lead to more potential attack vectors and vulnerabilities that can be exploited. One compromise of an employee's email could lead to login information being accesses, leading to mail server data being leaked, leading to potential more sensitive and dangerous data that a malicious attacker could use. 

We need to understand the attackers mindset and constantly be aware of what paths can be taken to attack a system.

We need:

* **Threat anticipation:** Think like an attack and imagine what they would and could do
* **Attack awareness:** Be aware of the methods commonly and currently used in modern systems so we can recognize it when it happens and act accordingly 
* **Risk Prioritization:** Be aware of the higher risk/value systems to protect.
* **Continuous adaptation:** Attackers are continually adapting and creating new attack vectors so we have to adapt with them, be able to evolve as well, and stay updated with the current tech and attacks. 
