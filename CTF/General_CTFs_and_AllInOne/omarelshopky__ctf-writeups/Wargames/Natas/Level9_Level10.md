# Natas Level 9 --> Level 10

**Username:** natas10

**Password:** nOpp1igQAkUzaI1GUUjzn1bFVj7xCNzu 

**URL:**      http://natas10.natas.labs.overthewire.org

## Solution
* Open inspect, there is textbox take a code and button send us to a page contain source code lets see it
* In this page page it is obvious that what we will write in previous textbox will be inject in linux command "grep -i $code dictionary.txt" after filter {&|;}
* We can't use prvious code as they filtered some characters so think another way
* What if we grep from pass file and comment the rest
```bash
grep -i c /etc/natas_webpass/natas11 # dictionary.txt
```
* That's the password

## Natas11 Password
>  U82q5TCMMQ9xuFoI3dYX61s7OZD9JKoK

