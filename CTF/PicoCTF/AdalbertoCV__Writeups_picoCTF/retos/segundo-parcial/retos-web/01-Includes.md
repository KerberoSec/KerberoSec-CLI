# Includes

# Descripción
Can you get the flag?Go to this [website](http://saturn.picoctf.net:54554/) and see what you can discover.
# Pistas
Is there more code than what the inspector initially shows?
# Solución

```html
--- Realizamos un analizis del código fuente:

  

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<meta http-equiv="X-UA-Compatible" content="ie=edge">

<link rel="stylesheet" href="[style.css](http://saturn.picoctf.net:54554/style.css)">

<title>On Includes</title>

</head>

<body>

<script src="[script.js](http://saturn.picoctf.net:54554/script.js)"></script>

<h1>On Includes</h1>

<p>Many programming languages and other computer files have a directive,

often called include (sometimes copy or import), that causes the

contents of a second file to be inserted into the original file. These

included files are called copybooks or header files. They are often used

to define the physical layout of program data, pieces of procedural code

and/or forward declarations while promoting encapsulation and the reuse

of code.</p>

<br>

<p> Source: Wikipedia on Include directive </p>

<button type="button" onclick="greetings();">Say hello</button>

</body>

</html>

Revisando la hoja de estilos:

body {
  background-color: lightblue;
}

/*  picoCTF{1nclu51v17y_1of2_  */

Revisando el JS:

function greetings()
{
  alert("This code is in a separate file!");
}

//  f7w_2of2_df589022}
```

# Bandera
picoCTF{1nclu51v17y_1of2_f7w_2of2_df589022}
