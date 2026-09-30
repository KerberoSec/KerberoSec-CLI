
# Hacking 

## Google Hacking

Google Dorking. 

1. Passive Recon 

gather intel on target using public knowledge via Google

`Passive Google Operators`:

what to type inside Google search bar

- `query` site:`website.com`
- `site:website.com inurl:admin`
- `site:starbucks.com intext:admin`
- `site:website.com intitle:login`
- `site:website.com filetype:pdf`

google hacking database

Certified Ethical Hacker (white hat)

- {intermediate level} 2 yrs IT experience + $100 to apply
- pay for course $850 => exam $1199

video | lab | book 

## Nmap: network vulnerabilities

TCP protocol 
3 way handshake
syn => port 443  website
syn <= syn ack 

## Resources

- antisyphon training  (pay what you will)
- https://www.antisyphontraining.com/
- 

## kali: password hacking

```
kali: `ip a s eth0`
target vm (ubuntu): `ip a s ens33`    
[from kali] ssh user@x.x.x.x   # target VM ip

```

```
ssh into ubuntu asks for password
ls /usr/share/wordlists/  rockyou.txt.gz
sudo chown kali:kali .
gunzip rockyou.txt.gz     # leaked passwords dictionary
```

- `hydra -l user -P fasttrack.txt ssh://x.x.x.x -V -I -F`

