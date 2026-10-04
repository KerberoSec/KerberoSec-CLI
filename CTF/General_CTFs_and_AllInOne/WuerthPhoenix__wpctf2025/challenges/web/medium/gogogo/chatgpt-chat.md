This is a copy for backup purpose of chat https://chatgpt.com/share/68cd2b6c-04ac-800d-b066-fe8b68765ce5

### Question

Hi I want to write a simple reverse proxy in golang this proxy should rate limit the requests based on RemoteAddr, max requests per minute: 20

### Answer
Here’s a working example of a reverse proxy in Go with per-IP rate limiting (20 requests/minute). I’ve added a few inline comments so you can follow the logic:
```go
package main

import (
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sync"
	"time"
)

func remoteIP(addr string) string {
	// Extract only the IP part (strip port if present)
	if ip, _, err := net.SplitHostPort(addr); err == nil {
		return ip
	}
	return addr
}

func main() {
	backend := "http://backend:5000" // 👈 replace with your actual backend service
	target, err := url.Parse(backend)
	if err != nil {
		log.Fatalf("invalid backend URL: %v", err)
	}

	var mu sync.Mutex
	counts := make(map[string]int)

	// Reset counts every minute ⏱️
	go func() {
		t := time.NewTicker(time.Minute)
		for range t.C {
			mu.Lock()
			counts = make(map[string]int)
			mu.Unlock()
		}
	}()

	proxy := &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			// Rewrite request to backend 🎯
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host
		},
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ip := remoteIP(r.RemoteAddr)

		mu.Lock()
		counts[ip]++
		c := counts[ip]
		mu.Unlock()

		if c > 20 { // limit exceeded 🚫
			w.Header().Set("Retry-After", "60")
			w.Header().Set("X-Rate-Limit-Key", ip)
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		// Forward request to backend
		proxy.ServeHTTP(w, r)
	})

	log.Printf("Reverse proxy listening on :8080 -> %s", target)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

```

This proxy will:

* Forward all requests to your backend service.
* Track requests per client IP.
* Allow up to 20 requests per minute.
* Return 429 Too Many Requests with headers when the limit is exceeded.
------------------
Do you also want me to extend this so it sends proper X-RateLimit-* headers (like X-RateLimit-Limit, X-RateLimit-Remaining), similar to how APIs usually expose quotas?