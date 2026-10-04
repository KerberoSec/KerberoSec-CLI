```   
  ▄▄▄     ▄▄▄             ▄▄▄▄▄▄                                   
   ███▄ ▄███             █▀██▀▀▀█▄ █▄             █▄               
   ██ ▀█▀ ██   ▄           ██▄▄▄█▀ ██    ▀▀       ██          ▄    
   ██     ██   ████▄       ██▀▀▀   ████▄ ██ ▄██▀█ ████▄ ▄█▀█▄ ████▄
   ██     ██   ██        ▄ ██      ██ ██ ██ ▀███▄ ██ ██ ██▄█▀ ██   
 ▀██▀     ▀██▄▄█▀  ██    ▀██▀     ▄██ ██▄███▄▄██▀▄██ ██▄▀█▄▄▄▄█▀   
```
I received a suspicious email with a very weird looking attachment. It keeps on asking me
to *enable macros*. What are those? [^1]

Uncover the flag in the email attachment!
-----------------------------------------------------------------------------------------
Upon investigating the `/home/ubuntu/mrphisher` directory, we discover a suspicious
*Microsoft Word 2007+* document called `MrPhisher.docm`. After further inspection in `vi`
we discover that the document contains many subfiles and metadata that can be extracted
with `unzip MrPhisher.docm`. But instead of static analysis, we open the attachment in
*LibreOffice* and are promptly warned that the document contains macros that may contain
viruses. This gives us the idea to view the contents of the potentially dangerous macros
in *Tools > Macros > Edit Macros* without executing them. Therefore, we discover a Visual
Basic Script under *Project > Modules > NewMacros > Format* and save it as the file
`malicious_macro_script.vbs` to our home folder.
Next, we try to disassemble what is being represented by this *VisualBasic* code. For 
every character in the string array *a*, it is being *XOR'ed* with the iteration variable
*i* and then formed into a character to then be appended to the previous result *b*. In 
the `flag_retrieval_script.py` Python script we thus rewrite this code to get the 
suspected flag from the encrypted array.

[^1]: https://tryhackme.com/room/mrphisher
