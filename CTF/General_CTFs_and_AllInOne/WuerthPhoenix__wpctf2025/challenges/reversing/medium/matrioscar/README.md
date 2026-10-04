# Matrioscar

During a penetration test performed by our Red Team, a member stumbled upon a
remote service running on an internal host. They tried connecting to it, and they
found a service that advertises a “OSCO Protocol, Admin Access ONLY, All rights
reserved.” Connecting to the remote service shows a banner and prompt, but any
plain-text input immediately crashes the process. It looks like the program
expects a tightly-formatted, encoded/encrypted payload instead of normal
commands. Fortunately another insecure service allowed your team to download the
binary for offline analysis.

Your task? Reverse the binary’s input handling, craft a valid payload, and make
the service accept it to reveal the secret shell.
