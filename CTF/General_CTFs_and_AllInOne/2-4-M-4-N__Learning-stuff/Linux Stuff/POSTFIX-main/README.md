source : [here](https://youtu.be/blYx6VQEPXY?si=3s0quKe4EY_EhL8V)

## Warning! Please Backup first before changing to main server.

### How to install postfix on linux?

- ```sudo apt install postfix```
- ```yum install postfix```
- ```apt install mailx```
- ```yum install mailx```
- ```apt install mailutils```
- ```apt install bsd-mailx```

### To check postfix installed or not.
- ```rpm -qa | grep postfix```

### Postfix configuration 

- ```cd /etc/postfix/```
- ```vi main.cf```

### After entering to file, below following line should be added

- relayhost = [smtp.gmail.com]:587
- myhostname = host_name

### At the end of this cf configuration file, the following likne should be added

```
# Location of sasl-passwd we saved
smtp_sasl_password_maps = hash:/etc/postfix/sasl/sasl_passwd

# Enables SASL authentication for postfix
smtp_sasl_auth_enable = yes
smtp_tls_security_level = encrypt

# Disallow methods that allow anonymous authentication
smtp_sasl_security_options = noanonymous

```
### After that Create a file under ```/etc/postfix/sasl/```

- Filename: ```touch sasl_passwd```

__Add the below line__
- ```[smtp.gmail.com]:587 email@gmail.com:password```

### Convert the sasl_passwd file into db file
- ```postmap /etc/postfix/sasl/sasl_passwd```

### Set the file permission for only root user

- ```ls -ltr```
- ```chmod * 600```

### Start/Stop the Postfix service

- ```systemctl start/enable postfix```
- ```systemctl stop/disable postfix```
- ```systemctl restart postfix```

### how to send email

- ```echo "Test Mail" | mail  -s "Postfix TEST" receiver@gmail.com```

### If found a security issue for sending email then must have edit ```main.cf``` file

- ```cd postfix```
- ```vi main.cf```
- and the comment out to by typing ```#``` to ```smtp_tls_security_level = may```
- then restart the Postfix ```systemctl restart postfix```

## How to send a file using POSTFIX?

- ```echo "Test Mail" | mail  -s "Postfix TEST" - a testfile.txt receiver@gmail.com```

### For troubleshooting postfix

- ```less /var/log/maillog``` for checking email issues

