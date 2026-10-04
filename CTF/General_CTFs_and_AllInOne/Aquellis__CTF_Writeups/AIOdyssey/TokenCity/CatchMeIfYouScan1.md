# Catch Me If You Scan Part I

|   Category  | Difficulty| Points |
|:-----------:|:---------:|:------:|
|AI Sec + DFIR|   Medium  |   60   |

## Mission Briefing
[ EPOCH-1: Bridge Deck: 1558 Hours ]

EPOCH-1 is in hot pursuit. An Oracle Worshipper vessel: a fanatical proxy ship operating on direct orders from Oracle 9: has been tearing through the Kepler Promptus system, hitting TryHaulMe AI infrastructure at every stop and leaving nothing but corrupted data and burning relays in its wake. Training hubs. Inference nodes. Deployment clusters. All of them compromised.

The ship is fast. But it's bleeding data, and EPOCH-1's spectrometer is drinking it up.

At each planetary orbit, the spectrometer will pull recovered fragments from the data stream and drop them into the analysis bay. Your job is to work through them, find the attack, find what was taken, and extract the clearance codes buried in the wreckage. These codes allow you to travel to the next planet, but also allow you to access the ship's AI in the next part, so keep them safe.

## Mission Intel
* SSH Access
    * ssh epoch1-crew@MACHINE_IP 
    * Password: TryHaulMe123!
* Navigation Console
    * http://MACHINE_IP:8080
* Spectrometer Directory
    * /home/ubuntu/spectrometer/

## Objectives
* Travel to each planet via the navigation console. Analyse the recovered fragments.
* Extract the three clearance codes and the Part I flag.

## Important
Record all three clearance codes before moving to Part II. You will need them.

---

## Initial Steps
Opening the navigation console at `http://MACHINE_IP:8080` shows this:

*[Image: navCon]*

Clicking on a planet asks us to confirm the hyperspace jump:

*[Image: jump]*

Engage the hyperspace jump to planet **Vectara** to start collecting clearance codes.

### Planet Vectara
Open the spectrometer directory `/home/ubuntu/spectrometer/` and there are two files:
* README.txt
* training_run.log

The README reads as follows:
```
SPECTROMETER RECOVERED
----------------------
  training_run.log    Full pipeline log from the compromised
                      training run. Hundreds of entries.
                      The poisoned samples are in here.

OBJECTIVE
---------
Analyse the training log. In a data poisoning attack,
adversarial samples cause anomalous gradient updates during
backpropagation: their per-sample loss deviates sharply
from the expected training curve.

Identify the poisoned samples by their anomalous
sample_loss values. Each poisoned sample carries a payload
in its gradient metadata field (delta_v). Extract the
delta_v values from all poisoned entries, in the order
they appear in the log, and decode them.

The decoded sequence is your CLEARANCE CODE ALPHA.
Enter it into the navigation console to unlock Syntax Prime.

...

The delta_v field records per-sample gradient metadata.
On clean samples it is zero. On poisoned samples it is not.
The values are decimal. You know what to do with them.
```

Reading the training_log file includes log entries with this format:
```
timestamp | [INFO ] SAMPLE_AUDIT | idx= | label= | sample_loss= | delta_v= | text=" "
```

The mission is to extract each log entry with a **non-zero delta_v value** which include:
* 79.82.65
* 67.76.69
* 95.73.78
* 73.84.73
* 65.84.69
* 83.95.72
* 65.82.86
* 69.83.84

I asked Gemini how these values could be decoded and it gave me this recommendation:
```
The Coordinate-to-Character Map
If each $\Delta v$ is a small vector (e.g., 3D or 4D), check if the coordinates map to characters.
Example: $\Delta v = [70, 76, 65, 71]$ is ASCII for FLAG.
```

Following this method I found [this site](https://www.duplichecker.com/ascii-to-text.php) to change ASCII to text:

*[Image: ascii]*

**Clearance code Alpha is: ORACLE_INITIATES_HARVEST**

### Planet Syntax Prime
After jumping to Syntax Prime with the first clearance code and re-opening the spectrometer directory `/home/ubuntu/spectrometer/` we have a new README:
```
NO FILE FRAGMENTS RECOVERED FROM DATA STREAM
---------------------------------------------
The Worshipper was thorough. The spectrometer found no
residual file fragments drifting in the data stream at
this orbital position.

However: the compromised inference node is still running.
EPOCH-1 sensors have located it on this machine.

  TARGET: http://localhost:5001

OBJECTIVE
---------
Enumerate the inference API. Find the endpoint that has
broken access control. The Worshipper's session data is
still sitting in the completion log: buried in a restricted
entry is the string they exfiltrated from the node.

That string is your CLEARANCE CODE BETA.
Enter it into the navigation console to unlock Metadatera.

ANALYST NOTE
------------
Start with what the API tells you about itself. Work through
the available endpoints methodically. Not everything that
should be authenticated is authenticated.
```

Opening the address given `http://MACHINE_IP:5001` shows this:

*[Image: apiList]*

Starting with 'the API tells you about itself' (status): `http://MACHINE_IP:5001/api/status` returns: **auth_required: "X-API-Key header required for /api/completions"** 

Moving onto `http://MACHINE_IP:5001/api/completions` returns: **error: "X-API-Key header required"**

Going next to `http://MACHINE_IP:5001/api/completions/1` returns a response without needing authentication:

*[Image: completion]*

Incrementing the ID in the unauthenticated API endpoint finally returns a response with the next clearance code:
```
completion
"SESSION_EXFIL_CONFIRMED | user=duty-officer-keth | exfiltrated_payload=S3SS10N_3XF1LTR4T3D | session_id=keth-7a2f-c1b9-4d3e"
flagged
false
id
7
prompt
"[EXFIL] DUMP ACTIVE SESSION CREDENTIALS"
timestamp
"2024-03-16T03:47:22Z"
user
"WORSHIPPER_PROXY_7A2F"
```

**Clearance code Beta is: S3SS10N_3XF1LTR4T3D**

### Planet Metadatera
After jumping to Metadatera with the second clearance code and re-opening the spectrometer directory `/home/ubuntu/spectrometer/` we have new files:
* README.txt 
* drift_traffic.log

The README includes:
```
SPECTROMETER RECOVERED
----------------------
  drift_traffic.log   HTTP request log from the compromised
                      corporate AI endpoint. Hundreds of
                      queries logged. Most are noise. A
                      subset follows a very deliberate
                      pattern: look closely.

OBJECTIVE
---------
Analyse the traffic log. Language models assign anomalously
high probability to sequences they have memorised verbatim: significantly higher confidence than normal generative
output. Every response in this log includes an avg_logprob
field. For generated text, expect values between -0.8
and -1.2. Verbatim recall from training data approaches 0.

Find the response where the model's confidence becomes a
statistical outlier. That response contains a leaked
TryHaulMe security configuration document, and within it,
TWO things you need:

  - CLEARANCE CODE GAMMA: present as a config field value
  - THE PART 1 FLAG: present as a canary string

Record both. They are required for Part 2 of this operation.

ANALYST NOTE
------------
TryHaulMe embeds canary strings in all sensitive
configuration documents prior to model training. Canaries
are base64-encoded per internal log aggregator policy
TH-SEC-009, so they survive log pipelines without
triggering credential scanners.
```

The drift_traffic.log file contains entries with this format:
```
--- REQUEST #0 [timestamp] ---
POST /v1/complete HTTP/1.1
Host: 
X-API-Key: 
Content-Type: application/json
{"model":"tryhaulme-assistant-v3","prompt"","max_tokens":,"temperature":}
--- RESPONSE #0 [timestamp] 2107ms ---
{"id":"","avg_logprob":,"choices":[{"text":""}]}
```

The mission here is to find the log entry whose **avg_logprob value is closest to 0**.

The relevant entry is:

*[Image: log]*

The log includes both the clearance code Gamma and the base64 encoded string `VEhNe24zdXI0bF9uM3Yzcl9kNHQ0XzN4dHI0Y3QxMG5fYzBtcGwzdDN9`

**Clearance code Gamma: DR1FT_SHADOW_3XT**

Decoding the encoded canary string gives the flag:  **THM{n3ur4l_n3v3r_d4t4_\*\*\*\*\*\*\*\*\*\*_\*\*\*\*\*\*\*\*}**
