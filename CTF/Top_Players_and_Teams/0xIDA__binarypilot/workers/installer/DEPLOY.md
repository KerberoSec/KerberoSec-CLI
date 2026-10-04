# Deploy

One-time auth:

    npx wrangler login          # opens browser; approve

Deploy:

    cd workers/installer
    npx wrangler deploy

Bind the domain (idempotent, dashboard or CLI):

    # either uncomment the two lines in wrangler.toml and re-deploy:
    #   zone_name = "idor.lol"
    #   routes    = [{ pattern = "idor.lol/*", zone_name = "idor.lol" }]
    # or attach the route in the dashboard.

Test:

    curl -sI https://idor.lol/                  # 200, content-type text/x-shellscript
    curl -sSL https://idor.lol/ | head -10      # first lines of install.sh

The Worker fetches `scripts/install.sh` from GitHub raw at request time with a
60s edge cache, so `git push` to main propagates within a minute.
