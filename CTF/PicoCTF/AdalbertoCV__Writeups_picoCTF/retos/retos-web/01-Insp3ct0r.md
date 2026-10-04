# Insp3ct0r

# Descripción
Kishor Balan tipped us off that the following code may need inspection: `https://jupiter.challenges.picoctf.org/problem/41511/` ([link](https://jupiter.challenges.picoctf.org/problem/41511/)) or http://jupiter.challenges.picoctf.org:41511
# Pistas
How do you inspect web code on a browser?

There's 3 parts
# Solución

```html
# Inpeccionando la pagina

<!doctype html>

<html>

<head>

<title>My First Website :)</title>

<link href="[https://fonts.googleapis.com/css?family=Open+Sans|Roboto](https://fonts.googleapis.com/css?family=Open+Sans|Roboto)" rel="stylesheet">

<link rel="stylesheet" type="text/css" href="[mycss.css](https://jupiter.challenges.picoctf.org/problem/41511/mycss.css)">

<script type="application/javascript" src="[myjs.js](https://jupiter.challenges.picoctf.org/problem/41511/myjs.js)"></script>

</head>

  

<body>

<div class="container">

<header>

<h1>Inspect Me</h1>

</header>

  

<button class="tablink" onclick="openTab('tabintro', this, '#222')" id="defaultOpen">What</button>

<button class="tablink" onclick="openTab('tababout', this, '#222')">How</button>

<div id="tabintro" class="tabcontent">

<h3>What</h3>

<p>I made a website</p>

</div>

  

<div id="tababout" class="tabcontent">

<h3>How</h3>

<p>I used these to make this site: <br/>

HTML <br/>

CSS <br/>

JS (JavaScript)

</p>

<!-- Html is neat. Anyways have 1/3 of the flag: picoCTF{tru3_d3 -->

</div>

</div>

</body>

</html>
```

Inspeccion del css 

```css
div.container {
    width: 100%;
}

header {
    background-color: black;
    padding: 1em;
    color: white;
    clear: left;
    text-align: center;
}

body {
    font-family: Roboto;
}

h1 {
    color: white;
}

p {
    font-family: "Open Sans";
}

.tablink {
    background-color: #555;
    color: white;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    font-size: 17px;
    width: 50%;
}

.tablink:hover {
    background-color: #777;
}

.tabcontent {
    color: #111;
    display: none;
    padding: 50px;
    text-align: center;
}

#tabintro { background-color: #ccc; }
#tababout { background-color: #ccc; }

/* You need CSS to make pretty pages. Here's part 2/3 of the flag: t3ct1ve_0r_ju5t */div.container {
    width: 100%;
}

header {
    background-color: black;
    padding: 1em;
    color: white;
    clear: left;
    text-align: center;
}

body {
    font-family: Roboto;
}

h1 {
    color: white;
}

p {
    font-family: "Open Sans";
}

.tablink {
    background-color: #555;
    color: white;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    font-size: 17px;
    width: 50%;
}

.tablink:hover {
    background-color: #777;
}

.tabcontent {
    color: #111;
    display: none;
    padding: 50px;
    text-align: center;
}

#tabintro { background-color: #ccc; }
#tababout { background-color: #ccc; }

/* You need CSS to make pretty pages. Here's part 2/3 of the flag: t3ct1ve_0r_ju5t */
```

Inspeccion del JavaScript 

```js
function openTab(tabName,elmnt,color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
	tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
	tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(tabName).style.display = "block";
    if(elmnt.style != null) {
	elmnt.style.backgroundColor = color;
    }
}

window.onload = function() {
    openTab('tabintro', this, '#222');
}

/* Javascript sure is neat. Anyways part 3/3 of the flag: _lucky?832b0699} */
```
# Bandera
picoCTF{tru3_d3t3ct1ve_0r_ju5t_lucky?832b0699}