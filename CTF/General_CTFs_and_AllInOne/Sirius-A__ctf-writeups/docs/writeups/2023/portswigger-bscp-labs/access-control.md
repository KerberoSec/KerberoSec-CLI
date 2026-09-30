# Access Control

## File path traversal, simple case

Change last parameter path of `https://0a4100de0481f1a8815553d000b50008.web-security-academy.net/image?filename=36.jpg`
to `../../../etc/passwd`

## Unprotected admin functionality

1. Open `robots.txt`
2. See `Disallow: /administrator-panel`
3. Navigate to that route
4. Delete carlos user

## Unprotected admin functionality with unpredictable URL

1. Find this script in the source code:
``` js
var isAdmin = false;
if (isAdmin) {
   var topLinksTag = document.getElementsByClassName("top-links")[0];
   var adminPanelTag = document.createElement('a');
   adminPanelTag.setAttribute('href', '/admin-jquaos');
   adminPanelTag.innerText = 'Admin panel';
   topLinksTag.append(adminPanelTag);
   var pTag = document.createElement('p');
   pTag.innerText = '|';
   topLinksTag.appendChild(pTag);
}
```
2. Navigate to `/admin-jquaos`

## User role controlled by request parameter

1. Login as `wiener:peter`
2. Set the `Admin` cookie to `true`
3. Navigate to `/admin`

