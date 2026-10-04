# natas3

link-> https://overthewire.org/wargames/natas/natas3.html

## LEVEL GOAL

Username: natas3<br>
Password: sJIJNW6ucpu6HPZ1ZAchaDtwd7oGrD14<br>
URL:      http://natas3.natas.labs.overthewire.org<br>

## SOLUTION

After login we see
`There is nothing on this page`. Ok, let's jump in try prev tricks `ctrl + u` and there is a message called 
`No more information leaks!! Not even Google will find it this time...` Ahhh.. Now what? Ok, now why they say google?
is that our hint? So maybe robots.txt will help us to find our next level password. So go that link http://natas3.natas.labs.overthewire.org/robots.txt but its say `User-agent: * Disallow: /s3cr3t/` /s3cr3t/ Disallow. go to http://natas3.natas.labs.overthewire.org/s3cr3t/ link and we find our user.txt file and inside it our next level password. So our password is
`natas4:Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ`

## Note 

What is robots.txt file? please google it.