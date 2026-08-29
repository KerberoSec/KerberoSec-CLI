#!/usr/bin/env bash
# ==============================================================================
# KerberoSec — All-In-One Security Toolkit Installer (idempotent)
# ------------------------------------------------------------------------------
# Installs every CLI-runnable tool across:
#   • Bug Bounty / Web (recon, subdomain, URL, param, XSS, SQLi, SSRF, JWT...)
#   • Network Pentesting (scanning, service enum, Wi-Fi, BLE, pivoting, DB...)
#   • Azure AD / Microsoft Entra ID (ROADtools, AzureHound, CloudFox, ...)
#   • Cloud audit (AWS/Azure/GCP SDKs, ScoutSuite, Prowler, Pacu, trufflehog...)
# Also installs wordlists (SecLists, rockyou, dirb, FuzzDB, Assetnote...).
#
# Safe to re-run: every tool is only installed if it is NOT already present.
# Usage:
#   ./tools.sh                 # install & configure EVERYTHING (default: all)
#   bash tools.sh all          # same as above
#   bash tools.sh apt          # only apt-installable tools
#   bash tools.sh python       # only pip/pipx/python tools
#   bash tools.sh go           # only Go tools
#   bash tools.sh bin          # only prebuilt binaries
#   bash tools.sh git          # only git-cloned tools (into ~/Tools)
#   bash tools.sh more         # only CTF/RE/hardware/containers/misc tools
#   bash tools.sh azure        # only Azure AD / cloud audit tools
#   bash tools.sh wordlists    # only wordlists
#   bash tools.sh toolchains   # only language runtimes (rust/go/py/java/docker)
#
# Tools that fit in /usr/bin (or /usr/local/bin, already on PATH) are placed
# there. Anything else (git clones, downloaded wordlists, pwndbg, foundry, etc.)
# is placed under ~/Tools and added to PATH automatically.
#
# LEGAL / ETHICS NOTICE
#   These are offensive/defensive security tools. Use ONLY against systems,
#   networks, and tenants you own or are explicitly authorized to test.
#   Unauthorized use may be illegal in your jurisdiction.
# ==============================================================================
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
export PIP_BREAK_SYSTEM_PACKAGES=1
export PATH="$HOME/.local/bin:/root/go/bin:/usr/local/go/bin:$HOME/.cargo/bin:${PATH}"
export GOPATH="${GOPATH:-$HOME/go}"
# Folder for tools that cannot be installed into /usr/bin (git clones, etc.)
export TOOLS_DIR="${TOOLS_DIR:-$HOME/Tools}"
mkdir -p "$TOOLS_DIR" "$TOOLS_DIR/bin" 2>/dev/null || true
export PATH="$TOOLS_DIR/bin:${PATH}"

# --- tiny helpers -------------------------------------------------------------
say()  { printf '\n\033[1;36m[ KERBEROSEC ]\033[0m %s\n' "$*"; }
info() { printf '  \033[1;32m[info]\033[0m  %s\n' "$*"; }
warn() { printf '  \033[1;33m[warn]\033[0m  %s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

# ensure_bin <name> <install-callback...>: run callback only if <name> missing
ensure_bin() {
  local name="$1"; shift
  if have "$name"; then info "$name: already installed"; return 0; fi
  info "installing $name ..."
  if "$@"; then info "$name: OK"; else warn "$name: INSTALL FAILED (continuing)"; fi
}

apt_install() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq || true
  # Install each package independently so a single bad/invalid name for this
  # distribution release cannot abort the whole batch.
  local pkg ok=0 fail=0
  for pkg in "$@"; do
    if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$pkg" >/dev/null 2>&1; then
      ok=$((ok+1))
    else
      warn "apt: '$pkg' could not be installed (skipping)"; fail=$((fail+1))
    fi
  done
  info "apt: $ok installed, $fail skipped"
}

pipx_install() { local n="$1"; ensure_bin "$n" pipx install "$n"; }
pip_install()  { pip3 install --no-cache-dir --quiet "$@" \
                    || warn "pip install failed: $* (continuing)"; }

go_install() {
  local pkg="$1"; local name="${2:-$(basename "$pkg")}"
  ensure_bin "$name" go install -v "${pkg}@latest"
}

git_clone() { # <dest> <url> : shallow clone into /opt if not present
  local dir="$1" url="$2"
  if [ -d "$dir" ]; then info "git: $dir already present"; return 0; fi
  info "git clone -> $dir"
  git clone --depth 1 "$url" "$dir" 2>/dev/null || warn "git clone $url FAILED"
}

# ==============================================================================
# SECTION: Toolchains / lang runtimes — so a fresh machine has everything needed
# to *build* the tools too (python, go, rust/cargo, node, java, docker, powershell).
# ==============================================================================
cmd_toolchains() {
  say "=== ensuring base toolchains / runtimes ==="

  # Python, Go, Node, Ruby via apt (already common, just guarantee)
  apt_install python3 python3-pip python3-venv python3-dev pipx \
    golang-go nodejs npm ruby ruby-dev \
    build-essential make cmake pkg-config \
    libssl-dev libpcap-dev libffi-dev zlib1g-dev \
    git curl wget unzip zip tar jq || true

  # Rust toolchain (rustup + cargo) — needed for rust-based tools
  if ! have cargo; then
    info "installing Rust toolchain via rustup ..."
    curl -sSf https://sh.rustup.rs -o /tmp/rustup.sh && \
      sh /tmp/rustup.sh -y --profile default --no-modify-path 2>/dev/null \
      || warn "rustup install failed (some rust tools will be skipped)"
  else
    info "cargo: already installed"
  fi
  # make `cargo`/`rustc` available even if rustup wrote to a non-deprecated path
  if [ -d "$HOME/.cargo/bin" ]; then
    export PATH="$HOME/.cargo/bin:${PATH}"
  fi

  # Java (needed for jadx / mobsf / stegsolve / ghidra at runtime)
  if ! have java; then
    apt_install default-jdk-headless || warn "java install failed"
  else info "java: already installed"; fi

  # Docker CLI + Compose (for container/registry tooling). Full docker daemon
  # requires privileged/host setup; here we at least guarantee the CLIs.
  if ! have docker; then
    apt_install docker.io || warn "docker.io install failed"
  else info "docker: already installed"; fi
  if ! have docker-compose; then
    apt_install docker-compose docker-compose-v2 2>/dev/null || true
  fi

  # PowerShell (pwsh) — enables AD/Entra PowerShell modules & windows-adjacent tools
  if ! have pwsh; then
    apt_install powershell || warn "powershell install failed (AADInternals/PowerZure need it)"
  else info "pwsh: already installed"; fi
}

# ==============================================================================
# SECTION: apt-installable tools (Kali/Debian). Already-present packages are a
# no-op for apt, so this is safe to re-run. The Dockerfile pre-installs the
# heavy Kali *metapackages* separately for build caching.
# ==============================================================================
cmd_apt() {
  say "=== installing apt packages ==="
  apt_install \
    whois dnsutils dnsenum dnsrecon fierce dnsmasq \
    net-tools iproute2 iputils-ping iputils-tracepath netcat-openbsd socat tcpdump \
    nmap masscan zmap unicornscan hping3 arp-scan fping netdiscover nbtscan \
    tshark ngrep \
    zeek suricata \
    bettercap ettercap-text-only mitmproxy dsniff macchanger \
    aircrack-ng wifite kismet reaver bully pixiewps fern-wifi-cracker wifiphisher \
    hcxtools hcxdumptool \
    bluez bluetooth ubertooth \
    snmp snmpd snmp-mibs-downloader onesixtyone \
    smbclient smbmap impacket-scripts enum4linux-ng ldap-utils ldapdomaindump \
    rpcclient rpcbind rpcdump samrdump \
    ssh sshpass ssh-audit sshuttle hydra medusa ncrack crowbar brutehash \
    cracklib-runtime hashcat john cewl crunch cupp pipal rsmangler hashid \
    gobuster dirb wfuzz ffuf feroxbuster nikto wpscan sqlmap dirsearch \
    commix metasploit-framework exploitdb searchsploit \
    zaproxy burpsuite maltego recon-ng spiderfoot theharvester \
    dotdotpwn routersploit beef-xss \
    proxychains4 macchanger \
    exiftool imagemagick yara clamav binwalk foremost scalpel bulk-extractor \
    sleuthkit autopsy volatility3 \
    stegseek steghide outguess zsteg \
    radare2 ghidra qemu-user firmware-mod-kit binwalk \
    swaks smtp-user-enum sipvicious sipsak sipp \
    tcpreplay packeth ostinato mausezahn netsniff-ng \
    kubectl \
    ripgrep fzf bat yq \
    jq curl wget git zip unzip tar file \
    python3 python3-pip python3-venv python3-dev pipx \
    golang-go ruby ruby-dev nodejs npm \
    build-essential libpcap-dev libssl-dev libxml2-utils libffi-dev \
    vim nano tmux screen htop \
    openvpn wireguard strongswan ike-scan xfreerdp \
    redis-tools default-mysql-client postgresql-client sqlite3 \
    tftp tftpd-hpa || true
}

# ==============================================================================
# SECTION: Python / pip / pipx tools
# ==============================================================================
cmd_python() {
  say "=== installing python/pipx tools ==="
  pipx ensurepath || true

  # OSINT / recon
  for p in shodan censys sherlock-project instaloader finalrecon \
           subbrute dnsgen arjun paramspider waymore \
           maigret holehe epieos gallery-dl yt-dlp updog; do
    pipx_install "$p"
  done

  # Active Directory / Entra (pip/pipx CLIs)
  for p in certipy-ad bloodyAD ldeep adidnsdump coercer pre2k pywerview \
           username-anarchy; do
    pipx_install "$p" || true
  done

  # cloud audit
  for p in scoutsuite prowler penelope cloud_enum checkov; do
    pipx_install "$p" || true
  done

  # web / API helpers available on PyPI as CLIs
  pip_install uro 2>/dev/null || true
  pip_install semgrep 2>/dev/null || true
  pip_install detect-secrets 2>/dev/null || true
  pip_install trufflehog 2>/dev/null || true
  pip_install ghauri 2>/dev/null || true
  pip_install sstimap 2>/dev/null || true
  pip_install jwt 2>/dev/null || true
  pip_install sslyze 2>/dev/null || true
  pip_install wafw00f 2>/dev/null || true
  pip_install graphql-cop 2>/dev/null || true
  pip_install graphw00f 2>/dev/null || true
  pip_install oletools 2>/dev/null || true
  pip_install packer 2>/dev/null || true
  pip_install s3-inspector 2>/dev/null || true
  pip_install scapy 2>/dev/null || true

  # Ruby gem stego helper
  if have gem && ! have zsteg; then
    gem install --no-document zsteg >/dev/null 2>&1 && info "zsteg installed" || true
  fi
}
# ==============================================================================
# SECTION: Go tools (projectdiscovery ecosystem + recon/url/param web tooling)
# ==============================================================================
cmd_go() {
  say "=== installing Go (golang) pkg tools ==="
  export GOPATH="${GOPATH:-$HOME/go}"
  mkdir -p "$GOPATH/bin"

  # ProjectDiscovery subdomain/DNS/HTTP suite
  go_install  github.com/projectdiscovery/subfinder/v2/cmd/subfinder   subfinder
  go_install  github.com/projectdiscovery/dnsx/cmd/dnsx                 dnsx
  go_install  github.com/projectdiscovery/httpx/cmd/httpx               httpx
  go_install  github.com/projectdiscovery/naabu/v2/cmd/naabu            naabu
  go_install  github.com/projectdiscovery/katana/cmd/katana             katana
  go_install  github.com/projectdiscovery/nuclei/v3/cmd/nuclei          nuclei
  go_install  github.com/projectdiscovery/interactsh/cmd/interactsh-client  interactsh-client
  go_install  github.com/projectdiscovery/alterx/cmd/alterx             alterx
  go_install  github.com/projectdiscovery/uncover/cmd/uncover           uncover
  go_install  github.com/projectdiscovery/tlsx/cmd/tlsx                 tlsx
  go_install  github.com/projectdiscovery/mapcidr/cmd/mapcidr           mapcidr
  go_install  github.com/projectdiscovery/asnmap/cmd/asnmap             asnmap
  go_install  github.com/projectdiscovery/urlfinder/cmd/urlfinder       urlfinder

  # Asset discovery / subdomain enumeration / wordmanipulation
  go_install  github.com/tomnomnom/assetfinder                          assetfinder
  go_install  github.com/tomnomnom/waybackurls                          waybackurls
  go_install  github.com/tomnomnom/httprobe                             httprobe
  go_install  github.com/tomnomnom/unfurl                               unfurl
  go_install  github.com/tomnomnom/qsreplace                            qsreplace
  go_install  github.com/tomnomnom/gf                                  gf
  go_install  github.com/lc/gau/v2/cmd/gau                              gau
  go_install  github.com/hakluke/hakrawler                              hakrawler
  go_install  github.com/jaeles-project/gospider                        gospider
  go_install  github.com/hahwul/dalfox/v2                                dalfox
  go_install  github.com/KathanP19/Gxss                                 Gxss
  go_install  github.com/Emoe/kxss                                      kxss
  go_install  github.com/rix4uni/kyxss                                   kyxss
  go_install  github.com/sh1gure/pp                            pp-finder
  go_install  github.com/ffuf/pencode                                 pencode
  go_install  github.com/d3mondev/puredns/v2                           puredns
  go_install  github.com/Sh1Yo/x8                                      x8
  go_install  github.com/zer0day/gitrob/v2                             gitrob

  # amass (proper, via go build)
  if ! have amass; then
    info "installing amass ..."
    go install -v github.com/owasp-amass/amass/v4/...@latest 2>/dev/null \
      || go install -v github.com/owasp-amass/amass/v3/...@latest 2>/dev/null \
      || warn "amass go install failed"
  else
    info "amass: already installed"
  fi

  # Fast recon / asset discovery (extra)
  go_install  github.com/tomnomnom/meg                               meg
  go_install  github.com/arkadiyt/chaos-client/cmd/chaos-client       chaos-client
  go_install  github.com/cgboal/sonarsearch/cmd/crobat                 crobat
  # JS / secrets / source analysis
  go_install  github.com/lc/subjs                                   subjs
  go_install  github.com/ecnepsnai/jsluice/cmd/jsluice              jsluice
  go_install  github.com/zricethezav/gitleaks/v8/cmd/gitleaks       gitleaks 2>/dev/null || true
  # Host / infra scanning
  go_install  github.com/projectdiscovery/naabu/v2/cmd/naabu           naabu 2>/dev/null || true
  # cloud / K8s / infra
  go_install  github.com/aquasecurity/tfsec/cmd/tfsec                 tfsec 2>/dev/null || true
  go_install  github.com/Checkmarx/kics/v2/cmd/kics                   kics 2>/dev/null || true
  go_install  github.com/Shopify/kubeaudit/cmd/kubeaudit              kubeaudit 2>/dev/null || true
}

# ==============================================================================
# SECTION: prebuilt binaries + Go binary tools w/o pkg install convenience
# ==============================================================================
cmd_bin() {
  say "=== installing standalone/prebuilt binaries ==="
  local tmp; tmp="$(mktemp -d)"

  # kerbrute (AD Kerberos brute)
  ensure_bin kerbrute bash -c 'curl -sL https://github.com/ropnop/kerbrute/releases/latest/download/kerbrute_linux_amd64 -o /usr/local/bin/kerbrute && chmod +x /usr/local/bin/kerbrute'

  # cloudfox (cloud context enumeration, extracts from zip)
  ensure_bin cloudfox bash -c '
    curl -sL https://github.com/BishopFox/cloudfox/releases/latest/download/cloudfox_linux_amd64.zip -o /tmp/cloudfox.zip && \
    unzip -q -o /tmp/cloudfox.zip -d /tmp/cloudfox_dir && \
    (mv /tmp/cloudfox_dir/cloudfox /usr/local/bin/cloudfox 2>/dev/null || mv /tmp/cloudfox_dir/*/cloudfox /usr/local/bin/cloudfox 2>/dev/null || true) && \
    chmod +x /usr/local/bin/cloudfox 2>/dev/null && rm -rf /tmp/cloudfox.zip /tmp/cloudfox_dir'

  # azurehound (Entra ID attack-path mapping, extracts from zip/tar)
  ensure_bin azurehound bash -c '
    url=$(curl -sL https://api.github.com/repos/BloodHoundAD/AzureHound/releases/latest 2>/dev/null | grep -oE "https://[^\"]*AzureHound.*linux_amd64[^\"]*" | head -1 || true)
    if [ -n "$url" ]; then
      curl -sL "$url" -o /tmp/azurehound_pkg
      if file /tmp/azurehound_pkg | grep -qi "Zip"; then
        unzip -q -o /tmp/azurehound_pkg -d /tmp/azurehound_dir
        (mv /tmp/azurehound_dir/azurehound /usr/local/bin/azurehound 2>/dev/null || mv /tmp/azurehound_dir/*/azurehound /usr/local/bin/azurehound 2>/dev/null || true)
      else
        tar -xzf /tmp/azurehound_pkg -C /tmp 2>/dev/null || mv /tmp/azurehound_pkg /usr/local/bin/azurehound
      fi
      chmod +x /usr/local/bin/azurehound 2>/dev/null || true
      rm -rf /tmp/azurehound_pkg /tmp/azurehound_dir
    fi'

  # findomain (OSINT subdomains via many APIs)
  ensure_bin findomain bash -c '
    curl -sL https://github.com/findomain/findomain/releases/latest/download/findomain-linux.zip -o /tmp/findomain.zip 2>/dev/null && \
    unzip -q -o /tmp/findomain.zip -d /usr/local/bin/ 2>/dev/null && chmod +x /usr/local/bin/findomain 2>/dev/null && rm -f /tmp/findomain.zip || \
    (curl -sL https://github.com/findomain/findomain/releases/latest/download/findomain-linux -o /usr/local/bin/findomain && chmod +x /usr/local/bin/findomain)'

  # rustscan (ultra-fast port scanner, rust)
  ensure_bin rustscan bash -c 'curl -sL https://github.com/bee-san/RustScan/releases/latest/download/rustscan_amd64.deb -o /tmp/rustscan.deb && dpkg -i /tmp/rustscan.deb >/dev/null 2>&1 || cargo install rustscan 2>/dev/null || true'

  # ollama (local LLM, ties into the CLI OLLAMA_HOST)
  if ! have ollama; then
    info "installing ollama ..."
    curl -fsSL https://ollama.com/install.sh | sh >/dev/null 2>&1 || warn "ollama install failed"
  else info "ollama: already installed"; fi

  # cloudflared / ngrok tunnelling (OOB / C2 callbacks)
  ensure_bin cloudflared bash -c 'curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared'
  ensure_bin ngrok bash -c 'curl -sL https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.tgz -o /tmp/ngrok.tgz && tar -xzf /tmp/ngrok.tgz -C /usr/local/bin && chmod +x /usr/local/bin/ngrok'

  # codeql (GitHub code analysis engine — heavy, best-effort)
  if ! have codeql; then
    info "installing codeql ..."
    curl -sL "https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-linux64.zip" -o /tmp/codeql.zip \
      && unzip -q /tmp/codeql.zip -d "$TOOLS_DIR" && ln -sf "$TOOLS_DIR"/codeql*/codeql /usr/local/bin/codeql 2>/dev/null \
      || warn "codeql install failed"
  else info "codeql: already installed"; fi

  # kubernetes control-plane + security scanners
  if ! have kubectl; then
    info "installing kubectl ..."
    k8s_ver=$(curl -sL https://dl.k8s.io/release/stable.txt 2>/dev/null || echo "v1.31.0")
    curl -sL "https://dl.k8s.io/release/${k8s_ver}/bin/linux/amd64/kubectl" \
      -o /usr/local/bin/kubectl && chmod +x /usr/local/bin/kubectl \
      || warn "kubectl install failed"
  else info "kubectl: already installed"; fi
  ensure_bin kube-bench bash -c 'curl -sL https://github.com/aquasecurity/kube-bench/releases/download/v0.6.19/kube-bench_0.6.19_linux_amd64.deb -o /tmp/kube-bench.deb && dpkg -i /tmp/kube-bench.deb >/dev/null 2>&1'
  ensure_bin kube-hunter bash -c 'pipx install kube-hunter 2>/dev/null || true'

  rm -rf "$tmp"
}
# ==============================================================================
# SECTION: git-cloned offensive/research tooling (into ~/Tools)
# ==============================================================================
cmd_git() {
  say "=== installing git-cloned tools ==="
  local opt="$TOOLS_DIR"

  # Web / param / SSRF / LFI / XSS / SQL
  git_clone "$opt/XXEinjector"    https://github.com/enjoiz/XXEinjector.git
  git_clone "$opt/SSRFmap"        https://github.com/swisskyrepo/SSRFmap.git
  git_clone "$opt/XSStrike"       https://github.com/s0md3v/XSStrike.git
  git_clone "$opt/NoSQLMap"       https://github.com/codingo/NoSQLMap.git
  git_clone "$opt/LFISuite"       https://github.com/D35m0nd142/LFISuite.git
  git_clone "$opt/Gopherus"       https://github.com/tarunkant/Gopherus.git
  git_clone "$opt/smuggler"       https://github.com/defparam/smuggler.git
  git_clone "$opt/h2csmuggler"    https://github.com/BishopFox/h2csmuggler.git
  git_clone "$opt/ParamSpider"    https://github.com/devanshbatham/ParamSpider.git
  git_clone "$opt/SecretFinder"   https://github.com/m4ll0k/SecretFinder.git
  git_clone "$opt/JSFinder"       https://github.com/Threezh1/JSFinder.git
  git_clone "$opt/urlfinder"      https://github.com/projectdiscovery/urlfinder.git
  git_clone "$opt/Kiterunner"     https://github.com/assetnote/kiterunner.git

  # XSS / helper
  git_clone "$opt/BruteXSS"       https://github.com/bartekl1/BruteXSS.git
  git_clone "$opt/Gxss"           https://github.com/KathanP19/Gxss.git

  # Deserialization / Java
  git_clone "$opt/ysoserial"      https://github.com/frohoff/ysoserial.git
  git_clone "$opt/marshalsec"     https://github.com/mbechler/marshalsec.git
  git_clone "$opt/phpggc"         https://github.com/ambionics/phpggc.git
  git_clone "$opt/JNDI-Injection-Exploit" https://github.com/welk1n/JNDI-Injection-Exploit.git

  # Fuzzing / protocol
  git_clone "$opt/boofuzz"        https://github.com/jtpereyda/boofuzz.git
  git_clone "$opt/Sulley"         https://github.com/OpenRCE/sulley.git
  git_clone "$opt/SPIKE"          https://github.com/guilherme-ferreira/SPIKE.git
  git_clone "$opt/tcpprox"        https://github.com/robertdavidgraham/tcpreplay.git

  # Repos / GitHub dorking / secret&repo
  git_clone "$opt/GitTools"       https://github.com/internetwache/GitTools.git
  git_clone "$opt/GitHacker"      https://github.com/WangYihang/GitHacker.git
  git_clone "$opt/GitDorker"      https://github.com/obheda12/GitDorker.git
  git_clone "$opt/GitGot"         https://github.com/BishopFox/GitGot.git
  git_clone "$opt/octosuite"      https://github.com/rly0nheart/octosuite.git
  git_clone "$opt/DumpsterDiver"  https://github.com/securing/DumpsterDiver.git
  git_clone "$opt/shhgit"         https://github.com/eth0izzle/shhgit.git

  # Password / AD / spray
  git_clone "$opt/SprayingToolkit" https://github.com/byt3bl33d3r/SprayingToolkit.git
  git_clone "$opt/BruteX"          https://github.com/1N3/BruteX.git
  git_clone "$opt/ssb"             https://github.com/killswitch-GUI/SimplyDomainName-Grabber-ssb.git
  git_clone "$opt/kerbrute"        https://github.com/ropnop/kerbrute.git

  # OSINT
  git_clone "$opt/Osintgram"       https://github.com/Datalux/Osintgram.git
  git_clone "$opt/Photon"          https://github.com/s0md3v/Photon.git
  git_clone "$opt/recon-ng"        https://github.com/lanmaster53/recon-ng.git
  git_clone "$opt/ReconFTW"        https://github.com/six2dez/reconftw.git
  git_clone "$opt/sn1per"          https://github.com/1N3/Sn1per.git
  git_clone "$opt/FinalRecon"      https://github.com/thewhiteh4t/FinalRecon.git

  # Exploitation / frameworks
  git_clone "$opt/PowerSploit"     https://github.com/PowerShellMafia/PowerSploit.git
  git_clone "$opt/routersploit"    https://github.com/threat9/routersploit.git
  git_clone "$opt/fsociety"        https://github.com/Manisso/fsociety.git
  git_clone "$opt/Empire"          https://github.com/BC-SECURITY/Empire.git

  # Cloud
  git_clone "$opt/cloud_enum"      https://github.com/initstring/cloud_enum.git
  git_clone "$opt/CloudBrute"      https://github.com/0xsha/CloudBrute.git
  git_clone "$opt/ScoutSuite"      https://github.com/nccgroup/ScoutSuite.git
  git_clone "$opt/prowler"         https://github.com/prowler-cloud/prowler.git
  git_clone "$opt/pacu"            https://github.com/RhinoSecurityLabs/pacu.git
  git_clone "$opt/enumerate-iam"   https://github.com/andresriancho/enumerate-iam.git
  git_clone "$opt/trufflehog"      https://github.com/trufflesecurity/trufflehog.git
  git_clone "$opt/S3Scanner"       https://github.com/sa7mon/S3Scanner.git
  git_clone "$opt/S3Recon"         https://github.com/bomberfish/S3Recon.git
  git_clone "$opt/GCPBucketBrute"  https://github.com/rhinosecuritylabs/GCPBucketBrute.git

  # JWT
  git_clone "$opt/jwt_tool"        https://github.com/ticarpi/jwt_tool.git

  # Extra high-value tooling (bug-bounty research, AD/cloud, tunnels)
  git_clone "$opt/jok3r"           https://github.com/koutto/jok3r.git
  git_clone "$opt/turbo-intruder"  https://github.com/PortSwigger/turbo-intruder.git
  git_clone "$opt/oneforall"       https://github.com/shmilylty/OneForAll.git
  git_clone "$opt/fluxion"         https://github.com/FluxionNetwork/fluxion.git
  git_clone "$opt/wifi-pumpkin"    https://github.com/P0cL4bs/wifipumpkin3.git
  git_clone "$opt/KnowsMore"       https://github.com/skelsec/KnowsMore.git
  git_clone "$opt/GraphRunner"     https://github.com/dafthack/GraphRunner.git
  git_clone "$opt/Spray365"        https://github.com/VectorSecGroup/Spray365.git
  git_clone "$opt/MFAAttacker"     https://github.com/securityjoes/MFAAttacker.git
  git_clone "$opt/Bucket Finder"   https://github.com/kromtech/S3-AWS-Bucket.git
  git_clone "$opt/firmwalker"      https://github.com/craigz28/firmwalker.git
  git_clone "$opt/scannerl"        https://github.com/kudelskisecurity/scannerl.git
  # Kubernetes security
  git_clone "$opt/kube-hunter"     https://github.com/aquasecurity/kube-hunter.git
  git_clone "$opt/kube-bench"      https://github.com/aquasecurity/kube-bench.git

  # Mesos / infra
  git_clone "$opt/lostserver"      https://github.com/ihor-sokoliuk/lostserver.git

  # helpers
  git_clone "$opt/PayloadsAllTheThings" https://github.com/swisskyrepo/PayloadsAllTheThings.git
  git_clone "$opt/HackTricks"      https://github.com/HackTricks-wiki/HackTricks.git

  # best-effort python requirements for cloned repos
  for d in "$opt/SSRFmap" "$opt/XSStrike" "$opt/NoSQLMap" "$opt/Osintgram" \
           "$opt/Photon" "$opt/SecretFinder" "$opt/JSFinder" "$opt/LFISuite" \
           "$opt/S3Scanner" "$opt/boofuzz" "$opt/jwt_tool" "$opt/paramspider" \
           "$opt/OneForAll" "$opt/KnowsMore" "$opt/wifi-pumpkin" \
           "$opt/fluxion" "$opt/scannerl" "$opt/jok3r"; do
    if [ -f "$d/requirements.txt" ]; then
      info "installing python reqs for $(basename "$d")"
      pip3 install --no-cache-dir --quiet -r "$d/requirements.txt" \
        >/dev/null 2>&1 || warn "could not fully install reqs for $d"
    fi
  done
}
# ==============================================================================
# SECTION: Broad "everything else" — CTF, forensics, pwn/RE, crypto, stego,
# audio/video, mobile, SDR/hardware/CAN, containers/k8s, blockchain, malware,
# AI/LLM, databases, encoding. Also installs the extra apt pool for these.
# ==============================================================================
cmd_more() {
  say "=== installing broad CTF / forensics / RE / hardware / containers / misc ==="

  # --- apt pool (each name individually tolerated) ---
  apt_install \
    gdb gdb-multiarch strace ltrace patchelf file hexedit htop \
    libc6-dbg \
    testdisk dc3dd dcfldd extundelete hashdeep md5deep \
    p7zip-full cabextract unrar-free libarchive-tools zbar-tools qrencode openssl \
    sox ffmpeg libsox-fmt-all \
    rtl-sdr hackrf gqrx gnuradio gr-osmosdr qemu-system-x86 \
    can-utils i2c-tools minicom picocom sigrok-cli flashrom openocd avrdude \
    stlink-tools spi-tools usbutils \
    android-tools-adb android-tools-fastboot apktool jadx \
    libimobiledevice-utils ideviceinstaller usbmuxd libplist-utils \
    docker.io docker-compose podman buildah skopeo \
    mariadb-client sqlite3 redis-tools default-mysql-client postgresql-client \
    pev \
    php-cli perl lua5.4 maven \
    hashcat-utils maskprocessor princeprocessor kwprocessor \
    snort tcpdump tshark ngrep \
    dhcpdump tftp socat || true

  # --- CTF / pwn / binary exploitation (pip) ---
  pip_install pwntools ropper ROPgadget capstone unicorn z3-solver \
    angr \
    2>/dev/null || true

  # --- pwn dbg helpers (gdb plugins) ---
  if [ ! -d "$TOOLS_DIR/pwndbg" ]; then
    git clone --depth 1 https://github.com/pwndbg/pwndbg.git "$TOOLS_DIR/pwndbg" 2>/dev/null \
      && (cd "$TOOLS_DIR/pwndbg" && ./setup.sh >/dev/null 2>&1 || true) || warn "pwndbg clone failed"
  fi
  if [ ! -f /root/.gdbinit-gef.py ] && ! have gef; then
    curl -sL https://github.com/hugsy/gef/raw/master/gef.py -o /root/.gdbinit-gef.py \
      && echo "source /root/.gdbinit-gef.py" > /root/.gdbinit 2>/dev/null || true
  fi
  # one_gadget (ruby)
  if ! have one_gadget && have gem; then
    gem install --no-document one_gadget >/dev/null 2>&1 || true
  fi

  # --- crypto / encoding ---
  pip_install pycryptodome base58 xortool 2>/dev/null || true

  # --- stego (extra) ---
  for pst in stegano stegcracker; do pipx_install "$pst" || true; done

  # --- audio / video ---
  # (sox/ffmpeg from apt above)

  # --- mobile / Android / iOS ---
  for pm in frida-tools objection androguard apkleaks apkid; do
    pipx_install "$pm" || true
  done

  # --- forensics (extra beyond Kali metas: autopsy/volatility/sleuthkit/binwalk) ---
  for pf in plaso dfimagetools pyhindsight python-registry capstone pypykatz; do
    pip_install "$pf" 2>/dev/null || true
  done
  git_clone "$TOOLS_DIR/regripper" https://github.com/keydet89/RegRipper3.0.git

  # --- SDR / RF ---
  pip_install urh 2>/dev/null || true
  # (rtl-sdr/hackrf/gqrx/gnuradio from apt above)

  # --- LINUX / WINDOWS internal & dynamic analysis ---
  apt_install coreutils binutils elfutils ltrace strace gdb xxd 2>/dev/null || true
  pip_install pefile lief vivisect miasm malduck 2>/dev/null || true

  # --- Automotive / CAN ---
  pip_install python-can caringcaribou 2>/dev/null || true

  # --- Blockchain / Web3 (best-effort) ---
  pip_install slither-analyzer web3 mythril 2>/dev/null || true
  # foundry (cast/forge) binary
  if ! have cast; then
    curl -sL https://foundry.paradigm.xyz -o /tmp/foundry.sh 2>/dev/null \
      && bash /tmp/foundry.sh 2>/dev/null \
      && "$HOME/.foundry/bin/foundryup" 2>/dev/null || warn "foundry install failed"
  fi
  export PATH="$HOME/.foundry/bin:${PATH}"

  # --- AI / LLM (python libs; llama/ollama binary handled in cmd_bin) ---
  pip_install transformers sentencepiece tokenizers 2>/dev/null || true

  # --- Containers / registry (go + bin) ---
  go_install github.com/wagoodman/dive                              dive 2>/dev/null || true
  go_install github.com/anchore/syft/cmd/syft                        syft 2>/dev/null || true
  go_install github.com/anchore/grype/cmd/grype                      grype 2>/dev/null || true
  go_install github.com/google/go-containerregistry/cmd/crane        crane 2>/dev/null || true
  ensure_bin hadolint bash -c 'curl -sL https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 -o /usr/local/bin/hadolint && chmod +x /usr/local/bin/hadolint' 2>/dev/null || true
  ensure_bin trivy bash -c 'curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin' 2>/dev/null || true

  # --- Kubernetes extras ---
  go_install github.com/derailed/k9s                       k9s 2>/dev/null || true
  go_install github.com/derailed/popeye                    popeye 2>/dev/null || true
  ensure_bin helm bash -c 'curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash' 2>/dev/null || true
  ensure_bin kubescape bash -c 'curl -sfL https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | /bin/bash' 2>/dev/null || true
  ensure_bin falcoctl bash -c 'curl -fsSL https://falco.org/static/falcoctl-install.sh | bash' 2>/dev/null || true

  # --- Zig (binary) ---
  if ! have zig; then
    curl -sL https://ziglang.org/download/index.json -o /tmp/zig.json 2>/dev/null \
      && python3 -c "import json;print(json.load(open('/tmp/zig.json'))['master']['x86_64-linux']['tarball'])" 2>/dev/null \
      | xargs -I{} curl -sL {} -o /tmp/zig.tar.xz 2>/dev/null \
      && tar -xJf /tmp/zig.tar.xz -C "$TOOLS_DIR" 2>/dev/null \
      && ln -sf "$TOOLS_DIR"/zig-*/zig /usr/local/bin/zig 2>/dev/null || warn "zig install failed"
  fi

  # --- Databases: CLI clients (already partly in apt pool) ---
  # mongosh via dedicated repo is optional/heavy — note but skip by default.

  # --- Password cracking helpers (apt): hashcat-utils, maskprocessor etc. (in pool) ---

  # --- Network / protocol: snort, dhcpdump, tcpdump, tshark (in apt pool) ---

  # Final PATH refresh
  export PATH="$HOME/.cargo/bin:$HOME/.foundry/bin:/root/go/bin:/usr/local/go/bin:${PATH}"
}

# ==============================================================================
# SECTION: Azure AD / Microsoft Entra ID + Cloud audit tooling
# ==============================================================================
cmd_azure() {
  say "=== installing Azure AD / Entra ID / cloud audit tools ==="

  # ROADtools suite (roadrecon / roadtx / roadlib) — the flagship Entra CLI
  if ! have roadrecon; then
    info "installing ROADtools ..."
    pipx install roadtools 2>/dev/null || warn "roadtools pipx install failed"
  else
    info "roadrecon: already installed"
  fi

  # Cloud SDKs (Microsoft's own control-plane CLI)
  if ! have az; then
    info "installing Azure CLI ..."; curl -sL https://aka.ms/InstallAzureCLIDeb | bash || warn "azure cli failed"
  else info "az: already installed"; fi
  if ! have aws; then
    info "installing AWS CLI v2 ..."
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscli.zip \
      && unzip -q -o /tmp/awscli.zip -d /tmp/awscli \
      && /tmp/awscli/aws/install || warn "aws cli failed"
  else info "aws: already installed"; fi
  if ! have gcloud; then
    info "installing Google Cloud SDK ..."
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" >/etc/apt/sources.list.d/google-cloud-sdk.list
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
    apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq google-cloud-cli || warn "gcloud failed"
  else info "gcloud: already installed"; fi

  # AZ PowerShell + AzureAD modules (optional — enables AADInternals/MicroBurst/PowerZure)
  if have pwsh; then
    pwsh -NoProfile -Command "Install-Module AZ -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue" >/dev/null 2>&1 || true
    pwsh -NoProfile -Command "Install-Module AzureAD -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue" >/dev/null 2>&1 || warn "AzureAD module install skipped"
  else
    warn "pwsh not installed — PowerShell/AADInternals/PowerZure/MicroBurst modules skipped (install powershell via apt to enable)"
  fi

  # Entra / cloud recon & audit (Python/pipx CLIs)
  pipx_install scoutsuite || true
  pipx_install prowler    || true
  pipx_install cloud_enum || true
  pip_install stormspotter 2>/dev/null || true

# Entra / Azure AD git-cloned tooling
  git_clone "$TOOLS_DIR/MSOLSpray"    https://github.com/dafthack/MSOLSpray.git
  git_clone "$TOOLS_DIR/o365spray"    https://github.com/0xZDH/o365spray.git
  git_clone "$TOOLS_DIR/TokenTactics" https://github.com/f-blaise/TokenTactics.git
  git_clone "$TOOLS_DIR/AADInternals" https://github.com/Gerenios/AADInternals.git
  git_clone "$TOOLS_DIR/ROADtools"    https://github.com/dirkjanm/ROADtools.git
  git_clone "$TOOLS_DIR/AzureHound"   https://github.com/BloodHoundAD/AzureHound.git
  git_clone "$TOOLS_DIR/BloodHound"   https://github.com/BloodHoundAD/BloodHound.git
  git_clone "$TOOLS_DIR/StormSpotter" https://github.com/Azure/Stormspotter.git
  git_clone "$TOOLS_DIR/cloudfox"     https://github.com/BishopFox/cloudfox.git
  git_clone "$TOOLS_DIR/microburst"   https://github.com/NetSPI/MicroBurst.git
  git_clone "$TOOLS_DIR/PowerZure"    https://github.com/hausec/PowerZure.git

  # Azure Resource enumeration via az cli helper
  if have az; then
    az extension add --name resource-graph -y 2>/dev/null || true
  fi

  # trufflehog via go (secrets) — prefer go install
  if ! have trufflehog; then
    go install -v github.com/trufflesecurity/trufflehog/v3@latest 2>/dev/null || warn "trufflehog go install failed"
  fi
}
# ==============================================================================
# SECTION: Wordlists (SecLists, rockyou, FuzzDB, Assetnote, raft, ...)
# ==============================================================================
cmd_wordlists() {
  say "=== installing / linking wordlists ==="
  local wl=/usr/share/wordlists
  mkdir -p "$wl"

  # rockyou (from Kali 'wordlists' meta package)
  if [ -f "$wl/rockyou.txt.gz" ]; then
    info "rockyou.txt.gz found"
    if [ ! -f "$wl/rockyou.txt" ]; then
      zcat "$wl/rockyou.txt.gz" > "$wl/rockyou.txt" 2>/dev/null && info "extracted rockyou.txt" || true
    fi
  else
    warn "rockyou.txt.gz not present (ensure Kali 'wordlists' package is installed)"
  fi

  # Symlink dirb + seclists into wordlists for convenience
  [ -e /usr/share/dirb/wordlists ] && { ln -sfn /usr/share/dirb/wordlists "$wl/dirb"; info "linked dirb wordlists"; } || true
  [ -e /usr/share/seclists ] && { ln -sfn /usr/share/seclists "$wl/seclists"; info "linked seclists"; } || true

  # FuzzDB (git)
  if [ ! -d "$TOOLS_DIR/FuzzDB" ]; then
    git clone --depth 1 https://github.com/fuzzdb-project/fuzzdb.git "$TOOLS_DIR/FuzzDB" \
      >/dev/null 2>&1 && info "FuzzDB cloned -> $TOOLS_DIR/FuzzDB" || warn "FuzzDB clone failed"
  fi

  # Assetnote wordlists (best-effort, larger lists)
  mkdir -p "$TOOLS_DIR/wordlists/assetnote"
  for f in 2m-subdomains.txt best-dns-wordlist.txt; do
    [ -s "$TOOLS_DIR/wordlists/assetnote/$f" ] || \
      curl -fsSL "https://wordlists-cdn.assetnote.io/data/manual/$f" \
        -o "$TOOLS_DIR/wordlists/assetnote/$f" >/dev/null 2>&1 \
        && info "assetnote: $f" || warn "assetnote $f download failed"
  done

  # raft (dirb-ish) present via dirb package already; document location

  # Extra payload/wordlist convenience links
  [ -d "$TOOLS_DIR/PayloadsAllTheThings" ] && { ln -sfn "$TOOLS_DIR/PayloadsAllTheThings" "$wl/PayloadsAllTheThings"; info "linked PayloadsAllTheThings"; } || true
  [ -d "$TOOLS_DIR/FuzzDB" ] && { ln -sfn "$TOOLS_DIR/FuzzDB" "$wl/FuzzDB"; info "linked FuzzDB"; } || true

  info "wordlists ready: /usr/share/wordlists, /usr/share/seclists, $TOOLS_DIR/FuzzDB, $TOOLS_DIR/wordlists"
}

# ==============================================================================
# main dispatcher
# ==============================================================================
cmd_all() {
  # Toolchains first so rust/cargo/go/java/python/docker exist before tool builds
  cmd_toolchains; cmd_apt; cmd_python; cmd_go; cmd_bin; cmd_git; cmd_more; cmd_azure; cmd_wordlists
}

case "${1:-all}" in
  all)        cmd_all ;;
  apt)        cmd_apt ;;
  python)     cmd_python ;;
  go)         cmd_go ;;
  bin)        cmd_bin ;;
  git)        cmd_git ;;
  more)       cmd_more ;;
  azure)      cmd_azure ;;
  wordlists)  cmd_wordlists ;;
  toolchains) cmd_toolchains ;;
  *) echo "usage: tools.sh [all|apt|python|go|bin|git|more|azure|wordlists|toolchains]" >&2; exit 2 ;;
esac