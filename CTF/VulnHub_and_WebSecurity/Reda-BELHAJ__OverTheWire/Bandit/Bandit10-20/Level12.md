# Bandit Level 12
## Part I
Enter the following command in your Terminal :  
```bash
    # This is one of my favorite.
    cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
    # tr 'A-Za-z' 'N-ZA-Mn-za-m' : Each character in the first set 'A-Za-z' 
    #     will be replaced with the corresponding character in the second set 'N-ZA-Mn-za-m'(ROT13) ignoring all the numbers 0-9.
```
```python
    # You can do it with python:
    import codecs
    
    text = "Gur cnffjbeq vf 5Gr8L4qetPEsPk8htqjhRK8XSP6x2RHh"
    print(codecs.encode(text, 'rot_13'))
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit12* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level12.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit12
	# OR ssh bandit12@bandit.labs.overthewire.org -p 2220
	# password: 5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu
```
2. Enter the password as shown in the comment of bash.
