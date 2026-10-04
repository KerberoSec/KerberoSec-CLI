# Slash Slash       
The zip files contains a Web API using Python and Flask.

I noticed that the FLAG is loaded using an env variable:
`FLAG = os.getenv("FLAG", "encryptCTF{}")`

Obviously our env doesn't contain the flag, but we can look around for the "setenv" or "export" string.        
There are many lines so let's export it to a file for ease of reading.
`grep -r ./ -e setenv -e export > txt.txt`

Searching through the file, we find an interesting line:            
`.//env/bin/activate:# export $(echo RkxBRwo= | base64 -d)="ZW5jcnlwdENURntjb21tZW50c18mX2luZGVudGF0aW9uc19tYWtlc19qb2hubnlfYV9nb29kX3Byb2dyYW1tZXJ9Cg=="`

By decoding the longer base64, we get the flag:

<details>
  <summary>FLAG</summary>   
   
  `encryptCTF{comments_&_indentations_makes_johnny_a_good_programmer}`

</details>
