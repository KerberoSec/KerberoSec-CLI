# Guide To CTF: By Matthew

## Contents
- [Introduction](#introduction)
- [What You'll Learn](#what-youll-learn)
- [Getting Started](#getting-started)
- [Useful Websites](#useful-websites)
- [Your First Puzzle](#your-first-puzzle)
- [More Puzzles](#more-puzzles)
- [Help](#help)
  
<hr>

## Introduction

**PicoCTF** is a beginner-friendly **Capture The Flag (CTF)** platform designed to teach **cybersecurity fundamentals** through hands-on puzzles. In a CTF, participants solve challenges to uncover hidden **flags**, which are strings of text that confirm a successful solution.
In most puzzles, you will have to apply critical thinking skills and computer skills to find the flag.

**Example** of a flag: `guideToCTF{tH1s_c0uld_b3_a_f1ag_2jg95asn}`.
Flags are unique identifiers for each puzzle, and are complex to stop you from guessing them in a competition.
They are designed to stand out from normal code or language, so that you know when you have found it.
Sometimes, they are encrypted in a cipher so that you won't notice it straight away!

This repository introduces you to **real-world security concepts** by encouraging you to **analyze problems, experiment with tools, and think critically** like cybersecurity professionals.
<hr>

## What You'll Learn

  - **Linux command line basics** and file system navigation
  - **Cryptography fundamentals** such as encoding, hashing, and simple ciphers
  - **Web exploitation concepts** including HTML, JavaScript, and HTTP requests
  - **Reverse engineering basics** and program analysis
  - **Introductory binary exploitation** and memory concepts
  - **Problem-solving and debugging strategies** used in cybersecurity

CTF challenges emphasize **hands-on learning, persistence, and creative thinking**. No prior knowledge or experience is required to compete in competitions- you just need to be motivated to learn.
<hr>

## Getting Started

The first thing you'll need to start is a PicoCTF account. All you need to do is navigate to [picoctf.org](https://picoctf.org) and sign up for an account. There are a few questions you need to answer, e.g. what school you're at or what grade you are.
Once you have done this, it is a good idea to bookmark this site in your browser. Use `CMD+D` on Mac or `CTRL+D` on Windows.  
Click on **PRACTICE** at the top or go to **[picoctf.org/practice](https://picoctf.org/practice)**. This part of the website is called the **picoGym**, or practice section. It is where you can find all the puzzles you will be trying to solve for practice. In a competition, the puzzles will be new and different to these puzzles. Most puzzles on the site are from previous year's competitions.

<hr>

## Useful Websites
(*You could bookmark these! Also, keep an eye out here in case I add more websites*)

  - **[primer.picoctf.org](https://primer.picoctf.org/)**
   
    This is part of PicoCTF, you can find it by going to PicoCTF then click learn, then Pico Primer.
    It is a helpful documentation for a range of useful information such as linux shells, python, web exploits, cryptography, C language and other things.
    If this sounds confusing, you can just skip over most of the topics and use this as a reference point.
    For some puzzles I might attach a recommended section in the Primer (like ***PRIMER 4.3***) to show what the puzzle is about and some extra info.
  
    <details>
    <summary>Challenge</summary>
    Find this letter:
    The first letter in the title of section 2.4 in the Primer. If you visit the website, you should be able to see the different sections labeled 1.0, 1.1, 1.2 etc.
    </details>

  - **[cyberchef.org](https://cyberchef.org/)**
  
    This website can be used to *decode or decrypt* some multi-layer ciphers and encrypted messages. 
    I use it mainly for the **Base64 decode** feature which is what most of the codes in PicoCTF are encrypted in.

    <details>
    <summary>Challenge</summary>
    Find out what this means:
    TmljZSBXb3JrIQpJZiB5b3UgY29tcGxldGUgYWxsIDEwIGNoYWxsZW5nZXMgaW4gdGhpcyBndWlkZSwgYSBzZWNyZXQgbWVzc2FnZSB3aWxsIGJlIHJldmVhbGVkLg==
    </details>
    
  - **[stegonline](https://georgeom.net/StegOnline/upload)**
  
    This is a ***steganography*** tool, which helps show hidden metadata in image files.
    There are lots of sites you can use to find metadata, like Aperi or Exiftools, but I find StegOnline to be the fastest and most reliable.
    To use it, just upload an image, then decide what function to use. The most useful in my opinion are `Extract Files/Data` and `Show Strings`.
    For extracting files/data, first click on the button, then select which RGB channels to analyze.
    <details>
    <summary>Challenge</summary>
    Find the hidden message in this image:
    <br>
    
    <img width="960" height="540" alt="hidden-meta" src="https://github.com/user-attachments/assets/db1a605f-5e17-416b-97e6-8fed7a23e3c6" />  
    
    Right click and copy, or download it then upload into StegOnline.  
    For this one, you will have to use `Extract Files/Data` and select at least one RGB channel.
    </details>

- **[bandit](https://overthewire.org/wargames/bandit/)**
  
  This is a game that teaches you **UNIX**/**LINUX** terminal commands. You have to open it in your computer's terminal, which is called *Terminal* on Mac and Linux, or *Powershell*   or even *Command Prompt* depending on your windows version. Unfortunately you can't play it on the website. If your terminal is blocked on your device by an administrator, e.g. a    school laptop or work laptop, you may not be able to play this game.
  
    
  <details>
    <summary>Challenge</summary>
      
    Linux is often described as `_____-like` and uses commands such as `ls` and `cd`. Fill in the blank, then use the first letter.
    
  </details>

<hr>

## Your First Puzzle

### Explanation
We'll start things off with a ***fairly easy*** puzzle. In the picoGym, search for `Inspect HTML` or go to <a href='https://play.picoctf.org/practice/challenge/275?page=4'>*Inspect HTML: PicoCTF*</a>. You should see a screen like this:

<img width="416" height="325" alt="Inspect HTML" src="https://github.com/user-attachments/assets/02dc41fb-29e4-486c-b179-6aa4947b7c62" />
<br>

###### (!) Note that there is a green tick in the top right. This is because I have solved this puzzle before. When you solve this puzzle, a green tick will appear for you as well.
<br>

Select `Launch Instance` to begin the challenge. Most challenges will also have this button, but some will not.
Launching the instance just means that a Pico puzzle will be hosted on a new website just for you and your computer. ***No-one else can access it***. Puzzles that use this feature are generally to do with websites, rather than files or downloadable content.

Once clicked, the description will change to include a website, like this:

<img width="609" height="277" alt="Instance Started" src="https://github.com/user-attachments/assets/d38f3591-d9c1-4648-91d5-23d5190149c6"/>
<br>

A 15 minute timer and a `Restart Instance` button will appear. ***There's no need to worry about the timer***, you can restart/retry all challenges as many times as you want in practice. All it is really there for is to make sure the instances are closed and unavailable after use.

There is also a *Hints* section, which in this puzzle shows a 1, meaning 1 hint. Clicking on the 1 will show the first (and only) hint. Some challenges could have 4 or more hints.

No-one is stopping you from clicking on the hints, and it doesn't give any minus points in practice. However, depending on the rules, in competitions hints may cost you points.

Finally, at the bottom there is a input field to enter a ***flag***. The placeholder flag is not important, but it shows you what to look for. Once you have found the flag, simply copy/paste into the field and press `Submit`. If the flag is correct, you will solve the challenge. If it is incorrect, you have to find the correct flag.

### Solving

For this puzzle, I recommend **PRIMER 5.1-2**. <br>
Navigate to the website. I can't include a link, but it should look something like this: `saturn.picoctf.net:54592` (This link won't work because you need to start your own instance for your own puzzle).

Once on the website, poke around and see if you can spot anything ***out of the ordinary***.
<br>
When you have found the flag, submit it to PicoCTF and see if you got the right answer.
<br>
If you are stuck, feel free to use a hint.
<details>
  <summary>Hint</summary>
  
  Use the web inspector, open it by right-clicking on the page and selecting `Inspect`, or by pressing `FN+F12` on Mac (just `F12` might work).
  <br>
  When you find something strange, right click and select `Edit as HTML`. This enables you to copy/paste it.
  <br>
  If, for some reason, the `Elements` tab is not selected, find it in the nav bar and open it.
  <details>
  <summary>Second Hint</summary>
  
  `<element> blah blah blah </element>`  = Normal HTML code.
    
  `<!-- picoCTF{...} -->`  = ***Out of the ordinary...***
  
  <details>
  <summary>Solution</summary>
    
  The inspect tab should look like this.

  <img width="698" height="232" alt="The Flag" src="https://github.com/user-attachments/assets/9236bfa2-360d-498d-8f4a-d2c011eaf3ea" />
  <br>
  As you can see, the flag is in the middle of the code, somewhat grayed out. 
  
  Flag: `picoCTF{1n5p3t0r_0f_h7ml_fd5d57bd}`
</details>
</details>
</details>

<hr>

## More Puzzles

Here are some puzzles in order of easy: hard.

<details>
<summary>Easy Puzzles</summary>
  
- [Obedient Cat](https://play.picoctf.org/practice/challenge/147)
- [strings it](https://play.picoctf.org/practice/challenge/37)
- [Glory of the Garden](https://play.picoctf.org/practice/challenge/44)
- [dont-use-client-side](https://play.picoctf.org/practice/challenge/66)
- [runme.py](https://play.picoctf.org/practice/challenge/250)
</details>

<details>
<summary>Medium Puzzles</summary>
  
- [Caesar](https://play.picoctf.org/practice/challenge/64)
- [logon](https://play.picoctf.org/practice/challenge/46)
- [SSTI1](https://play.picoctf.org/practice/challenge/492)
- [Verify](https://play.picoctf.org/practice/challenge/450)
- [Hidden in Plainsight](https://play.picoctf.org/practice/challenge/524)
  
</details>

<details>
<summary>Hard Puzzles</summary>
  
- [Client-side-again](https://play.picoctf.org/practice/challenge/69)
- [SSTI2](https://play.picoctf.org/practice/challenge/488)
- [Trickster](https://play.picoctf.org/practice/challenge/445)
- [More SQLi](https://play.picoctf.org/practice/challenge/358)
- [Login](https://play.picoctf.org/practice/challenge/200)
</details>

### Hints & Solutions

**The hints/solutions to these puzzles can be found in a seperate file, to make sure you don't look at them accidentally.**  
[Go to hints/solutions](./HINTS%20&%20SOLUTIONS.md)

<hr>

## Help

If you need specific help, please leave a comment.
Here are some general tips that could solve your problems.

  - Can't find the website link? Make sure you press `Launch Instance`.
  
  - Can't open the inspect element tab? Search on Google what the common keybinds are for Inspect, or check your browser's settings.
  
  - The Flag isn't correct, but you thought it was? Have you got any whitespace, like: ` picoCTF {abcd }`? Get rid of all spaces or tabs in the flag, until it looks like this:`picoCTF{abcd}`.

