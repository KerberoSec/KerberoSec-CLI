# Searching for the cookie
##### simple search website we need to know which cookie to eat ;)

We are given a page of cookies.        
Let's start by looking for the elephant in the room: checking the cookies.

The `x` cookie has a value of `try+to+execute+some+js+`, so that will be our goal for now.

Taking a look at the source code:

```
 <script>var currentSearch = {'keyword':'test'};</script>
```
we see that the input is inserted into the script as above.

I tried to escape via newlines and aprostrophes at first, but none worked: and then it hit me.     
We can simply close the script tag prematurely and put our own code, like this:     
`</script><script>alert(1)</script>`

which will trigger an XSS and there will be a new cookie added, named `flag`.

<details>
  <summary>FLAG</summary>   
   
  `coolcookie112`
</details>
