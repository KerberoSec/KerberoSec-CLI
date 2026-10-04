# Newsletter
##### the administrator put the backup file in the same root folder as the application, help us download this backup by retrieving the backup file name

The landing page contains a simple input which only accepts email (or so it seems!).          
We quickly find out that it accepts anything that includes `@.` so we will include that at the end.          

Let's try a simple command injection like this:
```
`whoami`&&@.
````
whoops, it returns an error of invalid email. This is easily bypassed by replacing `&&` with `%26%26` instead.

We find that `www-data` is inserted at the top of the page. Looks like it's a success!       
Let's browse the directory now:         
```
`ls`&&@.
````
which returns `emails.txt hgdr64.backup.tar.gz index.php`

While we really would like to look into all the available files, the goal is just to retrieve the file name.

Thus, we submit the flag and get an easy 50 points.

<details>
  <summary>FLAG</summary>   
   
   When decoded, it gives: `hgdr64.backup.tar.gz`

</details>
