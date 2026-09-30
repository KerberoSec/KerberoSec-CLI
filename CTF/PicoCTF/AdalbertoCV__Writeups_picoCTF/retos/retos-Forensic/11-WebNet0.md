# WebNet0

# Descripción
We found this [packet capture](https://jupiter.challenges.picoctf.org/static/0c84d3636dd088d9fe4efd5d0d869a06/capture.pcap) and [key](https://jupiter.challenges.picoctf.org/static/0c84d3636dd088d9fe4efd5d0d869a06/picopico.key). Recover the flag.
# Pistas
Try using a tool like Wireshark.

How can you decrypt the TLS stream?
# Solución

```bash
Los pasos a seguir para encontrar la bandera de este reto son los siguientes:

- Dentro de wireshark, si echamos un vistazo a los streams de protocolo TLS, podemos ver que al realizar el seguimiento, se encuentra completamente en blanco

- Desde las preferencias del protocolo -> TLS, debemos editar la lista de llaves del protocolo y añadir el archivo picopico.key proporcionado.

Al añadir y volver a realizar el seguimiento de los streams, en el ultimo stream de tipo TLS se nos da la llave:

GET /starter-template.css HTTP/1.1

Host: ec2-18-223-184-200.us-east-2.compute.amazonaws.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0
Accept: text/css,*/*;q=0.1
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Referer: https://ec2-18-223-184-200.us-east-2.compute.amazonaws.com/
Pragma: no-cache
Cache-Control: no-cache

HTTP/1.1 200 OK
Date: Fri, 23 Aug 2019 15:56:36 GMT
Server: Apache/2.4.29 (Ubuntu)
Last-Modified: Mon, 12 Aug 2019 16:47:05 GMT
ETag: "62-58fee462bf227-gzip"
Accept-Ranges: bytes
Vary: Accept-Encoding
Content-Encoding: gzip
Pico-Flag: picoCTF{nongshim.shrimp.crackers}
Content-Length: 100
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive
Content-Type: text/css

  

..........K.O.T..RP(HLI..K.-./.R0-J......+.I,*I-.-I.-.I,IEVj.`.T.`..Q..P.ZQ......g.......2.. ...b...GET /favicon.ico HTTP/1.1

Host: ec2-18-223-184-200.us-east-2.compute.amazonaws.com

User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0

Accept: image/webp,*/*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Pragma: no-cache

Cache-Control: no-cache

HTTP/1.1 404 Not Found
Date: Fri, 23 Aug 2019 15:56:37 GMT
Server: Apache/2.4.29 (Ubuntu)
Content-Length: 326
Keep-Alive: timeout=5, max=99
Connection: Keep-Alive
Content-Type: text/html; charset=iso-8859-1

<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL /favicon.ico was not found on this server.</p>
<hr>
<address>Apache/2.4.29 (Ubuntu) Server at ec2-18-223-184-200.us-east-2.compute.amazonaws.com Port 443</address>
</body></html>

flag: picoCTF{nongshim.shrimp.crackers}
```

# Bandera
"picoCTF{nongshim.shrimp.crackers}"