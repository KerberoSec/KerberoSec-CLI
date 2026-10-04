# Web Cashes

## Detecting cached responses

During testing, it's crucial that you're able to identify cached responses. To 
do so, look at response headers and response times.

Various response headers may indicate that it is cached. For example:

- The `X-Cache` header provides information about whether a response was served from the cache. Typical values include:
  - `X-Cache`: hit: The response was served from the cache.
  - `X-Cache`: miss: The cache did not contain a response for the request's key, so it was fetched from the origin server. In most cases, the response is then cached. To confirm this, send the request again to see whether the value updates to hit.
  - `X-Cache`: dynamic: The origin server dynamically generated the content. Generally this means the response is not suitable for caching.
  - `X-Cache`: refresh: The cached content was outdated and needed to be refreshed or revalidated.

The `Cache-Control` header may include a directive that indicates caching, like
public with a max-age higher than 0. Note that this only suggests that the
resource is cacheable. It isn't always indicative of caching, as the cache may
sometimes override this header.

