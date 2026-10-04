# Packet Analysis Notes

## HTTP Request

An HTTP request is sent from a client to a web server requesting content.

Example:

GET /payload.ps1 HTTP/1.1

---

## HTTP Response

The server returns requested content.

Example:

HTTP/1.1 200 OK

---

## Indicators of Malicious Activity

- Downloads of executable content
- PowerShell scripts
- Suspicious domains
- Unusual outbound connections

---

## Investigation Workflow

1. Capture packets.
2. Identify HTTP traffic.
3. Follow request-response sequence.
4. Review downloaded content.
5. Extract indicators.
