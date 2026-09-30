# Root-Me Web Server Challenge 15: Directory Traversal Writeup

## Overview

This challenge demonstrates how improper handling of user-controlled directory paths can expose sensitive files and hidden directories.

The application loads image galleries using the `galerie` GET parameter:

```text
http://challenge01.root-me.org/web-serveur/ch15/ch15.php?galerie=apps
```

Available galleries included:

* apps
* devices
* actions
* emotes
* categories

## Initial Reconnaissance

Browsing to the challenge directory revealed that directory listing was enabled:

```text
http://challenge01.root-me.org/web-serveur/ch15/
```

The following resources were visible:

```text
ch15.php
galerie/
```

Attempting to access the gallery directory directly resulted in a forbidden response:

```text
http://challenge01.root-me.org/web-serveur/ch15/galerie/
```

Response:

```text
403 Forbidden
```

This suggested that the directory existed but directory browsing was disabled.

## Source Code Inspection

Inspecting the HTML source showed image references such as:

```html

```

This confirmed that the application was dynamically loading files from the `galerie` directory based on the value of the `galerie` parameter.

## Testing the Parameter

Several values were tested:

```text
?galerie=test
```

Result:

* No images displayed.

```text
?galerie=.
```

Result:

* Partial image listing.

```text
?galerie=..
```

and

```text
?galerie=../
```

Result:

* Different files appeared.
* Fewer images were displayed.

These behaviors indicated that the application was interacting directly with the filesystem and that directory traversal was possible.

## Discovering a Hidden Directory

While enumerating directories, the following path was identified:

```text
http://challenge01.root-me.org/web-serveur/ch15/galerie/86hwnX2r
```

Direct access returned:

```text
403 Forbidden
```

However, using the application parameter:

```text
http://challenge01.root-me.org/web-serveur/ch15/ch15.php?galerie=86hwnX2r
```

successfully listed the contents of the hidden directory.

## Finding the Password

Inside the hidden directory, a file named:

```text
password.txt
```

was revealed.

Opening the file exposed the challenge password, which could then be submitted as the solution.

## Vulnerability

The application trusted user input when selecting directories to enumerate. As a result, an attacker could navigate outside the intended gallery structure and discover hidden resources that were not directly accessible through the web server.

This is a classic example of:

```text
Directory Traversal / Path Traversal
```

## Key Takeaways

* Never trust user-controlled path parameters.
* Restrict filesystem access to a predefined whitelist.
* Avoid exposing internal directory structures.
* Disable unnecessary directory listing.
* Validate and sanitize all file and directory inputs.

## Conclusion

By analyzing the application's behavior, testing the `galerie` parameter, and enumerating accessible directories, it was possible to discover a hidden folder containing `password.txt`. The password inside the file provided the solution to the challenge.
