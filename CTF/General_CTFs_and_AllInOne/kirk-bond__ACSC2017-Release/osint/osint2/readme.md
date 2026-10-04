# osint2 (osint)

# Instructions to contestant
Looks like the acsc2017 webmaster was putting together a new wordpress site but forgot to secure the file that contains the site database password and pretty much everything else important.  

WARNING:  Remember absolutely no hacking of any kind is required for this challenge.  You should be able to find the answer location using simple open source techniques and the location is publicly accessable.  It will be very obvious that you have the correct web site when you find it.

# Solution This search should find it in google
""inurl:wp config" -sample filetype:php intext:acsc2017"
Flag can be found at http://just-an-exposed-config-file.us/wp-config.php

#Flag acsc2017{SecureThoseConfigFiles}

