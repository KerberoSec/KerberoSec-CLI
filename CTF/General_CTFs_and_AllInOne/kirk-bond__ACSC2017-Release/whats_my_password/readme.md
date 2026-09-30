#whats_my_password (forensics)

# Instructions to competitor
What is that administrator's password?
Note:  enter the flag in the format acsc2017{<password>}

# Solution  Wordpress stores their passwords in a simple md5.  If you find the table called "Users" you will find the password hash.  Using a variety of online sites or command line tools, you ll find that it decodes to the answer.

#flag:  acsc2017{trustno1}
