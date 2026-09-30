# CDNio

From `entrypoint.sh`, we see that the goal is to exfiltrate the admin's API key in the database.
Additionally, we see that there's a bot at `/visit` (`app/blueprints/bot/routes.py`) which we can make visit any page on the same server.

In, `app/blueprints/main/routes.py`, we have and endpoint that returns user info (includng the API key) and a regex with an intriguing comment.

```python
@main_bp.route('/<path:subpath>', methods=['GET'])
@jwt_required
def profile(subpath):
    
    if re.match(r'.*^profile', subpath): # Django perfection
        # SNIP
    else:
        return jsonify({"error": "No match"}), 404
```

In `nginx.conf`, we see a cache policy.

```
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    ...
}
```

As the python code only matches the start of the path, and the nginx config only matches the extension at the end, we can abuse a path that matches both: `/profile.css`.

The full cache exploit is as follows:

1. We use `/visit` to make the bot visit `/profile.css` using its admin credentials
2. That result is cached by nginx, and nginx has no authentication on said cache
3. We can visit the same `/profile.css` to see the bot's cached result
