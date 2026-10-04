# Initial Problem Statement
```
Santa's been sending his regards; he would like to know who will still want to hack stuff after his CTF is over.
Note: Bluuk is a multilingual bug bounty platform that will launch soon and we've prepared a challenge for you. Subscribe and stay tuned!  

Target: https://bluuk.io  

PS: The subscription form is not the target :P

If you got the wrong version of site because of caching, source code here: 
https://0bin.net/paste/Y3nxbci+#+iDWiHOE9hQRs43n4uZANftYfD3L1wVy9ULjCOcd253

Author: littlewho
```
# Initial Exploration
When we head to the target website there's this interesting message:

"If you are taking part in the X-MAS CTF 2020, click the button below to launch the challenge."

At first glance clicking the button does nothing but showing a pop-up telling us that the challenge has loaded; 

It actually prints a message in the developer console:
```
BLUUK
JavascriptChallenge  
Call win(<string>) with the correct parameter to get the flag!
```

The javascript code we got is this:
```js
console.log("%c██████╗░██╗░░░░░██╗░░░██╗██╗░░░██╗██╗░░██╗\n\██╔══██╗██║░░░░░██║░░░██║██║░░░██║██║░██╔╝\n██████╦╝██║░░░░░██║░░░██║██║░░░██║█████═╝░\n██╔══██╗██║░░░░░██║░░░██║██║░░░██║██╔═██╗░\n██████╦╝███████╗╚██████╔╝╚██████╔╝██║░╚██╗\n╚═════╝░╚══════╝░╚═════╝░░╚═════╝░╚═╝░░╚═╝\n","color: #5cdb95");console.log("🐢 Javascript Challenge 🐢");console.log("Call win(<string>) with the correct parameter to get the flag");console.log("And don't forget to subscribe to our newsletter :D");
function check(s) {const k="MkVUTThoak44TlROOGR6TThaak44TlROOGR6TThWRE14d0hPMnczTTF3M056d25OMnczTTF3M056d1hPNXdITzJ3M00xdzNOenduTjJ3M00xdzNOendYTndFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYwRVRNOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOEZETXh3SE8ydzNNMXczTnp3bk4ydzNNMXczTnp3bk13RURmNFlEZnpVRGYzTURmMllEZnpVRGYzTURmeUlUTThoak44TlROOGR6TThaak44TlROOGR6TThCVE14d0hPMnczTTF3M056d25OMnczTTF3M056dzNOeEVEZjRZRGZ6VURmM01EZjJZRGZ6VURmM01EZjFBVE04aGpOOE5UTjhkek04WmpOOE5UTjhkek04bFRPOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOGRUTzhoak44TlROOGR6TThaak44TlROOGR6TThSVE14d0hPMnczTTF3M056d25OMnczTTF3M056d1hPNXdITzJ3M00xdzNOenduTjJ3M00xdzNOenduTXlFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYzRVRNOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOGhETjhoak44TlROOGR6TThaak44TlROOGR6TThGak14d0hPMnczTTF3M056d25OMnczTTF3M056d25NeUVEZjRZRGZ6VURmM01EZjJZRGZ6VURmM01EZjFFVE04aGpOOE5UTjhkek04WmpOOE5UTjhkek04RkRNeHdITzJ3M00xdzNOenduTjJ3M00xdzNOendITndFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYxRVRNOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOFZETXh3SE8ydzNNMXczTnp3bk4ydzNNMXczTnp3WE94RURmNFlEZnpVRGYzTURmMllEZnpVRGYzTURmeUlUTThoak44TlROOGR6TThaak44TlROOGR6TThkVE84aGpOOE5UTjhkek04WmpOOE5UTjhkek04WlRNeHdITzJ3M00xdzNOenduTjJ3M00xdzNOendITXhFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYza0RmNFlEZnpVRGYzTURmMllEZnpVRGYzTURmMUVUTTAwMDBERVRDQURFUg==";const k1=atob(k).split('').reverse().join('');return bobify(s)===k1;}
function bobify(s) {if (~s.indexOf('a') || ~s.indexOf('t') || ~s.indexOf('e') || ~s.indexOf('i') || ~s.indexOf('z')) return "[REDACTED]";const s1 = s.replace(/4/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i').replace(/7/g, 't').replace(/_/g, 'z').split('').join('[]'); const s2 = encodeURI(s1).split('').map(c => c.charCodeAt(0)).join('|');const s3 = btoa("D@\xc0\t1\x03\xd3M4" + s2);return s3;}
function win(x){return check(x) ? "X-MAS{"+x+"}" : "[REDACTED]";}
```

# 
# Finding our way to the flag

There are 3 functions that seem to take our input modify it and compare it with a given encoded string.
```js
function check(s) 
{const k='MkVUTThoak44TlROOGR6TThaak44TlROOGR6TThWRE14d0hPMnczTTF3M056d25OMnczTTF3M056d1hPNXdITzJ3M00xdzNOenduTjJ3M00xdzNOendYTndFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYwRVRNOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOEZETXh3SE8ydzNNMXczTnp3bk4ydzNNMXczTnp3bk13RURmNFlEZnpVRGYzTURmMllEZnpVRGYzTURmeUlUTThoak44TlROOGR6TThaak44TlROOGR6TThCVE14d0hPMnczTTF3M056d25OMnczTTF3M056dzNOeEVEZjRZRGZ6VURmM01EZjJZRGZ6VURmM01EZjFBVE04aGpOOE5UTjhkek04WmpOOE5UTjhkek04bFRPOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOGRUTzhoak44TlROOGR6TThaak44TlROOGR6TThSVE14d0hPMnczTTF3M056d25OMnczTTF3M056d1hPNXdITzJ3M00xdzNOenduTjJ3M00xdzNOenduTXlFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYzRVRNOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOGhETjhoak44TlROOGR6TThaak44TlROOGR6TThGak14d0hPMnczTTF3M056d25OMnczTTF3M056d25NeUVEZjRZRGZ6VURmM01EZjJZRGZ6VURmM01EZjFFVE04aGpOOE5UTjhkek04WmpOOE5UTjhkek04RkRNeHdITzJ3M00xdzNOenduTjJ3M00xdzNOendITndFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYxRVRNOGhqTjhOVE44ZHpNOFpqTjhOVE44ZHpNOFZETXh3SE8ydzNNMXczTnp3bk4ydzNNMXczTnp3WE94RURmNFlEZnpVRGYzTURmMllEZnpVRGYzTURmeUlUTThoak44TlROOGR6TThaak44TlROOGR6TThkVE84aGpOOE5UTjhkek04WmpOOE5UTjhkek04WlRNeHdITzJ3M00xdzNOenduTjJ3M00xdzNOendITXhFRGY0WURmelVEZjNNRGYyWURmelVEZjNNRGYza0RmNFlEZnpVRGYzTURmMllEZnpVRGYzTURmMUVUTTAwMDBERVRDQURFUg==';
const k1=atob(k).split('').reverse().join('');  //This method decodes and reverses the above base-64 encoded string k. 
return bobify(s) === k1; //Here it compares a modified version of our input with k1 
}

function bobify(s) 
{if (~s.indexOf('a') || ~s.indexOf('t') || ~s.indexOf('e') || ~s.indexOf('i') || ~s.indexOf('z')) return '[REDACTED]'; 
//Here if the letters 'a','t','e','i' or 'z' are present it will return '[REDACTED]' and we won't get our flag :((

const s1=s.replace(/4/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i').replace(/7/g, 't').replace(/_/g, 'z').split('').join('[]'); 
//This replaces every '4' with an 'a', every '3' with an 'e' and so on.

const s2=encodeURI(s1).split('').map(c=>c.charCodeAt(0)).join('|');  
//Here the encodeURI() function encodes a URI by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character.
//After the encoding the string is replaced from characters to character codes separated by '|'
  
const s3=btoa('D@À\t1ÓM4' + s2); // The string passed as parameter gets encoded into base-64 and returned
return s3;}

function win(x)
{return check(x) ? 'X-MAS{' + x + '}' : '[REDACTED]';}  
//Short if statement based on the value returned by the check function printing the flag or '[REDACTED]'
```

We know that the given string got modified through the same code, so we attempt to reverse the steps and get our flag:

Use [this online tool](https://icyberchef.com/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true)Reverse('Character')From_Base64('A-Za-z0-9%2B/%3D',true)&input=TWtWVVRUaG9hazQ0VGxST09HUjZUVGhhYWs0NFRsUk9PR1I2VFRoV1JFMTRkMGhQTW5jelRURjNNMDU2ZDI1T01uY3pUVEYzTTA1NmQxaFBOWGRJVHpKM00wMHhkek5PZW5kdVRqSjNNMDB4ZHpOT2VuZFlUbmRGUkdZMFdVUm1lbFZFWmpOTlJHWXlXVVJtZWxWRVpqTk5SR1l3UlZSTk9HaHFUamhPVkU0NFpIcE5PRnBxVGpoT1ZFNDRaSHBOT0VaRVRYaDNTRTh5ZHpOTk1YY3pUbnAzYms0eWR6Tk5NWGN6VG5wM2JrMTNSVVJtTkZsRVpucFZSR1l6VFVSbU1sbEVabnBWUkdZelRVUm1lVWxVVFRob2FrNDRUbFJPT0dSNlRUaGFhazQ0VGxST09HUjZUVGhDVkUxNGQwaFBNbmN6VFRGM00wNTZkMjVPTW5jelRURjNNMDU2ZHpOT2VFVkVaalJaUkdaNlZVUm1NMDFFWmpKWlJHWjZWVVJtTTAxRVpqRkJWRTA0YUdwT09FNVVUamhrZWswNFdtcE9PRTVVVGpoa2VrMDRiRlJQT0docVRqaE9WRTQ0WkhwTk9GcHFUamhPVkU0NFpIcE5PR1JVVHpob2FrNDRUbFJPT0dSNlRUaGFhazQ0VGxST09HUjZUVGhTVkUxNGQwaFBNbmN6VFRGM00wNTZkMjVPTW5jelRURjNNMDU2ZDFoUE5YZElUekozTTAweGR6Tk9lbmR1VGpKM00wMHhkek5PZW5kdVRYbEZSR1kwV1VSbWVsVkVaak5OUkdZeVdVUm1lbFZFWmpOTlJHWXpSVlJOT0docVRqaE9WRTQ0WkhwTk9GcHFUamhPVkU0NFpIcE5PR2hFVGpob2FrNDRUbFJPT0dSNlRUaGFhazQ0VGxST09HUjZUVGhHYWsxNGQwaFBNbmN6VFRGM00wNTZkMjVPTW5jelRURjNNMDU2ZDI1TmVVVkVaalJaUkdaNlZVUm1NMDFFWmpKWlJHWjZWVVJtTTAxRVpqRkZWRTA0YUdwT09FNVVUamhrZWswNFdtcE9PRTVVVGpoa2VrMDRSa1JOZUhkSVR6SjNNMDB4ZHpOT2VuZHVUakozTTAweGR6Tk9lbmRJVG5kRlJHWTBXVVJtZWxWRVpqTk5SR1l5V1VSbWVsVkVaak5OUkdZeFJWUk5PR2hxVGpoT1ZFNDRaSHBOT0ZwcVRqaE9WRTQ0WkhwTk9GWkVUWGgzU0U4eWR6Tk5NWGN6VG5wM2JrNHlkek5OTVhjelRucDNXRTk0UlVSbU5GbEVabnBWUkdZelRVUm1NbGxFWm5wVlJHWXpUVVJtZVVsVVRUaG9hazQ0VGxST09HUjZUVGhhYWs0NFRsUk9PR1I2VFRoa1ZFODRhR3BPT0U1VVRqaGtlazA0V21wT09FNVVUamhrZWswNFdsUk5lSGRJVHpKM00wMHhkek5PZW5kdVRqSjNNMDB4ZHpOT2VuZElUWGhGUkdZMFdVUm1lbFZFWmpOTlJHWXlXVVJtZWxWRVpqTk5SR1l6YTBSbU5GbEVabnBWUkdZelRVUm1NbGxFWm5wVlJHWXpUVVJtTVVWVVRUQXdNREJFUlZSRFFVUkZVZz09) to decode/encode with base-64. (I already added the input in that tool)

After decoding the string and reversing it, we decode it again from base 64, ignoring this part 'D@À\t1ÓM4', exactly how the js code shows at the creation of the s3 variable, resulting a sequence of character codes separated by '|' :
```js
var uri = '115|37|53|66|37|53|68|97|37|53|66|37|53|68|110|37|53|66|37|53|68|116|37|53|66|37|53|68|97|37|53|66|37|53|68|122|37|53|66|37|53|68|119|37|53|66|37|53|68|105|37|53|66|37|53|68|115|37|53|66|37|53|68|104|37|53|66|37|53|68|101|37|53|66|37|53|68|115|37|53|66|37|53|68|122|37|53|66|37|53|68|121|37|53|66|37|53|68|48|37|53|66|37|53|68|117|37|53|66|37|53|68|122|37|53|66|37|53|68|99|37|53|66|37|53|68|114|37|53|66|37|53|68|97|37|53|66|37|53|68|99|37|53|66|37|53|68|105|37|53|66|37|53|68|117|37|53|66|37|53|68|110|37|53|66|37|53|68|122|37|53|66|37|53|68|102|37|53|66|37|53|68|101|37|53|66|37|53|68|114|37|53|66|37|53|68|105|37|53|66|37|53|68|99|37|53|66|37|53|68|105|37|53|66|37|53|68|116'
```

We proceed by splitting the string to remove the '|' and turn the character codes back into letters;

```js
var encoded=uri.split('|').map(c=>String.fromCharCode(c)).join('');
```

After that's done we're left with decoding the URI, using the decodeURI method, and removing the resulted characters ('[]'):
```
var flag=decodeURI(encoded).split('[]').join('');
```
The final step to recreate the flag is to replace the specified numbers with letters thus reversing the step where variable s1 was created in the original code (use of regex for replacing all apparitions of the character, not just the first one, in the string):
```
flag = flag.replace(/a/g,'4').replace(/e/g,'3').replace(/i/g, '1').replace(/t/g, '7').replace(/z/g, '_');
```
# 
Use the full code below to generate the flag:
```js
var uri = '115|37|53|66|37|53|68|97|37|53|66|37|53|68|110|37|53|66|37|53|68|116|37|53|66|37|53|68|97|37|53|66|37|53|68|122|37|53|66|37|53|68|119|37|53|66|37|53|68|105|37|53|66|37|53|68|115|37|53|66|37|53|68|104|37|53|66|37|53|68|101|37|53|66|37|53|68|115|37|53|66|37|53|68|122|37|53|66|37|53|68|121|37|53|66|37|53|68|48|37|53|66|37|53|68|117|37|53|66|37|53|68|122|37|53|66|37|53|68|99|37|53|66|37|53|68|114|37|53|66|37|53|68|97|37|53|66|37|53|68|99|37|53|66|37|53|68|105|37|53|66|37|53|68|117|37|53|66|37|53|68|110|37|53|66|37|53|68|122|37|53|66|37|53|68|102|37|53|66|37|53|68|101|37|53|66|37|53|68|114|37|53|66|37|53|68|105|37|53|66|37|53|68|99|37|53|66|37|53|68|105|37|53|66|37|53|68|116'
var encoded = uri.split('|').map(c=>String.fromCharCode(c)).join('');
var flag = decodeURI(encoded).split('[]').join('');
flag = flag.replace(/a/g,'4').replace(/e/g,'3').replace(/i/g, '1').replace(/t/g, '7').replace(/z/g, '_');
console.log('X-MAS{' + flag + '}'); 

// "X-MAS{s4n74_w1sh3s_y0u_cr4c1un_f3r1c17}"
```