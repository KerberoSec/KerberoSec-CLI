## TASK-1  Who was the email sent to? (Answer is the email address) 

Start the attackbox and open the mail application. Read the headers of the mail and get the answer to this question. ```elfREDACTEDphearson@tbfc.com```

## TASK-2 Who does it say the email was from?

Read the sender email in the header. ```customerREDACTED@t8fc.info```

## TASK-3 If this email was replied to, what email address will receive the email response?

The reply-to message is to the different email than the sender. ```REDACTED@tempmailz.grinch```

## TASK-4 What is the misspelled word?

Read out the contents of the email. You will eventually find the typo ```st****t```

## TASK-5 What is the link to the credential harvesting website?

Inspect the link of the password reset button. ```https://REDACTED.grinch/out/fishing/```

## TASK-6 There is an unusual email header. What is the header and its value?

View te source code of the email and you will eventually find out the unusual grinchy header. ```X-GrinchPhish: REDACTED```

## TASK-7 Open attachment.txt. What is the name of the attachment?

Under the name. You will find the name of the attachment. ```REDACTED-instructions.pdf```

## TASK-8 What is the flag in the PDF file?

Cat out the base64.txt file inside the email artifacts folder in the desktop. Run the command ```cat base64.txt | base64 -d | tee test.pdf```<br>
And open the pdf file and you will find the flag. ```THM{REDACTED}```

<h3><b>That's it for Day-19. Happy Hacking!</b></h3>
