# Specialer

**Points:** 400

**Description:**  Reception of Special has been cool to say the least. That's why we made an exclusive version of Special, called Secure Comprehensive Interface for Affecting Linux Empirically Rad, or just 'Specialer'. With Specialer, we really tried to remove the distractions from using a shell. Yes, we took out spell checker because of everybody's complaining. But we think you will be excited about our new, reduced feature set for keeping you focused on what needs it the most. Please start an instance to test your very own copy of Specialer.
ssh -p 64757 ctf-player@saturn.picoctf.net. The password is d137d16e

## Solution 

### Step 1

Launch the instance then connect to the SSH server. 

![Screenshot from 2023-08-15 21-58-43](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/0dc7531c-0ad2-417f-977d-2885d529cb63)

### Step 2

Let's check what commands we can use. To do so, just tap the `tab` key.

![Screenshot from 2023-08-15 21-47-22](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/27181be5-2be7-42b2-98d1-4a66ad13bdad)

We can use the `pwd` command and the `echo` command.

![Screenshot from 2023-08-15 22-03-07](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/501a11bd-0478-49d8-9fe7-d893eda64bf1)

Right now, we're inside the ctf-player directory, and within this directory, there are three more directories. So, let's take a look at each of these directories individually.

### Step 3

Because the `cat` command isn't available for use, I went with the alternative approach of using the `echo` command to read the contents of the file.

![Screenshot from 2023-08-15 22-06-57](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/ebb54b85-6758-4ad0-89fb-d07e60147df9)

Nothing in this one. Let's go back the `ctf-player` directory. 

In the "ala/" directory, you'll come across two files. The flag can be found in the "kazam.txt" file.

![Screenshot from 2023-08-15 21-54-04](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/f6812bb1-68dc-4c01-89f1-0240a7d67ea0)
