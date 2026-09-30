# Bandit Level 21
## Part I

```bash
    file suconnect
    # bandit20-do: setuid ELF 32-bit LSB executable...
    ./suconnect
    # to give us the usage or an example: ./suconnect <port>
    # We ll have to work on two terminals (Server/Client NC)
```
|   Terminal 1                  | Terminal 2                           |
|---                            |---                                   |
| ``` ./suconnect 33333 ``` | ``` nc -l localhost -p 33333 # Paste GbKksEFF4yrVs6il55v6gwY5aVje5f0j``` |

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit21* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level21.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit21
	# OR ssh bandit21@bandit.labs.overthewire.org -p 2220
	# password: gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr
```
2. Enter the password as shown in the comment of bash.
