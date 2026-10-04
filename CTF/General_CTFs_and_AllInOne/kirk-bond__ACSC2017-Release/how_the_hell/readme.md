#how_the_hell? (php, Web Exploit)

# Setup:  Load index.php and the image file into the http directory of a webserver

# Instructions to contestant
Preface:  The year is 2019, and you're a blade runner.  You've managed to get on a terminal connected to the Tyrell Corps internal network but first, you have to login.  You check the desk for a username/password but the only thing you see is the number 581 written on a sticky pad on the corner of the screen.

# Vulnerability:  The side is suspectable to a simple cookie modification

#Solution:  The cookie for the page tracks how many times the pages has been loaded.  Can either reload the page 581 times (if you're really bored) or just change the value of the cookie to 580 and reload the page one last time.

#Flag:  acsc2017{KeepClickin}
