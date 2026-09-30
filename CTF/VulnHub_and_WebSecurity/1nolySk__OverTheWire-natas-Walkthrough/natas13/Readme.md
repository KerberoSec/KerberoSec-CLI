# Natas13 solution detailed:

- Load the natas13 page. 
- Inspect element and Edit the hidden input tag in form, change it to **something.php**
- Use terminal to create the exploit file. Run the below command

```shell
echo -en "\xFF\xD8\xFF\xE0\n<?\n readfile('/etc/natas_webpass/natas14');\n?>\n" > natas13.php
```

- The command uses image file signature to mock out php file as a jpeg file. 
- **\xFF\xD8\xFF\xE0** is the hex representation of jpeg.
- The command following it is simply a fucntion to read the contents of natas14 password file.
- Upload the generated file to natas13
- Follow up the link shown on next page to run our exploit script and the password gets displayed.
