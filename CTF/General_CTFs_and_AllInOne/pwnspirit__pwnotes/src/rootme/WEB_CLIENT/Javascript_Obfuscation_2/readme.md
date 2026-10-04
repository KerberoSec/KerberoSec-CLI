### Javascript: Obfuscation 2

Here after inspecting the page source , I find the following obfuscation js code. which seems like password we need but encrypted.

<img width="1041" height="457" alt="picture2" src="https://github.com/user-attachments/assets/4a2a13f5-9c6b-4644-931e-56f2b8fc65a7" />

Here we got something like 
```js
var pass = unescape("unescape%28%22String.fromCharCode%2528104%252C68%252C117%252C102%252C106%252C100%252C107%252C105%252C49%252C53%252C54%2529%22%29");

OR

unescape%28%22String.fromCharCode%2528104%252C68%252C117%252C102%252C106%252C100%252C107%252C105%252C49%252C53%252C54%2529%22%29
```

Let's fire up [CyberChef](https://gchq.github.io/CyberChef/) and try to decode.
```js
RECEIPE -> URL decode
unescape("String.fromCharCode%28104%2C68%2C117%2C102%2C106%2C100%2C107%2C105%2C49%2C53%2C54%29")
twice
unescape("String.fromCharCode(104,68,117,102,106,100,107,105,49,53,54)")
```
Now we are near to the password, Let's check the password using the `console`.
<img width="692" height="127" alt="picture3" src="https://github.com/user-attachments/assets/a2a404dc-c4c6-4ae3-b773-6b1ab7d62e20" />

