![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&width=435&size=35&lines=login)
<br>
![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=500&pause=1000&color=F70000&width=435&lines=Web+Exploitation)
*[Image: Challenge Description]*

The "Login" challenge assesses your proficiency in deciphering JavaScript code and locating an encrypted flag

 `Utilize "right-click + view source" or "Ctrl+U" to access page source for assistance in solving the challenge.`
*[Image: file command]*
</br>
Now, let's proceed with reading the JavaScript file.
</br>
*[Image: file command]*
</br>
`"cGljb0NURns1M3J2M3JfNTNydjNyXzUzcnYzcl81M3J2M3JfNTNydjNyfQ"!==t.p`

`Your flag is ${atob(t.p)}`
The {atob} function facilitates the decoding process of a base64-encoded string, transforming it back to its original form.

flag base64 = 'cGljb0NURns1M3J2M3JfNTNydjNyXzUzcnYzcl81M3J2M3JfNTNydjNyfQ'
</br>
You can use online tools like CyberChef, Base64Decode.org, or various programming languages (e.g., Python, JavaScript) to decode base64-encoded strings
*[Image: file command]*
</br>
```bash
echo cGljb0NURns1M3J2M3JfNTNydjNyXzUzcnYzcl81M3J2M3JfNTNydjNyfQ |base64 -d
```
## flag
picoCTF{53rv3r_53rv3r_53rv3r_53rv3r_53rv3r}
