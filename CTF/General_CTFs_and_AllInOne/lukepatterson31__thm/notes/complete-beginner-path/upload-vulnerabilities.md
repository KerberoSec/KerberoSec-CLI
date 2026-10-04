### Overwriting existing files

Question 1: What's the name of the image file which can be overwritten?

method: inspect the page of overwrite.uploadvulns.thm 
 
answer: mountains.jpg

Question 2: Overwrite the image. What's the flag you receive?

method: upload a file called mountains.jpg

answer: THM{OTBiODQ3YmNjYWZhM2UyMmYzZDNiZjI5}

### RCE

Question 1: What directory looks like it might be used for uploads?

method: Run a gobuster scan against shell.uploadvulns.thm 
`gobuster -u shell.uploadvulns.thm -w directory-list-2.3-medium.txt`

answer: /resources

Question 2: Get a web shell or reverse shell on the machine. What is the flag
in /var/www?

method 1: Make a webshell file `<?php> echo system($_GET["cmd"]); ?>` and upload to the 
/resources folder. Call the shell with the cmd parameter set:
`shell.uploadvuln.thmn/resources/shell.php?cmd=cat /var/www/flag.txt`

mehtod 2: Upload a php reverse shell (pentestmonkey) with the correct ip and port number to
the /resources folder. Start a netcat listener on your machine on the specified port then 
navigate to `shell.uploadvuln.thmn/resources/reverse-shell.php`

answer: THM{YWFhY2U3ZGI4N2QxNmQzZjk0YjgzZDZk}

### Bypassing Client-Side Filtering

Bypass CLient-side filters:

1. Turn off javascript in youre browser
2. Intercept and modify the incoming page top remove the filter
3. Intercept and modify the file upload
4. Send the file directly to the upload point e.g 
`curl -X POST-F "submit:<value>" -F "<file-parameter>:@<path-to-file>" <site>` 

Question 1: What's the flag in /var/www?

method 1: Using gobuster find the upload directory `/images`. Intercept the response to the 
browser's GET request to load the page and delete the tags for the client side filter js 
file: `<script>client-side-filter.js<script/>`

Upload our reverse shell `shell.php` and set up a netcat listener on our machine then 
navigate to the shell in our browser executing our reverse shell

method 2: Using gobuster find the upload directory `/images`. Rename our shell to shell.png,
upload the renamed file and intercept the upload. Edit the MIME header to `text/x-php` and 
the file extension to .php then navigate to the shell in our browser executing the reverse 
shell

answer: THM{NDllZDQxNjJjOTE0YWNhZGY3YjljNmE2}

### Bypassing Server-Side Filtering: File Extensions

1. Determine restrictions on file uploads
2. Try alternate file extensions (.php3, .php4, .php5, .php7, .phps, .php-s, .pht and 
.phar)
3. Try multiple extensions on a file e.g shell.jpg.php

Question 1: What's the flag in /var/www?

method: Using gobuster find the upload directory `/privacy`. Select a reverse shell file 
renamed to use .png extension. Upload the file and intercept the request. Change the MIME 
type to text/x-php and add a .php5 extension to the file. Navigate to the reverse shell
in browser executing the reverse shell

answer: THM{MGEyYzJiYmI3ODIyM2FlNTNkNjZjYjFl}

### Bypassing Server-Side Filtering: Magic Numbers

- Identify file magic numbers with `file`
- Find them on [Wikipedia](https://en.wikipedia.org/wiki/List_of_file_signatures)
- Change them with `hexeditor`

Question 1: What's the flag in /var/www?

method: Using gobuster find the upload directory `/graphics`. Edit the reverse shell
file with hexeditor, adding the magic number for GIFs. Upload the reverse shell and navigate
to it in browsaer executing the reverse shell

answer: THM{MWY5ZGU4NzE0ZDlhNjE1NGM4ZThjZDJh}

### Example Methodology

1. The first thing we would do is take a look at the website as a whole. Using browser 
extensions such as the aforementioned Wappalyzer (or by hand) we would look for indicators 
of what languages and frameworks the web application might have been built with. Be aware 
that Wappalyzer is not always 100% accurate. A good start to enumerating this manually 
would be by making a request to the website and intercepting the response with Burpsuite. 
Headers such as server or x-powered-by can be used to gain information about the server. 
We would also be looking for vectors of attack, like, for example, an upload page.

2. Having found an upload page, we would then aim to inspect it further. Looking at the 
source code for client-side scripts to determine if there are any client-side filters to 
bypass would be a good thing to start with, as this is completely in our control.

3. We would then attempt a completely innocent file upload. From here we would look to see 
how our file is accessed. In other words, can we access it directly in an uploads folder? 
Is it embedded in a page somewhere? What's the naming scheme of the website? This is where 
tools such as Gobuster might come in if the location is not immediately obvious. This step 
is extremely important as it not only improves our knowledge of the virtual landscape 
we're attacking, it also gives us a baseline "accepted" file which we can base further 
testing on.

	- An important Gobuster switch here is the -x switch, which can be used to look for 
	files with specific extensions. For example, if you added -x php,txt,html to your 
	Gobuster command, the tool would append .php, .txt, and .html to each word in the 
	selected wordlist, one at a time. This can be very useful if you've managed to upload 
	a payload and the server is changing the name of uploaded files.

4. Having ascertained how and where our uploaded files can be accessed, we would then 
attempt a malicious file upload, bypassing any client-side filters we found in step two. 
We would expect our upload to be stopped by a server side filter, but the error message 
that it gives us can be extremely useful in determining our next steps.

Assuming that our malicious file upload has been stopped by the server, here are some ways 
to ascertain what kind of server-side filter may be in place:

- If you can successfully upload a file with a totally invalid file extension (e.g. 
testingimage.invalidfileextension) then the chances are that the server is using an 
extension blacklist to filter out executable files. If this upload fails then any 
extension filter will be operating on a whitelist.

- Try re-uploading your originally accepted innocent file, but this time change the magic 
number of the file to be something that you would expect to be filtered. If the upload 
fails then you know that the server is using a magic number based filter.

- As with the previous point, try to upload your innocent file, but intercept the request 
with Burpsuite and change the MIME type of the upload to something that you would expect 
to be filtered. If the upload fails then you know that the server is filtering based on 
MIME types.

- Enumerating file length filters is a case of uploading a small file, then uploading 
progressively bigger files until you hit the filter. At that point you'll know what the 
acceptable limit is. If you're very lucky then the error message of original upload may 
outright tell you what the size limit is. Be aware that a small file length limit may 
prevent you from uploading the reverse shell we've been using so far.

### Challenge Time!

client-side filter:
	- 50kb file size
	- jpg magic number "ÿØÿ"
	- first extension must be .jpg/.jpeg

server-side filter:
	- MIME type 

notes:
1. Discovered `/admin` page with a file execution form for files in `/modules`
2. Images and uploaded files stored in `/content`
3. Execute shell via `/admin` page
	

Question 1: Hack the machine and grab the flag from /var/www/

method: Identify admin page `/admin` and upload directory `/content` by using gobuster.
Send a valid jpeg file and intercept responses with Burp, find X-powered-by is Express.
Server backend runs Node.js so upload node reverse shell with .jpg extension to get past
server-side MIME filter. Using UploadVulnsWordlist.txt and -x tag in gobuster find 
uploaded jpg's new name, start netcat listener on attacking machine and execute the 
reverse shell through admin page `../content/<jpg name>.jpg`

answer: THM{NzRlYTUwNTIzODMwMWZhMzBiY2JlZWU2}
