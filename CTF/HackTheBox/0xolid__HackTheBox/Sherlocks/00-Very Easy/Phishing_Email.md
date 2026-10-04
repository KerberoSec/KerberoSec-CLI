# Phishing_Email Writeup

> Category : SOC

> Your email address has been leaked and you receive an email from PayPal in German. Try to analyze the suspicious email.
> Connect to the VM with the credential provided using RDP.

## Solution

First we have to connect to the machine.

From `pwnbox` use the command:
`xfreerdp /v:<ipaddress> /u:letsdefend /p:'' /cert:ignore /dynamic-resolution `

**File location:** `C:\Users\LetsDefend\Desktop\Files\PhishingChallenge.zip` 
**Password:** `infected`

So now let's copy the folder and send it to the local machine.

```shell
7z x PhishingChallenge.zip
```

```shell
cd PhishingChallenge.zip
```

```shell
ls
```

```text
paypal.eml
```

> 1. What is the return path of the email?

```shell
grep -i "return" paypal.eml
```

```text
Return-Path: <bounce@rjttznyzjjzydnillquh.designclub.uk.com>
```

> Answer: bounce@rjttznyzjjzydnillquh.designclub.uk.com

> 2. What is the domain name of the url in this mail?

To answer this question, we need to inspect the hyperlink embedded in the email body.

https://storage.googleapis.com/hqyoqzatqthj/aemmfcylvxeo.html#QORHNZC44FT4.QORHNZC44FT4?dYCTywccxr3jcxxrmcdcKBdmc5D6qfcJVcbbb4M

> Answer: storage.googleapis.com

> 3. Is the domain mentioned in the previous question suspicious?

So to check if the domain is suspicious, we using tools like `VirusTotal`.
That's it we can see the domain is flagged by multiple security vendors.

> Answer: yes

> 4. What is the sender IP address listed in the Received-SPF header?

```shell
grep -i "spf" paypal.eml
```

```text
spf=pass (google.com: domain of bounce@rjttznyzjjzydnillquh.designclub.uk.com designates 134.195.196.43 as permitted sender) smtp.mailfrom=bounce@rjttznyzjjzydnillquh.designclub.uk.com
Received-SPF: pass (google.com: domain of bounce@rjttznyzjjzydnillquh.designclub.uk.com designates 134.195.196.43 as permitted sender) client-ip=134.195.196.43;
spf=pass (google.com: domain of bounce@rjttznyzjjzydnillquh.designclub.uk.com designates 134.195.196.43 as permitted sender) smtp.mailfrom=bounce@rjttznyzjjzydnillquh.designclub.uk.com
ggtwfouyfnynwgqololxakgwudhtkvnhogafpjgctzkzazptiapkkouipkgecsgsspfqmxxptgurwoffnswmljbnzyectoehitafxvbvrlnymiftcboectjvqwjahugddiojegjxtrjnkqqljyoklsyzljbomvqzxdraozqwudeyrbksoxamufytlwviddnaxxkupiauolcpiq
```

We can see that the IP address is `134.195.196.43`.

> Answer: 134.195.196.43

> 5. Is this email a phishing email?

The email body uses PayPal branding and a delivery-confirmation lure, but the embedded destination points to storage.googleapis.com rather than a PayPal-controlled domain.

> Answer: yes

