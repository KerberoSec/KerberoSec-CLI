# Comments

##### Category: forensics, beginner

This is a forensics question which was so unobvious that the organizers had to give 2 hints and add the beginner tag. But you don't need any hints to solve this.

We are given a file called `Comments.zip`, which has a nested zip `1.zip` in which `2.zip` in which `3.zip`... etc is nested.

So first we want to unzip them programmatically as we don't know how many thousands of zip files there may be.

```
#!/bin/bash

function extract(){
  unzip $1 -d ${1/.zip/} && eval $2 && cd ${1/.zip/}
  for zip in `find . -maxdepth 1 -iname *.zip`; do
    extract $zip 
  done
}

extract '1.zip'
```

We'll get a list of zipfiles from 1 to 8. That wasn't as many as expected.

Using this handy script I wrote to print out the comments, we print out the flag as follows:     
```
PS D:\Documents\HSCTF-7\Forensics\Comments> python .\solve.py
f
l
a
g
{
4
n
6
}
```

<details>
    <summary>FLAG</summary>

    flag{4n6}
    
</details>
