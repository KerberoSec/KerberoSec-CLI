
#Subscribers 
https://tryhackme.com/room/logsfundamentals

Attackers are clever. They avoid leaving maximum traces on the victim’s side to avoid detection. Yet, the security team successfully determines how the attack was executed and is even sometimes successful in finding who was behind the attack.

Suppose a few policemen are investigating the disappearance of a precious locket in a snowy jungle cabin. They observed that the wooden door of the cabin was brutally damaged, and the ceiling collapsed. There were some footprints on the snowy path to that cabin. Lastly, they discovered some CCTV footage from a neighbouring residence. By placing together all these traces, the police successfully determined who was behind the attack. Various traces are found in several such cases; putting all these together takes you closer to the criminal.

use cases of logs
- security events monitoring
- incident investigation and forensics
- troubleshooting
- performance monitoring
- auditing & compliance

## types of logs

| Log Type         | Usage                                                                                                                                                                                            | Example                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| System Logs      | The system logs can be helpful in troubleshooting running issues in the OS. These logs provide information on various operating system activities.                                               |: System Startup and shutdown events  <br>- Driver Loading events  <br>- System Error events  <br>- Hardware events                                    |
| Security Logs    | The security logs help detect and investigate incidents. These logs provide information on the security-related activities in the system.                                                        | -Authentication events  <br>- Authorization events  <br>- Security Policy changes events  <br>- User Account changes events: Abnormal Activity events |
| Application Logs | The application logs contain specific events related to the application. Any interactive or non-interactive activity happening inside the application will be logged here.                       |: User Interaction events  <br>- Application Changes events  <br>- Application Update events  <br>- Application Error events                           |
| Audit Logs       | The Audit logs provide detailed information on the system changes and user events. These logs are helpful for compliance requirements and can play a vital role in security monitoring as well.  |: Data Access events  <br>- System Change events  <br>- User Activity events  <br>- Policy Enforcement events                                          |
| Network Logs     | Network logs provide information on the network’s outgoing and incoming traffic. They play crucial roles in troubleshooting network issues and can also be handy during incident investigations. |: Incoming Network Traffic events  <br>- Outgoing Network Traffic events  <br>- Network Connection Logs: Network Firewall Logs                        |
| Access Logs      | The Access logs provide detailed information about the access to different resources. These resources can be of different types, providing us with information on their access.                  |: Webserver Access Logs  <br>- Database Access Logs: Application Access Logs  <br>- API Access Logs                                                   |

**Note:** There can be various other types of logs depending on the different applications and the services they provide.

Now that we understand what these logs are and how various types of logs can be helpful in different scenarios, let’s see how we analyze these logs and extract valuable information required from them. Log Analysis is a technique for extracting valuable data from logs. It involves looking for any signs of abnormal or unusual activities. Searching for a specific activity or abnormalities in the logs with the naked eye is impossible. For this reason, we have several manual and automated techniques for log analysis. We will manually carry out log analysis on Windows and Web Server Access Logs in the upcoming tasks.

## web server access log analysis

We interact with many websites daily. Sometimes, we just want to view the website, and sometimes, we want to log in or upload a file into any available input field. These are just different kinds of requests we make to a website. All these requests are logged by the website and stored in a log file on the web server running that website.

This log file contains all the requests made to the website along with the information on the timeframe, the IP requested, the request type, and the URL. Following are the fields taken from a sample log from an Apache web server access log file which can be found in the directory: /var/log/apache2/access.log  

- **IP Address:** “172.16.0.1”: The IP address of the user who made the request.
- **Timestamp:** “[06/Jun/2024:13:58:44]”: The time when the request was made to the website.
- **Request:** The request details.
    - **HTTP Method:** “GET”: Tells the website what action to be performed on the request.
    - **URL:** “/”: The requested resource.
- **Status Code:** “200”: The response from the server. Different numbers indicate different response results.
- **User-Agent:** “Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36”: Information about the user’s Operating System, browser, etc. when making the request.

```
cat access.log
cat access1.log access2.log > combined_access.log
grep "192.168.1.1" access.log
less access.log
```

