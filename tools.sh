#!/usr/bin/env bash
# ==============================================================================
# KerberoSec - All-In-One Security Toolkit Installer (idempotent)
# ------------------------------------------------------------------------------
# Installs every CLI-runnable tool across:
#   * Bug Bounty / Web (recon, subdomain, URL, param, XSS, SQLi, SSRF, JWT...)
#   * Network Pentesting (scanning, service enum, Wi-Fi, BLE, pivoting, DB...)
#   * Azure AD / Microsoft Entra ID (ROADtools, AzureHound, CloudFox, ...)
#   * Cloud audit (AWS/Azure/GCP SDKs, ScoutSuite, Prowler, Pacu, trufflehog...)
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
set -uo pipefail

show_help() {
    cat << 'EOF'
KerberoSec Security Tools Manager

Usage:
  ./tools.sh [command]

Commands:
  all         Install all CLI security tools, wordlists, and runtimes (default)
  check       Fast real-time verification of installed CLI tools (<20ms)
  list        Display complete categorized CLI tool inventory with status (ok/missing)
  apt         Install system package security tools (APT, Pacman, DNF, Zypper, APK, Brew)
  python      Install Python security tools via pipx / pip
  go          Install Go security tools via go install
  bin         Install prebuilt binaries (nuclei, subfinder, httpx, katana, etc.)
  git         Clone and configure standalone CLI tools into $TOOLS_DIR
  more        Install binary analysis, reverse engineering, and CTF CLI tools
  azure       Install Azure AD / Microsoft Entra ID and cloud security tools
  wordlists   Download SecLists, rockyou, and essential fuzzing wordlists
  toolchains  Install language runtimes and build prerequisites (Go, Rust, Node, Python)
  link, sync  Synchronize all installed and built tools into /usr/bin and /usr/local/bin
  --help, -h  Show this help message and exit

Examples:
  ./tools.sh check           # Quickly check which security tools are installed
  ./tools.sh list            # Print full list of cataloged tools
  ./tools.sh link            # Synchronize all security tools into /usr/bin
  ./tools.sh all             # Full installation of all security tools
  ./tools.sh bin             # Fast install of essential prebuilt binaries
EOF
    exit 0
}

case "${1:-}" in
    -h|--help|help)
        show_help
        ;;
esac

export DEBIAN_FRONTEND=noninteractive
export PIP_BREAK_SYSTEM_PACKAGES=1

# Folder for tools that cannot be installed into /usr/bin (git clones, etc.)
export TOOLS_DIR="${TOOLS_DIR:-$HOME/Tools}"
mkdir -p "$TOOLS_DIR" "$TOOLS_DIR/bin" "$HOME/.local/bin" "$HOME/.kubescape/bin" 2>/dev/null || true

# Determine bin directory for standalone executables (writable by user or /usr/local/bin if root)
if [ "$EUID" -eq 0 ] || [ -w /usr/local/bin ]; then
  BIN_INSTALL_DIR="/usr/local/bin"
else
  BIN_INSTALL_DIR="$TOOLS_DIR/bin"
fi
mkdir -p "$BIN_INSTALL_DIR" 2>/dev/null || true

export GOPATH="${GOPATH:-$HOME/go}"
mkdir -p "$GOPATH/bin" 2>/dev/null || true

# Default Python interpreter variables for wrappers
export TOOLS_PYTHON="${TOOLS_PYTHON:-python3}"
export TOOLS_PIP="${TOOLS_PIP:-pip3}"

export PATH="$BIN_INSTALL_DIR:$TOOLS_DIR/bin:$GOPATH/bin:/usr/local/go/bin:$HOME/.local/bin:$HOME/.cargo/bin:$HOME/.foundry/bin:$HOME/.kubescape/bin:/usr/local/bin:/usr/bin:/usr/sbin:/sbin:${PATH}"

# Sudo & OS / Package Manager detection
SUDO=""
if [ "$EUID" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

OS_NAME="$(uname -s 2>/dev/null || echo "Unknown")"
PKG_MGR="none"
case "$OS_NAME" in
  Linux*)
    if command -v apt-get >/dev/null 2>&1; then PKG_MGR="apt";
    elif command -v pacman >/dev/null 2>&1; then PKG_MGR="pacman";
    elif command -v dnf >/dev/null 2>&1; then PKG_MGR="dnf";
    elif command -v yum >/dev/null 2>&1; then PKG_MGR="yum";
    elif command -v zypper >/dev/null 2>&1; then PKG_MGR="zypper";
    elif command -v apk >/dev/null 2>&1; then PKG_MGR="apk";
    elif command -v xbps-install >/dev/null 2>&1; then PKG_MGR="xbps";
    fi
    ;;
  Darwin*)
    PKG_MGR="brew"
    ;;
  CYGWIN*|MINGW*|MSYS*|Windows_NT*)
    if command -v pacman >/dev/null 2>&1; then PKG_MGR="pacman";
    elif command -v winget >/dev/null 2>&1; then PKG_MGR="winget";
    elif command -v choco >/dev/null 2>&1; then PKG_MGR="choco";
    fi
    ;;
  FreeBSD*)
    PKG_MGR="pkg"
    ;;
esac

can_sudo() {
  [ "$EUID" -eq 0 ] || ( [ -n "$SUDO" ] && $SUDO -n true 2>/dev/null )
}
can_apt() { can_sudo; }

# --- tiny helpers -------------------------------------------------------------
say()  { printf '\n\033[1;36m[ KERBEROSEC ]\033[0m %s\n' "$*"; }
info() { printf '  \033[1;32m[info]\033[0m  %s\n' "$*"; }
warn() { printf '  \033[1;33m[warn]\033[0m  %s\n' "$*"; }
have() {
  local cmd
  for cmd in "$@"; do
    if command -v "$cmd" >/dev/null 2>&1; then return 0; fi
    if [ -x "/usr/bin/$cmd" ]; then return 0; fi
    if [ -x "/usr/local/bin/$cmd" ]; then return 0; fi
    if [ -x "$BIN_INSTALL_DIR/$cmd" ]; then return 0; fi
    if [ -x "$TOOLS_DIR/bin/$cmd" ]; then return 0; fi
    if [ -x "$HOME/.local/bin/$cmd" ]; then return 0; fi
    if [ -x "$GOPATH/bin/$cmd" ]; then return 0; fi
    if [ -x "$HOME/go/bin/$cmd" ]; then return 0; fi
    if [ -x "$HOME/.cargo/bin/$cmd" ]; then return 0; fi
    if [ -x "$HOME/.kubescape/bin/$cmd" ]; then return 0; fi
    if [ -x "$HOME/.foundry/bin/$cmd" ]; then return 0; fi
    if [ -x "$TOOLS_DIR/venv/bin/$cmd" ]; then return 0; fi
    if [ -x "/usr/local/go/bin/$cmd" ]; then return 0; fi
  done
  return 1
}

find_tool_bin() {
  local cmd="$1"
  local p
  p="$(command -v "$cmd" 2>/dev/null || true)"
  if [ -n "$p" ] && [ -x "$p" ]; then echo "$p"; return 0; fi
  if [ -x "/usr/bin/$cmd" ]; then echo "/usr/bin/$cmd"; return 0; fi
  if [ -x "/usr/local/bin/$cmd" ]; then echo "/usr/local/bin/$cmd"; return 0; fi
  if [ -x "$BIN_INSTALL_DIR/$cmd" ]; then echo "$BIN_INSTALL_DIR/$cmd"; return 0; fi
  if [ -x "$TOOLS_DIR/bin/$cmd" ]; then echo "$TOOLS_DIR/bin/$cmd"; return 0; fi
  if [ -x "$HOME/.local/bin/$cmd" ]; then echo "$HOME/.local/bin/$cmd"; return 0; fi
  if [ -x "$GOPATH/bin/$cmd" ]; then echo "$GOPATH/bin/$cmd"; return 0; fi
  if [ -x "$HOME/go/bin/$cmd" ]; then echo "$HOME/go/bin/$cmd"; return 0; fi
  if [ -x "$HOME/.cargo/bin/$cmd" ]; then echo "$HOME/.cargo/bin/$cmd"; return 0; fi
  if [ -x "$HOME/.kubescape/bin/$cmd" ]; then echo "$HOME/.kubescape/bin/$cmd"; return 0; fi
  if [ -x "$HOME/.foundry/bin/$cmd" ]; then echo "$HOME/.foundry/bin/$cmd"; return 0; fi
  if [ -x "$TOOLS_DIR/venv/bin/$cmd" ]; then echo "$TOOLS_DIR/venv/bin/$cmd"; return 0; fi
  if [ -x "/usr/local/go/bin/$cmd" ]; then echo "/usr/local/go/bin/$cmd"; return 0; fi
  return 1
}

# Safely install or symlink an executable tool into /usr/bin and /usr/local/bin
link_to_usr_bin() {
  local src="$1"
  local name="${2:-$(basename "$src")}"
  [ -z "$src" ] || [ -z "$name" ] && return 0
  [ ! -e "$src" ] && return 0

  # Never override critical operating system core binaries
  case "$name" in
    bash|sh|dash|systemd|init|login|su|sudo|passwd|ls|cp|mv|rm|cat|grep|sed|awk|tar|gzip|curl|wget|python3|perl|ruby|go|git|systemctl|journalctl|chmod|chown|env)
      return 0
      ;;
  esac

  # Skip non-Linux files and completion scripts
  case "$name" in
    *.cmd|*.bat|*.ps1|*_completer*|activate*)
      return 0
      ;;
  esac

  # Avoid self-referential linking
  if [ "$src" = "/usr/bin/$name" ]; then
    return 0
  fi

  # Ensure executable permission on source
  chmod +x "$src" 2>/dev/null || true

  # Ensure also present in TOOLS_DIR/bin
  if [ -d "$TOOLS_DIR/bin" ] && [ "$src" != "$TOOLS_DIR/bin/$name" ] && [ ! -f "$TOOLS_DIR/bin/$name" ]; then
    ln -sf "$src" "$TOOLS_DIR/bin/$name" 2>/dev/null || true
  fi

  # Attempt linking to /usr/local/bin if not existing regular file
  if [ "$src" != "/usr/local/bin/$name" ]; then
    if [ ! -f "/usr/local/bin/$name" ] || [ -L "/usr/local/bin/$name" ]; then
      if [ -w /usr/local/bin ] || [ "$EUID" -eq 0 ]; then
        ln -sf "$src" "/usr/local/bin/$name" 2>/dev/null || true
      elif can_sudo; then
        $SUDO ln -sf "$src" "/usr/local/bin/$name" 2>/dev/null || true
      fi
    fi
  fi

  # Attempt linking to /usr/bin as requested if not existing regular file
  if [ ! -f "/usr/bin/$name" ] || [ -L "/usr/bin/$name" ]; then
    if [ -w /usr/bin ] || [ "$EUID" -eq 0 ]; then
      ln -sf "$src" "/usr/bin/$name" 2>/dev/null || true
    elif can_sudo; then
      $SUDO ln -sf "$src" "/usr/bin/$name" 2>/dev/null || true
    fi
  fi
}

# ensure_bin <name> <install-callback...>: run callback only if <name> missing
ensure_bin() {
  local name="$1"; shift
  if have "$name"; then
    info "$name: already installed"
    local existing_bin
    existing_bin="$(find_tool_bin "$name")"
    [ -n "$existing_bin" ] && link_to_usr_bin "$existing_bin" "$name"
    return 0
  fi
  info "installing $name ..."
  if "$@"; then
    info "$name: OK"
    local new_bin
    new_bin="$(find_tool_bin "$name")"
    [ -n "$new_bin" ] && link_to_usr_bin "$new_bin" "$name"
  else
    warn "$name: INSTALL FAILED (continuing)"
  fi
}

# Cross-platform package installer
pkg_install() {
  if ! can_sudo && [ "$PKG_MGR" != "brew" ]; then
    warn "$PKG_MGR: root/sudo privileges not available; skipping system package installation"
    return 0
  fi
  local pkg ok=0 fail=0
  for pkg in "$@"; do
    local res=1
    case "$PKG_MGR" in
      apt)
        export DEBIAN_FRONTEND=noninteractive
        $SUDO apt-get install -y -qq "$pkg" >/dev/null 2>&1 && res=0
        ;;
      pacman)
        $SUDO pacman -S --noconfirm --needed "$pkg" >/dev/null 2>&1 && res=0
        ;;
      dnf)
        $SUDO dnf install -y -q "$pkg" >/dev/null 2>&1 && res=0
        ;;
      yum)
        $SUDO yum install -y -q "$pkg" >/dev/null 2>&1 && res=0
        ;;
      zypper)
        $SUDO zypper --non-interactive install "$pkg" >/dev/null 2>&1 && res=0
        ;;
      apk)
        $SUDO apk add --no-cache "$pkg" >/dev/null 2>&1 && res=0
        ;;
      brew)
        brew install "$pkg" >/dev/null 2>&1 && res=0
        ;;
      pkg)
        $SUDO pkg install -y "$pkg" >/dev/null 2>&1 && res=0
        ;;
    esac
    if [ $res -eq 0 ]; then
      ok=$((ok+1))
    else
      warn "$PKG_MGR: '$pkg' could not be installed (skipping)"; fail=$((fail+1))
    fi
  done
  info "$PKG_MGR: $ok installed, $fail skipped"
}

apt_install() { pkg_install "$@"; }

# Foundational prerequisite checker & installer
ensure_prerequisites() {
  local missing=()
  for req in git curl wget zip unzip tar jq python3; do
    if ! command -v "$req" >/dev/null 2>&1; then
      missing+=("$req")
    fi
  done
  if ! command -v make >/dev/null 2>&1 || (! command -v gcc >/dev/null 2>&1 && ! command -v clang >/dev/null 2>&1 && ! command -v cc >/dev/null 2>&1); then
    missing+=("build-tools")
  fi
  if ! command -v ps >/dev/null 2>&1; then
    missing+=("procps")
  fi

  if [ ${#missing[@]} -gt 0 ]; then
    say "=== [!] Missing foundational prerequisites: ${missing[*]} ==="
    info "Installing foundational dependencies via $PKG_MGR..."
    case "$PKG_MGR" in
      apt)
        export DEBIAN_FRONTEND=noninteractive
        $SUDO apt-get update -qq 2>/dev/null || true
        $SUDO apt-get install -y -qq curl wget git zip unzip tar jq procps build-essential python3 python3-pip python3-venv ca-certificates libfuzzy-dev >/dev/null 2>&1 || true
        ;;
      pacman)
        $SUDO pacman -Sy --noconfirm --needed curl wget git zip unzip tar jq procps-ng base-devel python python-pip ca-certificates >/dev/null 2>&1 || true
        ;;
      dnf|yum)
        $SUDO "$PKG_MGR" install -y curl wget git zip unzip tar jq procps-ng gcc gcc-c++ make python3 python3-pip ca-certificates >/dev/null 2>&1 || true
        ;;
      zypper)
        $SUDO zypper --non-interactive install curl wget git zip unzip tar jq procps gcc gcc-c++ make python3 python3-pip ca-certificates >/dev/null 2>&1 || true
        ;;
      apk)
        $SUDO apk add --no-cache curl wget git zip unzip tar jq procps build-base python3 py3-pip ca-certificates bash >/dev/null 2>&1 || true
        ;;
      brew)
        brew install curl wget git zip unzip gnu-tar jq python3 >/dev/null 2>&1 || true
        ;;
    esac
  fi
}

export -f can_sudo can_apt have find_tool_bin link_to_usr_bin info warn say ensure_bin pkg_install apt_install ensure_prerequisites 2>/dev/null || true
export BIN_INSTALL_DIR SUDO TOOLS_DIR PKG_MGR OS_NAME

pip_install()  { pip3 install --break-system-packages --no-cache-dir --quiet "$@" \
                    || warn "pip install failed: $* (continuing)"; }

pipx_install() {
  local pkg="$1"
  local bin_name="${2:-$1}"
  if have "$bin_name"; then
    info "$bin_name: already installed"
    local ex_pipx
    ex_pipx="$(find_tool_bin "$bin_name")"
    [ -n "$ex_pipx" ] && link_to_usr_bin "$ex_pipx" "$bin_name"
    return 0
  fi
  info "installing $bin_name (pipx) ..."
  if have pipx; then
    pipx install "$pkg" 2>/dev/null || warn "pipx install $pkg failed (continuing)"
  else
    pip_install "$pkg"
  fi
  # Ensure binary is mirrored in BIN_INSTALL_DIR, TOOLS_DIR/bin, and /usr/bin if pipx placed it in ~/.local/bin
  if [ -x "$HOME/.local/bin/$bin_name" ]; then
    if [ "$BIN_INSTALL_DIR" != "$HOME/.local/bin" ]; then
      ln -sf "$HOME/.local/bin/$bin_name" "$BIN_INSTALL_DIR/$bin_name" 2>/dev/null || true
      ln -sf "$HOME/.local/bin/$bin_name" "$TOOLS_DIR/bin/$bin_name" 2>/dev/null || true
    fi
    link_to_usr_bin "$HOME/.local/bin/$bin_name" "$bin_name"
  fi
}

go_install() {
  local pkg="$1"; local name="${2:-$(basename "$pkg")}"
  local pkg_bin
  pkg_bin="$(basename "$pkg")"
  if have "$name" || have "$pkg_bin"; then
    info "$name: already installed"
    local ex_go
    ex_go="$(find_tool_bin "$name")"
    [ -z "$ex_go" ] && ex_go="$(find_tool_bin "$pkg_bin")"
    if [ -n "$ex_go" ]; then
      link_to_usr_bin "$ex_go" "$name"
      [ "$name" != "$pkg_bin" ] && link_to_usr_bin "$ex_go" "$pkg_bin"
    fi
    return 0
  fi
  info "installing $name (go) ..."
  go install -v "${pkg}@latest" 2>/dev/null || warn "go install $pkg failed"

  local go_bin_dir="$GOPATH/bin"
  if command -v go >/dev/null 2>&1; then
    local env_gopath
    env_gopath="$(go env GOPATH 2>/dev/null || true)"
    [ -n "$env_gopath" ] && [ -d "$env_gopath/bin" ] && go_bin_dir="$env_gopath/bin"
  fi

  local src_bin=""
  if [ -x "$go_bin_dir/$name" ]; then
    src_bin="$go_bin_dir/$name"
  elif [ -x "$go_bin_dir/$pkg_bin" ]; then
    src_bin="$go_bin_dir/$pkg_bin"
  fi

  if [ -n "$src_bin" ]; then
    ln -sf "$src_bin" "$BIN_INSTALL_DIR/$name" 2>/dev/null || true
    ln -sf "$src_bin" "$TOOLS_DIR/bin/$name" 2>/dev/null || true
    link_to_usr_bin "$src_bin" "$name"
    if [ "$name" != "$pkg_bin" ]; then
      ln -sf "$src_bin" "$BIN_INSTALL_DIR/$pkg_bin" 2>/dev/null || true
      ln -sf "$src_bin" "$TOOLS_DIR/bin/$pkg_bin" 2>/dev/null || true
      link_to_usr_bin "$src_bin" "$pkg_bin"
    fi
    local lower_name
    lower_name="$(echo "$name" | tr '[:upper:]' '[:lower:]')"
    if [ "$name" != "$lower_name" ]; then
      ln -sf "$src_bin" "$BIN_INSTALL_DIR/$lower_name" 2>/dev/null || true
      ln -sf "$src_bin" "$TOOLS_DIR/bin/$lower_name" 2>/dev/null || true
      link_to_usr_bin "$src_bin" "$lower_name"
    fi
  fi
}

git_clone() { # <dest> <url> : shallow clone into dest if not present
  local dir="$1" url="$2"
  if [ -d "$dir" ] && [ -n "$(ls -A "$dir" 2>/dev/null)" ]; then
    info "git: $(basename "$dir") already present"
    return 0
  fi
  info "git clone -> $(basename "$dir")"
  GIT_TERMINAL_PROMPT=0 git clone --depth 1 "$url" "$dir" >/dev/null 2>&1 || warn "git clone $url FAILED (skipping)"
}

ensure_tools_venv() {
  if [ ! -d "$TOOLS_DIR/venv" ]; then
    python3 -m venv "$TOOLS_DIR/venv" 2>/dev/null || true
  fi
  if [ -f "$TOOLS_DIR/venv/bin/python" ]; then
    TOOLS_PYTHON="$TOOLS_DIR/venv/bin/python"
    TOOLS_PIP="$TOOLS_DIR/venv/bin/pip"
  else
    TOOLS_PYTHON="python3"
    TOOLS_PIP="pip3"
  fi
  # Core python libraries needed across all security tools
  "$TOOLS_PIP" install --no-cache-dir --quiet requests beautifulsoup4 lxml couchdb pymongo pbkdf2 six ipcalc PySocks termcolor autopep8 fuzzywuzzy tld h2 dnspython modernize passwordmeter python-Levenshtein 2>/dev/null || true
}

wrap_cli() { # <bin_name> <interpreter> <script_path> [run_in_script_dir]
  local name="$1"
  local interp="$2"
  local script="$3"
  local in_dir="${4:-false}"
  if [ -f "$script" ]; then
    mkdir -p "$BIN_INSTALL_DIR" "$TOOLS_DIR/bin"
    if [ "$in_dir" = "true" ]; then
      cat << WRAP_EOF > "$BIN_INSTALL_DIR/$name"
#!/usr/bin/env bash
script_dir="\$(cd "\$(dirname "$script")" 2>/dev/null && pwd)"
export PYTHONPATH="\$script_dir:\${PYTHONPATH:-}"
(cd "\$script_dir" && exec $interp "$script" "\$@")
WRAP_EOF
    else
      cat << WRAP_EOF > "$BIN_INSTALL_DIR/$name"
#!/usr/bin/env bash
script_dir="\$(cd "\$(dirname "$script")" 2>/dev/null && pwd)"
export PYTHONPATH="\$script_dir:\${PYTHONPATH:-}"
exec $interp "$script" "\$@"
WRAP_EOF
    fi
    chmod +x "$BIN_INSTALL_DIR/$name"
    if [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ]; then
      cp -f "$BIN_INSTALL_DIR/$name" "$TOOLS_DIR/bin/$name" 2>/dev/null || true
    fi
    link_to_usr_bin "$BIN_INSTALL_DIR/$name" "$name"
  fi
}

# ==============================================================================
# SECTION: Toolchains / lang runtimes - so a fresh machine has everything needed
# to build the tools too (python, go, rust/cargo, node, java, docker, powershell).
# ==============================================================================
cmd_toolchains() {
  say "=== ensuring base toolchains / runtimes ==="

  # Python, Go, Node, Ruby via apt (already common, just guarantee)
  apt_install python3 python3-pip python3-venv python3-dev pipx \
    golang-go nodejs npm ruby ruby-dev \
    build-essential make cmake pkg-config maven \
    libssl-dev libpcap-dev libffi-dev zlib1g-dev libfuzzy-dev \
    git curl wget unzip zip tar jq || true

  # Rust toolchain (rustup + cargo) - needed for rust-based tools
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

  # Docker CLI + Compose
  if ! have docker; then
    apt_install docker.io || warn "docker.io install failed"
  else info "docker: already installed"; fi
  if ! have docker-compose; then
    apt_install docker-compose docker-compose-plugin 2>/dev/null || true
  fi

  # PowerShell (pwsh) - enables AD/Entra PowerShell modules & windows-adjacent tools
  if ! have pwsh; then
    apt_install powershell || warn "powershell install failed (AADInternals/PowerZure need it)"
  else info "pwsh: already installed"; fi
}

# ==============================================================================
# SECTION: apt-installable tools (Kali/Debian). Already-present packages are a
# no-op for apt, so this is safe to re-run.
# ==============================================================================
cmd_apt() {
  say "=== installing apt packages (pure headless CLI tools) ==="
  apt_install \
    whois dnsutils dnsenum dnsrecon fierce dnsmasq \
    net-tools iproute2 iputils-ping iputils-tracepath netcat-openbsd socat tcpdump \
    nmap masscan zmap unicornscan hping3 arp-scan fping netdiscover nbtscan \
    tshark ngrep dhcpdump \
    zeek suricata \
    bettercap ettercap-text-only mitmproxy dsniff macchanger \
    aircrack-ng wifite kismet reaver bully pixiewps wifiphisher \
    hcxtools hcxdumptool \
    bluez bluetooth ubertooth \
    snmp snmpd snmp-mibs-downloader onesixtyone \
    smbclient smbmap impacket-scripts enum4linux-ng ldap-utils python3-ldapdomaindump \
    ssh sshpass ssh-audit sshuttle hydra medusa ncrack crowbar \
    cracklib-runtime hashcat john cewl crunch cupp pipal rsmangler hashid \
    gobuster dirb wfuzz ffuf feroxbuster nikto wpscan sqlmap dirsearch \
    commix metasploit-framework exploitdb \
    recon-ng spiderfoot theharvester \
    dotdotpwn routersploit \
    proxychains4 \
    exiftool imagemagick yara clamav binwalk foremost scalpel bulk-extractor \
    sleuthkit volatility3 \
    stegseek steghide \
    radare2 qemu-user firmware-mod-kit \
    swaks smtp-user-enum sipvicious sipsak sipp \
    tcpreplay netsniff-ng massdns \
    kubectl \
    ripgrep fzf bat yq \
    jq curl wget git zip unzip tar file \
    python3 python3-pip python3-venv python3-dev pipx \
    golang-go ruby ruby-dev nodejs npm \
    build-essential libpcap-dev libssl-dev libxml2-utils libffi-dev \
    vim nano tmux screen htop \
    openvpn wireguard strongswan ike-scan \
    redis-tools default-mysql-client postgresql-client sqlite3 \
    libparse-win32registry-perl \
    tftp tftpd-hpa || true

  # Ensure package binary aliases match catalog expectations
  if [ -f "/usr/bin/impacket-secretsdump" ] && [ ! -f "$BIN_INSTALL_DIR/secretsdump.py" ]; then
    ln -sf "/usr/bin/impacket-secretsdump" "$BIN_INSTALL_DIR/secretsdump.py" 2>/dev/null || true
  fi
  if [ -f "/usr/bin/ubertooth-util" ] && [ ! -f "$BIN_INSTALL_DIR/ubertooth" ]; then
    ln -sf "/usr/bin/ubertooth-util" "$BIN_INSTALL_DIR/ubertooth" 2>/dev/null || true
  fi
  if [ -f "/usr/bin/svmap" ] && [ ! -f "$BIN_INSTALL_DIR/sipvicious" ]; then
    ln -sf "/usr/bin/svmap" "$BIN_INSTALL_DIR/sipvicious" 2>/dev/null || true
  fi
  if [ -x "/usr/bin/radare2" ] && [ ! -f "$BIN_INSTALL_DIR/r2" ]; then
    ln -sf "/usr/bin/radare2" "$BIN_INSTALL_DIR/r2" 2>/dev/null || true
  fi
}

# ==============================================================================
# SECTION: Python / pip / pipx tools
# ==============================================================================
cmd_python() {
  say "=== installing python/pipx tools ==="
  pipx ensurepath || true

  # OSINT / recon
  pipx_install shodan
  pipx_install censys
  pipx_install sherlock-project sherlock
  pipx_install instaloader
  pipx_install dnsgen
  pipx_install arjun
  pipx_install waymore
  pipx_install maigret
  pipx_install holehe
  pipx_install gallery-dl
  pipx_install yt-dlp
  pipx_install updog
  pipx_install finalrecon

  # Active Directory / Entra (pip/pipx CLIs)
  pipx_install certipy-ad certipy
  pipx_install bloodyAD
  pipx_install adidnsdump
  pipx_install coercer
  pipx_install pywerview
  pipx_install ldeep
  pipx_install pre2k
  pipx_install ldapdomaindump
  pipx_install pypykatz

  # cloud audit
  pipx_install scoutsuite scout
  pipx_install prowler
  pipx_install penelope-shell-handler penelope
  pipx_install checkov
  pipx_install kube-hunter

  # web / API helpers available on PyPI as CLIs
  pip_install uro 2>/dev/null || true
  pip_install semgrep 2>/dev/null || true
  pip_install detect-secrets 2>/dev/null || true
  pip_install sstimap 2>/dev/null || true
  pip_install PyJWT 2>/dev/null || true
  pip_install sslyze 2>/dev/null || true
  pip_install wafw00f 2>/dev/null || true
  pip_install oletools 2>/dev/null || true
  pip_install scapy 2>/dev/null || true
  pip_install volatility3 2>/dev/null || true

  # Mirror venv CLI binaries to BIN_INSTALL_DIR if present
  for pybin in uro pwn s3recon githacker octosuite; do
    if [ -f "$TOOLS_DIR/venv/bin/$pybin" ]; then
      ln -sf "$TOOLS_DIR/venv/bin/$pybin" "$BIN_INSTALL_DIR/$pybin" 2>/dev/null || true
      ln -sf "$TOOLS_DIR/venv/bin/$pybin" "$TOOLS_DIR/bin/$pybin" 2>/dev/null || true
    fi
  done

  # Ruby gem stego helper
  if have gem && ! have zsteg; then
    gem install --no-document zsteg >/dev/null 2>&1 && info "zsteg installed" || true
  fi
  if have gem; then
    local gem_bin
    gem_bin="$(ruby -e 'puts Gem.bindir' 2>/dev/null || true)"
    if [ -n "$gem_bin" ] && [ -x "$gem_bin/zsteg" ] && [ ! -f "$BIN_INSTALL_DIR/zsteg" ]; then
      ln -sf "$gem_bin/zsteg" "$BIN_INSTALL_DIR/zsteg" 2>/dev/null || true
    fi
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
  go_install  github.com/projectdiscovery/chaos-client/cmd/chaos        chaos-client

  # Asset discovery / subdomain enumeration / wordmanipulation
  # assetfinder: repo root has NO go.mod, so `go install` fails. Build from source instead.
  if ! have assetfinder; then
    mkdir -p "$opt/assetfinder"
    (cd "$opt/assetfinder" && git clone --depth 1 https://github.com/tomnomnom/assetfinder.git . && \
     go build -o "$BIN_INSTALL_DIR/assetfinder" .) 2>/dev/null || true
  fi
  go_install  github.com/tomnomnom/waybackurls                          waybackurls
  go_install  github.com/tomnomnom/httprobe                             httprobe
  go_install  github.com/tomnomnom/unfurl                               unfurl
  go_install  github.com/tomnomnom/qsreplace                            qsreplace
  # gf: repo root has NO go.mod, so `go install` fails. Build from source and copy ~/.gf patterns.
  if ! have gf; then
    mkdir -p "$opt/gf"
    (cd "$opt/gf" && git clone --depth 1 https://github.com/tomnomnom/gf.git . && \
     go build -o "$BIN_INSTALL_DIR/gf" .) 2>/dev/null || true
  fi
  [ -d "$HOME/.gf" ] || mkdir -p "$HOME/.gf"
  [ -d "$opt/gf/examples" ] && cp -n "$opt/gf/examples/"*.json "$HOME/.gf/" 2>/dev/null || true
  go_install  github.com/lc/gau/v2/cmd/gau                              gau
  go_install  github.com/hakluke/hakrawler                              hakrawler
  go_install  github.com/jaeles-project/gospider                        gospider
  # dalfox: repo rewritten from Go to Rust (root has Cargo.toml, no go.mod), so `go install` fails.
  # Install via cargo. If cargo is absent, fall back to the prebuilt GitHub release binary.
  if ! have dalfox; then
    if have cargo; then
      cargo install dalfox 2>/dev/null || true
    else
      curl -sL "https://github.com/hahwul/dalfox/releases/latest/download/dalfox-$(uname -s)-$(uname -m).tar.gz" \
        | tar xz -C "$BIN_INSTALL_DIR" 2>/dev/null || true
    fi
  fi
  go_install  github.com/KathanP19/Gxss                                 Gxss
  go_install  github.com/Emoe/kxss                                      kxss
  go_install  github.com/ffuf/pencode/cmd/pencode                       pencode
  go_install  github.com/d3mondev/puredns/v2                            puredns
  go_install  github.com/tomnomnom/meg                                  meg
  go_install  github.com/lc/subjs                                       subjs
  go_install  github.com/bishopfox/jsluice/cmd/jsluice                  jsluice
  go_install  github.com/aquasecurity/tfsec/cmd/tfsec                   tfsec 2>/dev/null || true
  go_install  github.com/sa7mon/s3scanner                               s3scanner 2>/dev/null || true
  go_install  github.com/Shopify/kubeaudit/cmd                          kubeaudit 2>/dev/null || true
}

# ==============================================================================
# SECTION: prebuilt binaries + Go binary tools w/o pkg install convenience
# ==============================================================================
cmd_bin() {
  say "=== installing standalone/prebuilt binaries ==="
  local tmp; tmp="$(mktemp -d)"

  # kerbrute (AD Kerberos brute)
  ensure_bin kerbrute bash -c "curl -sL https://github.com/ropnop/kerbrute/releases/latest/download/kerbrute_linux_amd64 -o \"$BIN_INSTALL_DIR/kerbrute\" && chmod +x \"$BIN_INSTALL_DIR/kerbrute\""

  # cloudfox (cloud context enumeration, extracts from zip)
  ensure_bin cloudfox bash -c "
    curl -sL https://github.com/BishopFox/cloudfox/releases/latest/download/cloudfox-linux-amd64.zip -o /tmp/cloudfox.zip 2>/dev/null || \
    # (removed dead fallback: cloudfox_linux_amd64.zip asset does not exist)
    rm -rf /tmp/cloudfox_dir && mkdir -p /tmp/cloudfox_dir
    unzip -q -o /tmp/cloudfox.zip -d /tmp/cloudfox_dir 2>/dev/null
    bin_file=\$(find /tmp/cloudfox_dir -maxdepth 3 -type f -name cloudfox 2>/dev/null | head -1)
    if [ -n \"\$bin_file\" ]; then
      cp \"\$bin_file\" \"$BIN_INSTALL_DIR/cloudfox\"
      chmod +x \"$BIN_INSTALL_DIR/cloudfox\"
    fi
    rm -rf /tmp/cloudfox.zip /tmp/cloudfox_dir 2>/dev/null || true"

  # azurehound (Entra ID attack-path mapping, extracts from zip or rolling release)
  ensure_bin azurehound bash -c "
    curl -sL https://github.com/SpecterOps/AzureHound/releases/download/rolling/azurehound-linux-amd64.zip -o /tmp/azurehound.zip 2>/dev/null || \
    curl -sL https://github.com/SpecterOps/AzureHound/releases/download/v2.2.1/azurehound-linux-amd64.zip -o /tmp/azurehound.zip 2>/dev/null
    if [ -s /tmp/azurehound.zip ]; then
      rm -rf /tmp/azurehound_dir && mkdir -p /tmp/azurehound_dir
      unzip -q -o /tmp/azurehound.zip -d /tmp/azurehound_dir 2>/dev/null
      bin_f=\$(find /tmp/azurehound_dir -maxdepth 3 -type f -name azurehound 2>/dev/null | head -1)
      if [ -n \"\$bin_f\" ]; then
        cp \"\$bin_f\" \"$BIN_INSTALL_DIR/azurehound\"
        chmod +x \"$BIN_INSTALL_DIR/azurehound\"
      fi
      rm -rf /tmp/azurehound.zip /tmp/azurehound_dir 2>/dev/null || true
    elif have go; then
      go install -v github.com/SpecterOps/azurehound/v3@latest 2>/dev/null || true
    fi"

  # findomain (OSINT subdomains via many APIs)
  ensure_bin findomain bash -c "
    curl -sL https://github.com/findomain/findomain/releases/latest/download/findomain-linux.zip -o /tmp/findomain.zip 2>/dev/null && \
    unzip -q -o /tmp/findomain.zip -d \"$BIN_INSTALL_DIR/\" 2>/dev/null && chmod +x \"$BIN_INSTALL_DIR/findomain\" 2>/dev/null && rm -f /tmp/findomain.zip"

  # rustscan (ultra-fast port scanner, rust)
  ensure_bin rustscan bash -c "
    curl -sL https://github.com/RustScan/RustScan/releases/download/2.4.1/x86_64-linux-rustscan.tar.gz.zip -o /tmp/rs.zip 2>/dev/null \
      && unzip -q -o /tmp/rs.zip -d /tmp/rs_dir 2>/dev/null
    tar_f=\$(find /tmp/rs_dir -name \"*.tar.gz\" 2>/dev/null | head -1)
    if [ -n \"\$tar_f\" ]; then
      tar -xzf \"\$tar_f\" -C /tmp/rs_dir 2>/dev/null
    fi
    bin_r=\$(find /tmp/rs_dir -type f -name rustscan 2>/dev/null | head -1)
    if [ -n \"\$bin_r\" ]; then
      cp \"\$bin_r\" \"$BIN_INSTALL_DIR/rustscan\"
      chmod +x \"$BIN_INSTALL_DIR/rustscan\"
    fi
    rm -rf /tmp/rs.zip /tmp/rs_dir 2>/dev/null || true"

  # ollama (local LLM, ties into the CLI OLLAMA_HOST)
  if ! have ollama; then
    info "installing ollama ..."
    curl -fsSL https://ollama.com/install.sh | sh >/dev/null 2>&1 || warn "ollama install failed"
  else info "ollama: already installed"; fi

  # cloudflared / ngrok tunnelling (OOB / C2 callbacks)
  ensure_bin cloudflared bash -c "curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o \"$BIN_INSTALL_DIR/cloudflared\" && chmod +x \"$BIN_INSTALL_DIR/cloudflared\""
  ensure_bin ngrok bash -c "curl -sL https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz -o /tmp/ngrok.tgz && tar -xzf /tmp/ngrok.tgz -C \"$BIN_INSTALL_DIR\" 2>/dev/null && chmod +x \"$BIN_INSTALL_DIR/ngrok\" && rm -f /tmp/ngrok.tgz"

  # codeql (GitHub code analysis engine - heavy, best-effort)
  if ! have codeql; then
    info "installing codeql ..."
    curl -sL "https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-linux64.zip" -o /tmp/codeql.zip \
      && unzip -q /tmp/codeql.zip -d "$TOOLS_DIR" && ln -sf "$TOOLS_DIR"/codeql*/codeql "$BIN_INSTALL_DIR/codeql" 2>/dev/null \
      || warn "codeql install failed"
  else info "codeql: already installed"; fi

  # kubernetes control-plane + security scanners
  if ! have kubectl; then
    info "installing kubectl ..."
    k8s_ver=$(curl -sL https://dl.k8s.io/release/stable.txt 2>/dev/null || echo "v1.31.0")
    [ -z "$k8s_ver" ] && k8s_ver="v1.31.0"
    curl -sL "https://dl.k8s.io/release/${k8s_ver}/bin/linux/amd64/kubectl" \
      -o "/tmp/kubectl.tmp" && chmod +x "/tmp/kubectl.tmp" && mv "/tmp/kubectl.tmp" "$BIN_INSTALL_DIR/kubectl" \
      || warn "kubectl install failed"
  else info "kubectl: already installed"; fi

  ensure_bin kube-bench bash -c "
    curl -sL https://github.com/aquasecurity/kube-bench/releases/download/v0.16.0/kube-bench_0.16.0_linux_amd64.tar.gz -o /tmp/kb.tar.gz 2>/dev/null \
      && tar -xzf /tmp/kb.tar.gz -C \"$BIN_INSTALL_DIR\" kube-bench 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/kube-bench\" 2>/dev/null && rm -f /tmp/kb.tar.gz"

  # x8 (hidden parameter discovery)
  ensure_bin x8 bash -c "
    curl -sL https://github.com/Sh1Yo/x8/releases/download/v4.3.0/x86_64-linux-x8.gz 2>/dev/null | gzip -d > \"$BIN_INSTALL_DIR/x8\" 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/x8\""

  # kiterunner (content discovery / API scanner)
  ensure_bin kr bash -c "
    curl -sL https://github.com/assetnote/kiterunner/releases/download/v1.0.2/kiterunner_1.0.2_linux_amd64.tar.gz -o /tmp/kr.tar.gz 2>/dev/null \
      && tar -xzf /tmp/kr.tar.gz -C \"$BIN_INSTALL_DIR\" kr 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/kr\" 2>/dev/null \
      && ln -sf \"$BIN_INSTALL_DIR/kr\" \"$BIN_INSTALL_DIR/kiterunner\" 2>/dev/null
    rm -f /tmp/kr.tar.gz 2>/dev/null || true"

  # gitleaks (secrets detector for git repositories)
  ensure_bin gitleaks bash -c "
    curl -sL https://github.com/gitleaks/gitleaks/releases/download/v8.24.0/gitleaks_8.24.0_linux_x64.tar.gz -o /tmp/gitleaks.tar.gz 2>/dev/null \
      && tar -xzf /tmp/gitleaks.tar.gz -C \"$BIN_INSTALL_DIR\" gitleaks 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/gitleaks\" 2>/dev/null
    rm -f /tmp/gitleaks.tar.gz 2>/dev/null || true"

  # trufflehog (high-entropy secrets / credentials scanner)
  ensure_bin trufflehog bash -c "
    curl -sL https://github.com/trufflesecurity/trufflehog/releases/download/v3.88.16/trufflehog_3.88.16_linux_amd64.tar.gz -o /tmp/trufflehog.tar.gz 2>/dev/null \
      && tar -xzf /tmp/trufflehog.tar.gz -C \"$BIN_INSTALL_DIR\" trufflehog 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/trufflehog\" 2>/dev/null
    rm -f /tmp/trufflehog.tar.gz 2>/dev/null || true"

  # amass (in-depth attack surface mapping & asset discovery)
  ensure_bin amass bash -c "
    rm -rf /tmp/amass_dir && mkdir -p /tmp/amass_dir
    curl -sL https://github.com/owasp-amass/amass/releases/download/v5.1.1/amass_linux_amd64.tar.gz -o /tmp/amass.tar.gz 2>/dev/null \
      && tar -xzf /tmp/amass.tar.gz -C /tmp/amass_dir 2>/dev/null
    bin_a=\$(find /tmp/amass_dir -type f -name amass 2>/dev/null | head -1)
    if [ -n \"\$bin_a\" ]; then
      cp \"\$bin_a\" \"$BIN_INSTALL_DIR/amass\"
      chmod +x \"$BIN_INSTALL_DIR/amass\"
    fi
    rm -rf /tmp/amass.tar.gz /tmp/amass_dir 2>/dev/null || true"

  # kics (keeping infrastructure as code secure)
  ensure_bin kics bash -c "
    curl -sL https://github.com/Checkmarx/kics/releases/download/v2.1.20/kics_2.1.20_linux_amd64.tar.gz -o /tmp/kics.tar.gz 2>/dev/null \
      && tar -xzf /tmp/kics.tar.gz -C \"$BIN_INSTALL_DIR\" kics 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/kics\" 2>/dev/null
    rm -f /tmp/kics.tar.gz 2>/dev/null || true"

  # kubeaudit (audit Kubernetes clusters against security best practices)
  ensure_bin kubeaudit bash -c "
    curl -sL https://github.com/Shopify/kubeaudit/releases/download/v0.22.2/kubeaudit_0.22.2_linux_amd64.tar.gz -o /tmp/kubeaudit.tar.gz 2>/dev/null \
      && tar -xzf /tmp/kubeaudit.tar.gz -C \"$BIN_INSTALL_DIR\" kubeaudit 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/kubeaudit\" 2>/dev/null && rm -f /tmp/kubeaudit.tar.gz"

  # chaos-client (ProjectDiscovery internet assets & DNS dataset client)
  ensure_bin chaos-client bash -c "
    curl -sL https://github.com/projectdiscovery/chaos-client/releases/download/v0.5.2/chaos-client_0.5.2_linux_amd64.zip -o /tmp/chaos.zip 2>/dev/null \
      && unzip -q -o /tmp/chaos.zip -d \"$BIN_INSTALL_DIR\" 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/chaos-client\" 2>/dev/null && rm -f /tmp/chaos.zip"

  # jwt (JWT encode/decode/verify CLI by Mike Engel)
  ensure_bin jwt bash -c "
    curl -sL https://github.com/mike-engel/jwt-cli/releases/latest/download/jwt-linux.tar.gz -o /tmp/jwt.tar.gz 2>/dev/null \
      && tar -xzf /tmp/jwt.tar.gz -C \"$BIN_INSTALL_DIR\" jwt 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/jwt\" 2>/dev/null && rm -f /tmp/jwt.tar.gz"

  rm -rf "$tmp"
}

# ==============================================================================
# SECTION: git-cloned offensive/research tooling (into ~/Tools)
# ==============================================================================
cmd_git() {
  say "=== installing git-cloned tools & CLI wrappers ==="
  ensure_tools_venv
  local opt="$TOOLS_DIR"

  # Web / param / SSRF / XSS / SQL / Injection / GraphQL
  git_clone "$opt/SSRFmap"        https://github.com/swisskyrepo/SSRFmap.git
  git_clone "$opt/XSStrike"       https://github.com/s0md3v/XSStrike.git
  git_clone "$opt/smuggler"       https://github.com/defparam/smuggler.git
  git_clone "$opt/h2csmuggler"    https://github.com/BishopFox/h2csmuggler.git
  git_clone "$opt/SecretFinder"   https://github.com/m4ll0k/SecretFinder.git
  git_clone "$opt/JSFinder"       https://github.com/Threezh1/JSFinder.git
  git_clone "$opt/ParamSpider"    https://github.com/devanshbatham/ParamSpider.git
  git_clone "$opt/ghauri"         https://github.com/r0oth3x49/ghauri.git
  git_clone "$opt/Gopherus"       https://github.com/tarunkant/Gopherus.git
  git_clone "$opt/LFISuite"       https://github.com/D35m0nd142/LFISuite.git
  git_clone "$opt/NoSQLMap"       https://github.com/codingo/NoSQLMap.git
  git_clone "$opt/XXEinjector"    https://github.com/enjoiz/XXEinjector.git
  git_clone "$opt/graphql-cop"    https://github.com/dolevf/graphql-cop.git
  git_clone "$opt/graphw00f"      https://github.com/dolevf/graphw00f.git

  # Deserialization / PHP
  git_clone "$opt/ysoserial"      https://github.com/frohoff/ysoserial.git
  git_clone "$opt/marshalsec"     https://github.com/mbechler/marshalsec.git
  git_clone "$opt/phpggc"         https://github.com/ambionics/phpggc.git

  # Fuzzing
  git_clone "$opt/boofuzz"        https://github.com/jtpereyda/boofuzz.git

  # Repos / GitHub dorking / secret&repo
  git_clone "$opt/GitTools"       https://github.com/internetwache/GitTools.git
  git_clone "$opt/GitHacker"      https://github.com/WangYihang/GitHacker.git
  git_clone "$opt/GitDorker"      https://github.com/obheda12/GitDorker.git
  git_clone "$opt/GitGot"         https://github.com/BishopFox/GitGot.git
  git_clone "$opt/octosuite"      https://github.com/bellingcat/octosuite.git
  git_clone "$opt/DumpsterDiver"  https://github.com/securing/DumpsterDiver.git
  git_clone "$opt/shhgit"         https://github.com/eth0izzle/shhgit.git

  # Password / Spraying / Exploits
  git_clone "$opt/SprayingToolkit" https://github.com/byt3bl33d3r/SprayingToolkit.git
  git_clone "$opt/BruteX"          https://github.com/1N3/BruteX.git
  git_clone "$opt/bruteHASH"       https://github.com/playGitboy/bruteHASH.git

  # OSINT
  git_clone "$opt/Photon"          https://github.com/s0md3v/Photon.git
  git_clone "$opt/recon-ng"        https://github.com/lanmaster53/recon-ng.git
  git_clone "$opt/ReconFTW"        https://github.com/six2dez/reconftw.git
  git_clone "$opt/sn1per"          https://github.com/1N3/Sn1per.git

  # Exploitation / frameworks
  git_clone "$opt/PowerSploit"     https://github.com/PowerShellMafia/PowerSploit.git
  git_clone "$opt/routersploit"    https://github.com/threat9/routersploit.git
  git_clone "$opt/Empire"          https://github.com/BC-SECURITY/Empire.git

  # Cloud & Buckets
  git_clone "$opt/cloud_enum"      https://github.com/initstring/cloud_enum.git
  git_clone "$opt/CloudBrute"      https://github.com/0xsha/CloudBrute.git
  git_clone "$opt/pacu"            https://github.com/RhinoSecurityLabs/pacu.git
  git_clone "$opt/S3Scanner"       https://github.com/sa7mon/S3Scanner.git
  git_clone "$opt/s3-inspector"    https://github.com/vpistis/s3-inspector.git
  git_clone "$opt/S3Recon"         https://github.com/clarketm/s3recon.git
  git_clone "$opt/GCPBucketBrute"  https://github.com/rhinosecuritylabs/GCPBucketBrute.git

  # Automotive / CAN
  git_clone "$opt/caringcaribou"   https://github.com/CaringCaribou/caringcaribou.git

  # Payloads / Cheatsheets / Directory Traversal
  git_clone "$opt/jwt_tool"        https://github.com/ticarpi/jwt_tool.git
  git_clone "$opt/PayloadsAllTheThings" https://github.com/swisskyrepo/PayloadsAllTheThings.git
  git_clone "$opt/HackTricks"      https://github.com/HackTricks-wiki/HackTricks.git
  git_clone "$opt/dotdotpwn"       https://github.com/wireghoul/dotdotpwn.git

  # Install Python dependencies for ALL cloned tools automatically
  for req in "$opt"/*/requirements.txt; do
    if [ -f "$req" ]; then
      info "installing requirements for $(basename "$(dirname "$req")")..."
      "$TOOLS_PIP" install --no-cache-dir --quiet -r "$req" 2>/dev/null || true
    fi
  done
  # Support capitalized REQUIREMENTS in recon-ng
  if [ -f "$opt/recon-ng/REQUIREMENTS" ]; then
    info "installing requirements for recon-ng..."
    "$TOOLS_PIP" install --no-cache-dir --quiet -r "$opt/recon-ng/REQUIREMENTS" 2>/dev/null || true
  fi

  # Core runtime python packages for tooling venv
  "$TOOLS_PIP" install --no-cache-dir --quiet boofuzz requests beautifulsoup4 lxml couchdb pymongo pbkdf2 six ipcalc PySocks termcolor fuzzywuzzy tld h2 requests-futures docopt requests_ntlm pyspnego imapclient telnetlib3 dnslib dnspython flask tldextract python-Levenshtein python-can 2>/dev/null || true

  # Pinned pacu & cloud dependencies to avoid pip resolver backtracking
  "$TOOLS_PIP" install --no-cache-dir --quiet "boto3<1.32" "botocore<1.32" "SQLAlchemy<2.0" "awscli<2.0" sqlalchemy-utils dsnap chalice policyuniverse pycognito qrcode jq toml 2>/dev/null || true
  if [ -d "$opt/pacu" ]; then
    "$TOOLS_PIP" install --no-cache-dir --quiet -e "$opt/pacu" 2>/dev/null || true
  fi

  # Install ParamSpider and Ghauri cleanly
  if [ -d "$opt/ParamSpider" ] && ! have paramspider; then
    pipx install "$opt/ParamSpider" 2>/dev/null || "$TOOLS_PIP" install -e "$opt/ParamSpider" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/paramspider" ] && ln -sf "$TOOLS_DIR/venv/bin/paramspider" "$BIN_INSTALL_DIR/paramspider" 2>/dev/null || true
  fi
  if [ -d "$opt/ghauri" ] && ! have ghauri; then
    pipx install "$opt/ghauri" 2>/dev/null || "$TOOLS_PIP" install -e "$opt/ghauri" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/ghauri" ] && ln -sf "$TOOLS_DIR/venv/bin/ghauri" "$BIN_INSTALL_DIR/ghauri" 2>/dev/null || true
  fi

  # Fix JSFinder shebang
  if [ -f "$opt/JSFinder/JSFinder.py" ]; then
    sed -i '1s|.*|#!/usr/bin/env python3|' "$opt/JSFinder/JSFinder.py" 2>/dev/null || true
  fi

  # Automatic modernization of legacy Python 2 tools to Python 3
  if [ -d "$opt/NoSQLMap" ] && grep -q 'print "' "$opt/NoSQLMap/nosqlmap.py" 2>/dev/null; then
    info "modernizing NoSQLMap for Python 3..."
    "$TOOLS_PIP" install --no-cache-dir --quiet modernize 2>/dev/null || true
    "$TOOLS_DIR/venv/bin/python-modernize" -w "$opt/NoSQLMap" >/dev/null 2>&1 || true
  fi
  if [ -d "$opt/Gopherus" ] && grep -q 'print colors' "$opt/Gopherus/gopherus.py" 2>/dev/null; then
    info "modernizing Gopherus for Python 3..."
    "$TOOLS_DIR/venv/bin/python-modernize" -w "$opt/Gopherus" >/dev/null 2>&1 || true
    sed -i 's/\t/    /g' "$opt"/Gopherus/scripts/*.py 2>/dev/null || true
    sed -i 's/            return/        return/g' "$opt/Gopherus/scripts/PostgreSQL.py" 2>/dev/null || true
  fi
  if [ -d "$opt/LFISuite" ] && grep -q 'print "\[' "$opt/LFISuite/lfisuite.py" 2>/dev/null; then
    info "modernizing LFISuite for Python 3..."
    "$TOOLS_DIR/venv/bin/python-modernize" -w "$opt/LFISuite" >/dev/null 2>&1 || true
    sed -i 's/\t/    /g' "$opt/LFISuite/lfisuite.py" 2>/dev/null || true
    sed -i 's/from collections import Callable/from collections.abc import Callable/g' "$opt/LFISuite/socks.py" 2>/dev/null || true
  fi

  # Fallback for GitGot if ssdeep C library is not present
  if [ -d "$opt/GitGot" ] && [ -f "$opt/GitGot/gitgot.py" ]; then
    if ! grep -q "class ssdeep" "$opt/GitGot/gitgot.py" 2>/dev/null; then
      sed -i 's/^import ssdeep/try:\n    import ssdeep\nexcept Exception:\n    class ssdeep:\n        @staticmethod\n        def hash(c): return str(c)[:100]\n        @staticmethod\n        def compare(a, b): return 0/' "$opt/GitGot/gitgot.py" 2>/dev/null || true
    fi
  fi

  # Java tools setup (ysoserial and marshalsec)
  if [ ! -f "$opt/ysoserial/ysoserial.jar" ]; then
    mkdir -p "$opt/ysoserial"
    curl -sL --max-time 60 -s "https://github.com/frohoff/ysoserial/releases/latest/download/ysoserial-all.jar" -o "$opt/ysoserial/ysoserial.jar" 2>/dev/null \
      && [ -s "$opt/ysoserial/ysoserial.jar" ] || true
    # (removed invalid jitpack master-SNAPSHOT fallback: wrong groupId, hangs without --max-time)
  fi
  if [ ! -f "$opt/ysoserial/ysoserial.jar" ] && [ -d "$opt/ysoserial" ] && have mvn; then
    (cd "$opt/ysoserial" && mvn clean package -DskipTests >/dev/null 2>&1 || true)
    target_jar=$(find "$opt/ysoserial/target" -name "ysoserial*-all.jar" 2>/dev/null | head -1)
    [ -n "$target_jar" ] && cp -f "$target_jar" "$opt/ysoserial/ysoserial.jar" 2>/dev/null || true
  fi
  if [ -f "$opt/ysoserial/ysoserial.jar" ]; then
    cat << WRAP_EOF > "$BIN_INSTALL_DIR/ysoserial"
#!/usr/bin/env bash
exec java -jar "$opt/ysoserial/ysoserial.jar" "\$@"
WRAP_EOF
    chmod +x "$BIN_INSTALL_DIR/ysoserial"
    [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$BIN_INSTALL_DIR/ysoserial" "$TOOLS_DIR/bin/ysoserial" 2>/dev/null || true
    link_to_usr_bin "$BIN_INSTALL_DIR/ysoserial" "ysoserial"
  fi

  if [ -d "$opt/marshalsec" ] && have mvn && ! have marshalsec; then
    (cd "$opt/marshalsec" && mvn clean package -DskipTests >/dev/null 2>&1 || true)
    uberjar=$(find "$opt/marshalsec/target" -name "marshalsec*all.jar" 2>/dev/null | head -1)
    if [ -n "$uberjar" ]; then
      cat << WRAP_EOF > "$BIN_INSTALL_DIR/marshalsec"
#!/usr/bin/env bash
exec java -cp "$uberjar" marshalsec.Uberjar "\$@"
WRAP_EOF
      chmod +x "$BIN_INSTALL_DIR/marshalsec"
      [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$BIN_INSTALL_DIR/marshalsec" "$TOOLS_DIR/bin/marshalsec" 2>/dev/null || true
      link_to_usr_bin "$BIN_INSTALL_DIR/marshalsec" "marshalsec"
    fi
  fi

  # Go tools build from source
  if have go; then
    if [ -d "$opt/shhgit" ] && ! have shhgit; then
      (cd "$opt/shhgit" && go build -o "$BIN_INSTALL_DIR/shhgit" . 2>/dev/null || true)
      [ -f "$BIN_INSTALL_DIR/shhgit" ] && cp -f "$BIN_INSTALL_DIR/shhgit" "$TOOLS_DIR/bin/shhgit" 2>/dev/null || true
      [ -f "$opt/shhgit/config.yaml" ] && cp -n "$opt/shhgit/config.yaml" "$BIN_INSTALL_DIR/config.yaml" 2>/dev/null || true
      link_to_usr_bin "$BIN_INSTALL_DIR/shhgit" "shhgit"
    fi
    if [ -d "$opt/CloudBrute" ] && ! have cloudbrute; then
      (cd "$opt/CloudBrute" && go build -o "$BIN_INSTALL_DIR/cloudbrute-bin" . 2>/dev/null || true)
      if [ -f "$BIN_INSTALL_DIR/cloudbrute-bin" ]; then
        cat << WRAP_EOF > "$BIN_INSTALL_DIR/cloudbrute"
#!/usr/bin/env bash
exec "$BIN_INSTALL_DIR/cloudbrute-bin" -C "$opt/CloudBrute/config" "\$@"
WRAP_EOF
        chmod +x "$BIN_INSTALL_DIR/cloudbrute"
        [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$BIN_INSTALL_DIR/cloudbrute" "$TOOLS_DIR/bin/cloudbrute" 2>/dev/null || true
        link_to_usr_bin "$BIN_INSTALL_DIR/cloudbrute" "cloudbrute"
        link_to_usr_bin "$BIN_INSTALL_DIR/cloudbrute-bin" "cloudbrute-bin"
      fi
    fi
    if [ -d "$opt/S3Scanner" ] && ! have s3scanner; then
      (cd "$opt/S3Scanner" && go build -o "$BIN_INSTALL_DIR/s3scanner" . 2>/dev/null || true)
      [ -f "$BIN_INSTALL_DIR/s3scanner" ] && cp -f "$BIN_INSTALL_DIR/s3scanner" "$TOOLS_DIR/bin/s3scanner" 2>/dev/null || true
      link_to_usr_bin "$BIN_INSTALL_DIR/s3scanner" "s3scanner"
    fi
    if [ -d "$opt/bruteHASH" ] && ! have brutehash; then
      if [ -f "$opt/bruteHASH/bruteHASH.go" ]; then
        (cd "$opt/bruteHASH" && go build -o "$BIN_INSTALL_DIR/brutehash" bruteHASH.go 2>/dev/null || true)
        [ -f "$BIN_INSTALL_DIR/brutehash" ] && cp -f "$BIN_INSTALL_DIR/brutehash" "$TOOLS_DIR/bin/brutehash" 2>/dev/null || true
        link_to_usr_bin "$BIN_INSTALL_DIR/brutehash" "brutehash"
      fi
    fi
  fi

  # Pip installed editable packages and CLI links
  if [ -d "$opt/cloud_enum" ]; then
    "$TOOLS_PIP" install --no-cache-dir --quiet -e "$opt/cloud_enum" 2>/dev/null || true
  fi
  if [ -d "$opt/S3Recon" ] && ! have s3recon; then
    "$TOOLS_PIP" install --no-cache-dir --quiet -e "$opt/S3Recon" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/s3recon" ] && ln -sf "$TOOLS_DIR/venv/bin/s3recon" "$BIN_INSTALL_DIR/s3recon" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/s3recon" ] && ln -sf "$TOOLS_DIR/venv/bin/s3recon" "$TOOLS_DIR/bin/s3recon" 2>/dev/null || true
  fi
  if [ -d "$opt/GitHacker" ] && ! have githacker; then
    "$TOOLS_PIP" install --no-cache-dir --quiet -e "$opt/GitHacker" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/githacker" ] && ln -sf "$TOOLS_DIR/venv/bin/githacker" "$BIN_INSTALL_DIR/githacker" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/githacker" ] && ln -sf "$TOOLS_DIR/venv/bin/githacker" "$TOOLS_DIR/bin/githacker" 2>/dev/null || true
  fi
  if [ -d "$opt/octosuite" ] && ! have octosuite; then
    "$TOOLS_PIP" install --no-cache-dir --quiet --ignore-requires-python -e "$opt/octosuite" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/octosuite" ] && ln -sf "$TOOLS_DIR/venv/bin/octosuite" "$BIN_INSTALL_DIR/octosuite" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/octosuite" ] && ln -sf "$TOOLS_DIR/venv/bin/octosuite" "$TOOLS_DIR/bin/octosuite" 2>/dev/null || true
  fi

  # Link boofuzz CLI command boo
  if [ -f "$TOOLS_DIR/venv/bin/boo" ]; then
    ln -sf "$TOOLS_DIR/venv/bin/boo" "$BIN_INSTALL_DIR/boo" 2>/dev/null || true
    ln -sf "$TOOLS_DIR/venv/bin/boo" "$BIN_INSTALL_DIR/boofuzz" 2>/dev/null || true
  fi

  # Generate CLI executable wrappers in PATH
  wrap_cli xsstrike "$TOOLS_PYTHON" "$opt/XSStrike/xsstrike.py"
  wrap_cli ssrfmap "$TOOLS_PYTHON" "$opt/SSRFmap/ssrfmap.py"
  wrap_cli secretfinder "$TOOLS_PYTHON" "$opt/SecretFinder/SecretFinder.py"
  wrap_cli jsfinder "$TOOLS_PYTHON" "$opt/JSFinder/JSFinder.py"
  wrap_cli smuggler "$TOOLS_PYTHON" "$opt/smuggler/smuggler.py"
  wrap_cli h2csmuggler "$TOOLS_PYTHON" "$opt/h2csmuggler/h2csmuggler.py"
  wrap_cli photon "$TOOLS_PYTHON" "$opt/Photon/photon.py"
  wrap_cli jwt_tool "$TOOLS_PYTHON" "$opt/jwt_tool/jwt_tool.py"
  wrap_cli cloud_enum "$TOOLS_PYTHON" "$opt/cloud_enum/cloud_enum.py"
  wrap_cli gcpbucketbrute "$TOOLS_PYTHON" "$opt/GCPBucketBrute/gcpbucketbrute.py" true
  wrap_cli dumpsterdiver "$TOOLS_PYTHON" "$opt/DumpsterDiver/DumpsterDiver.py" true
  wrap_cli gitdorker "$TOOLS_PYTHON" "$opt/GitDorker/GitDorker.py" true
  wrap_cli gitgot "$TOOLS_PYTHON" "$opt/GitGot/gitgot.py"
  wrap_cli gopherus "$TOOLS_PYTHON" "$opt/Gopherus/gopherus.py" true
  wrap_cli lfisuite "$TOOLS_PYTHON" "$opt/LFISuite/lfisuite.py" true
  wrap_cli nosqlmap "$TOOLS_PYTHON" "$opt/NoSQLMap/nosqlmap.py" true
  wrap_cli pacu "$TOOLS_PYTHON" "$opt/pacu/cli.py"
  wrap_cli recon-ng "$TOOLS_PYTHON" "$opt/recon-ng/recon-ng"
  wrap_cli recon-cli "$TOOLS_PYTHON" "$opt/recon-ng/recon-cli"
  wrap_cli routersploit "$TOOLS_PYTHON" "$opt/routersploit/rsf.py"
  wrap_cli rsf "$TOOLS_PYTHON" "$opt/routersploit/rsf.py"
  wrap_cli rsf.py "$TOOLS_PYTHON" "$opt/routersploit/rsf.py"

  # GraphQL tools
  wrap_cli graphql-cop "$TOOLS_PYTHON" "$opt/graphql-cop/graphql-cop.py" true
  if [ -f "$opt/graphw00f/main.py" ]; then
    wrap_cli graphw00f "$TOOLS_PYTHON" "$opt/graphw00f/main.py" true
  elif [ -f "$opt/graphw00f/graphw00f.py" ]; then
    wrap_cli graphw00f "$TOOLS_PYTHON" "$opt/graphw00f/graphw00f.py" true
  fi

  # S3 Inspector
  if [ -f "$opt/s3-inspector/s3inspector.py" ]; then
    wrap_cli s3-inspector "$TOOLS_PYTHON" "$opt/s3-inspector/s3inspector.py" true
    wrap_cli s3inspector "$TOOLS_PYTHON" "$opt/s3-inspector/s3inspector.py" true
  fi

  # CaringCaribou (CAN bus)
  if [ -f "$opt/caringcaribou/tool/cc.py" ]; then
    wrap_cli caringcaribou "$TOOLS_PYTHON" "$opt/caringcaribou/tool/cc.py" true
    wrap_cli cc.py "$TOOLS_PYTHON" "$opt/caringcaribou/tool/cc.py" true
  fi

  # DotDotPwn fallback
  if [ -f "$opt/dotdotpwn/dotdotpwn.pl" ]; then
    wrap_cli dotdotpwn perl "$opt/dotdotpwn/dotdotpwn.pl" true
    wrap_cli dotdotpwn.pl perl "$opt/dotdotpwn/dotdotpwn.pl" true
  fi

  # SprayingToolkit valid scripts
  wrap_cli atomizer "$TOOLS_PYTHON" "$opt/SprayingToolkit/atomizer.py"
  wrap_cli aerosol "$TOOLS_PYTHON" "$opt/SprayingToolkit/aerosol.py"
  wrap_cli spindrift "$TOOLS_PYTHON" "$opt/SprayingToolkit/spindrift.py"
  wrap_cli vaporizer "$TOOLS_PYTHON" "$opt/SprayingToolkit/vaporizer.py"

  # XXEinjector (Ruby)
  if [ -f "$opt/XXEinjector/XXEinjector.rb" ]; then
    chmod +x "$opt/XXEinjector/XXEinjector.rb" 2>/dev/null || true
    wrap_cli xxeinjector ruby "$opt/XXEinjector/XXEinjector.rb"
    wrap_cli XXEinjector ruby "$opt/XXEinjector/XXEinjector.rb"
  fi

  # phpggc (PHP standalone CLI)
  if [ -f "$opt/phpggc/phpggc" ]; then
    chmod +x "$opt/phpggc/phpggc" 2>/dev/null || true
    cat << WRAP_EOF > "$BIN_INSTALL_DIR/phpggc"
#!/usr/bin/env bash
(cd "$opt/phpggc" && exec php -d phar.readonly=0 "$opt/phpggc/phpggc" "\$@")
WRAP_EOF
    chmod +x "$BIN_INSTALL_DIR/phpggc"
    [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$BIN_INSTALL_DIR/phpggc" "$TOOLS_DIR/bin/phpggc" 2>/dev/null || true
    link_to_usr_bin "$BIN_INSTALL_DIR/phpggc" "phpggc"
  fi

  # Empire CLI wrapper
  if [ -f "$opt/Empire/ps-empire" ]; then
    chmod +x "$opt/Empire/ps-empire" 2>/dev/null || true
    wrap_cli empire bash "$opt/Empire/ps-empire"
  elif [ -f "$opt/Empire/empire.py" ]; then
    wrap_cli empire "$TOOLS_PYTHON" "$opt/Empire/empire.py"
  fi

  # GitTools wrappers
  if [ -f "$opt/GitTools/Dumper/gitdumper.sh" ]; then
    chmod +x "$opt/GitTools/Dumper/gitdumper.sh" "$opt/GitTools/Extractor/extractor.sh" "$opt/GitTools/Finder/gitfinder.py" 2>/dev/null || true
    wrap_cli gitdumper bash "$opt/GitTools/Dumper/gitdumper.sh"
    wrap_cli gitextractor bash "$opt/GitTools/Extractor/extractor.sh"
    wrap_cli gitfinder "$TOOLS_PYTHON" "$opt/GitTools/Finder/gitfinder.py"
  fi

  # Shell scripts wrappers & system path symlinks
  if [ -f "$opt/BruteX/brutex" ]; then
    chmod +x "$opt/BruteX/brutex" 2>/dev/null || true
    wrap_cli brutex bash "$opt/BruteX/brutex"
    [ -d "$opt/BruteX" ] && [ ! -d /usr/share/brutex ] && can_sudo && $SUDO ln -s "$opt/BruteX" /usr/share/brutex 2>/dev/null || true
  fi
  if [ -f "$opt/ReconFTW/reconftw.sh" ]; then
    chmod +x "$opt/ReconFTW/reconftw.sh" 2>/dev/null || true
    wrap_cli reconftw bash "$opt/ReconFTW/reconftw.sh"
  fi
  if [ -f "$opt/sn1per/sniper" ]; then
    chmod +x "$opt/sn1per/sniper" 2>/dev/null || true
    wrap_cli sniper bash "$opt/sn1per/sniper"
    [ -d "$opt/sn1per" ] && [ ! -d /usr/share/sniper ] && can_sudo && $SUDO ln -s "$opt/sn1per" /usr/share/sniper 2>/dev/null || true
  fi

  # PowerShell modules registration
  if [ -d "$opt/PowerSploit" ]; then
    mkdir -p "$HOME/.local/share/powershell/Modules" 2>/dev/null || true
    ln -sfn "$opt/PowerSploit" "$HOME/.local/share/powershell/Modules/PowerSploit" 2>/dev/null || true
  fi
}

# ==============================================================================
# SECTION: Broad "everything else" - CTF, forensics, pwn/RE, crypto, stego,
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
    rtl-sdr hackrf gr-osmosdr qemu-system-x86 \
    can-utils i2c-tools minicom picocom sigrok-cli flashrom openocd avrdude \
    stlink-tools spi-tools usbutils \
    android-tools-adb android-tools-fastboot apktool jadx \
    libimobiledevice-utils ideviceinstaller usbmuxd libplist-utils \
    docker.io docker-compose podman buildah skopeo \
    mariadb-client sqlite3 redis-tools default-mysql-client postgresql-client \
    readpe \
    php-cli perl lua5.4 maven \
    hashcat-utils maskprocessor princeprocessor || true

  # --- CTF / pwn / binary exploitation (pip) ---
  pip_install pwntools ropper ROPgadget capstone unicorn z3-solver \
    angr \
    2>/dev/null || true

  # --- pwn dbg helpers (gdb plugins & CLI launchers) ---
  if [ ! -d "$TOOLS_DIR/pwndbg" ]; then
    git clone --depth 1 https://github.com/pwndbg/pwndbg.git "$TOOLS_DIR/pwndbg" 2>/dev/null \
      && (cd "$TOOLS_DIR/pwndbg" && ./setup.sh >/dev/null 2>&1 || true) || warn "pwndbg clone failed"
  fi
  # Provide pwndbg standalone CLI launcher
  cat << 'EOF' > "$BIN_INSTALL_DIR/pwndbg"
#!/usr/bin/env bash
TOOLS_DIR="${TOOLS_DIR:-$HOME/Tools}"
if [ -f "$TOOLS_DIR/pwndbg/gdbinit.py" ]; then
  exec gdb -q -ex "source $TOOLS_DIR/pwndbg/gdbinit.py" "$@"
fi
exec gdb -q "$@"
EOF
  chmod +x "$BIN_INSTALL_DIR/pwndbg" 2>/dev/null || true
  [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$BIN_INSTALL_DIR/pwndbg" "$TOOLS_DIR/bin/pwndbg" 2>/dev/null || true
  link_to_usr_bin "$BIN_INSTALL_DIR/pwndbg" "pwndbg" 

  # GEF download and standalone CLI launcher
  if [ ! -f "$HOME/.gdbinit-gef.py" ]; then
    curl -sL https://raw.githubusercontent.com/hugsy/gef/main/gef.py -o "$HOME/.gdbinit-gef.py" 2>/dev/null || true
  fi
  cat << 'EOF' > "$BIN_INSTALL_DIR/gef"
#!/usr/bin/env bash
if [ -f "$HOME/.gdbinit-gef.py" ]; then
  exec gdb -q -ex "source $HOME/.gdbinit-gef.py" "$@"
fi
exec gdb -q "$@"
EOF
  chmod +x "$BIN_INSTALL_DIR/gef" 2>/dev/null || true
  [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$BIN_INSTALL_DIR/gef" "$TOOLS_DIR/bin/gef" 2>/dev/null || true
  link_to_usr_bin "$BIN_INSTALL_DIR/gef" "gef" 

  # one_gadget (ruby)
  if ! have one_gadget && have gem; then
    gem install --no-document one_gadget >/dev/null 2>&1 || true
  fi
  if have gem; then
    local gem_bin
    gem_bin="$(ruby -e 'puts Gem.bindir' 2>/dev/null || true)"
    if [ -n "$gem_bin" ] && [ -x "$gem_bin/one_gadget" ] && [ ! -f "$BIN_INSTALL_DIR/one_gadget" ]; then
      ln -sf "$gem_bin/one_gadget" "$BIN_INSTALL_DIR/one_gadget" 2>/dev/null || true
    fi
  fi

  # --- crypto / encoding ---
  pip_install pycryptodome base58 xortool 2>/dev/null || true

  # --- stego (extra) ---
  pipx_install stegano stegano-lsb || true
  pipx_install stegcracker || true
  if ! have stegcracker && have stegseek; then
    cat << 'EOF' > "$BIN_INSTALL_DIR/stegcracker"
#!/usr/bin/env bash
exec stegseek "$@"
EOF
    chmod +x "$BIN_INSTALL_DIR/stegcracker" 2>/dev/null || true
  fi

  # outguess fallback compilation
  if ! have outguess && have make; then
    git_clone "$TOOLS_DIR/outguess" https://github.com/resurrecting-open-source-projects/outguess.git
    if [ -d "$TOOLS_DIR/outguess" ]; then
      (cd "$TOOLS_DIR/outguess" && ./configure --prefix="$TOOLS_DIR" >/dev/null 2>&1 && make >/dev/null 2>&1 || true)
      if [ -x "$TOOLS_DIR/outguess/outguess" ]; then
        cp -f "$TOOLS_DIR/outguess/outguess" "$BIN_INSTALL_DIR/outguess" 2>/dev/null || true
        [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$TOOLS_DIR/outguess/outguess" "$TOOLS_DIR/bin/outguess" 2>/dev/null || true
        link_to_usr_bin "$BIN_INSTALL_DIR/outguess" "outguess"
      fi
    fi
  fi

  # --- mobile / Android / iOS ---
  pipx_install frida-tools frida || true
  pipx_install objection || true
  pipx_install androguard || true
  pipx_install apkleaks || true
  pipx_install apkid || true

  # --- forensics (extra beyond Kali metas: volatility/sleuthkit/binwalk) ---
  for pf in plaso dfimagetools pyhindsight python-registry capstone pypykatz; do
    pip_install "$pf" 2>/dev/null || true
  done
  git_clone "$TOOLS_DIR/regripper" https://github.com/keydet89/RegRipper3.0.git
  if [ -f "$TOOLS_DIR/regripper/rip.pl" ]; then
    cat << WRAP_EOF > "$BIN_INSTALL_DIR/regripper"
#!/usr/bin/env bash
exec perl "$TOOLS_DIR/regripper/rip.pl" "\$@"
WRAP_EOF
    chmod +x "$BIN_INSTALL_DIR/regripper"
    ln -sf "$BIN_INSTALL_DIR/regripper" "$BIN_INSTALL_DIR/rip.pl" 2>/dev/null || true
    link_to_usr_bin "$BIN_INSTALL_DIR/regripper" "regripper"
    link_to_usr_bin "$BIN_INSTALL_DIR/regripper" "rip.pl"
  fi

  # --- LINUX / WINDOWS internal & dynamic analysis ---
  apt_install coreutils binutils elfutils ltrace strace gdb xxd 2>/dev/null || true
  pip_install pefile lief vivisect miasm malduck 2>/dev/null || true

  # --- Automotive / CAN ---
  pip_install python-can 2>/dev/null || true

  # --- Password cracking helpers (kwprocessor from source if missing) ---
  if ! have kwprocessor && have make; then
    git_clone "$TOOLS_DIR/kwprocessor" https://github.com/hashcat/kwprocessor.git
    if [ -d "$TOOLS_DIR/kwprocessor" ]; then
      (cd "$TOOLS_DIR/kwprocessor" && make >/dev/null 2>&1 || true)
      local kwp_bin
      kwp_bin="$(find "$TOOLS_DIR/kwprocessor" -maxdepth 1 -type f \( -name "kwp*" -o -name "kwprocessor" \) -executable 2>/dev/null | head -1)"
      if [ -n "$kwp_bin" ]; then
        cp -f "$kwp_bin" "$BIN_INSTALL_DIR/kwprocessor" 2>/dev/null || true
        [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ] && cp -f "$kwp_bin" "$TOOLS_DIR/bin/kwprocessor" 2>/dev/null || true
        link_to_usr_bin "$BIN_INSTALL_DIR/kwprocessor" "kwprocessor"
      fi
    fi
  fi

  # --- MassDNS fallback build if missing ---
  if ! have massdns; then
    git_clone "$TOOLS_DIR/massdns" https://github.com/blechschmidt/massdns.git
    if [ -d "$TOOLS_DIR/massdns" ] && have make; then
      (cd "$TOOLS_DIR/massdns" && make >/dev/null 2>&1 || true)
      [ -f "$TOOLS_DIR/massdns/bin/massdns" ] && cp -f "$TOOLS_DIR/massdns/bin/massdns" "$BIN_INSTALL_DIR/massdns" 2>/dev/null || true
      [ -f "$BIN_INSTALL_DIR/massdns" ] && link_to_usr_bin "$BIN_INSTALL_DIR/massdns" "massdns"
    fi
  fi

  # --- Blockchain / Web3 (best-effort) ---
  pip_install slither-analyzer web3 mythril 2>/dev/null || true
  # foundry (cast/forge) binary
  if ! have cast; then
    curl -sL https://foundry.paradigm.xyz -o /tmp/foundry.sh 2>/dev/null \
      && bash /tmp/foundry.sh 2>/dev/null \
      && export PATH="$HOME/.foundry/bin:${PATH}" \
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
  ensure_bin hadolint bash -c "curl -sL https://github.com/hadolint/hadolint/releases/latest/download/hadolint-linux-x86_64 -o \"$BIN_INSTALL_DIR/hadolint\" && chmod +x \"$BIN_INSTALL_DIR/hadolint\"" 2>/dev/null || true
  ensure_bin trivy bash -c "curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b \"$BIN_INSTALL_DIR\"" 2>/dev/null || true

  # --- Kubernetes extras ---
  go_install github.com/derailed/k9s                       k9s 2>/dev/null || true
  go_install github.com/derailed/popeye                    popeye 2>/dev/null || true
  ensure_bin helm bash -c 'curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash' 2>/dev/null || true
  ensure_bin kubescape bash -c '
    curl -sfL https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | /bin/bash 2>/dev/null
    if [ -f "$HOME/.kubescape/bin/kubescape" ] && [ ! -f "$BIN_INSTALL_DIR/kubescape" ]; then
      ln -sf "$HOME/.kubescape/bin/kubescape" "$BIN_INSTALL_DIR/kubescape" 2>/dev/null || true
    fi' 2>/dev/null || true
  ensure_bin falcoctl bash -c "
    curl -sL https://github.com/falcosecurity/falcoctl/releases/download/v0.11.0/falcoctl_0.11.0_linux_amd64.tar.gz -o /tmp/falcoctl.tar.gz 2>/dev/null \
      && tar -xzf /tmp/falcoctl.tar.gz -C \"$BIN_INSTALL_DIR\" falcoctl 2>/dev/null \
      && chmod +x \"$BIN_INSTALL_DIR/falcoctl\" 2>/dev/null && rm -f /tmp/falcoctl.tar.gz" 2>/dev/null || true

  # --- Zig (binary) ---
  if ! have zig; then
    curl -sL "https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz" -o /tmp/zig.tar.xz 2>/dev/null \
      && tar -xJf /tmp/zig.tar.xz -C "$TOOLS_DIR" 2>/dev/null \
      && ln -sf "$TOOLS_DIR"/zig-*/zig "$BIN_INSTALL_DIR/zig" 2>/dev/null || warn "zig install failed"
    rm -f /tmp/zig.tar.xz 2>/dev/null || true
  fi

  # Final PATH refresh
  export PATH="$BIN_INSTALL_DIR:$HOME/.cargo/bin:$HOME/.foundry/bin:$HOME/go/bin:/usr/local/go/bin:${PATH}"
}

# ==============================================================================
# SECTION: Azure AD / Microsoft Entra ID + Cloud audit tooling
# ==============================================================================
cmd_azure() {
  say "=== installing Azure AD / Entra ID / cloud audit tools ==="

  # ROADtools suite (roadrecon & roadtx)
  if ! have roadrecon; then
    info "installing ROADtools roadrecon..."
    pipx install roadrecon 2>/dev/null || pipx install roadtools 2>/dev/null || warn "roadrecon install failed"
  else
    info "roadrecon: already installed"
  fi
  if ! have roadtx; then
    info "installing ROADtools roadtx..."
    pipx install roadtx 2>/dev/null || warn "roadtx install failed"
  else
    info "roadtx: already installed"
  fi

  # Cloud SDKs (Microsoft's own control-plane CLI)
  if ! have az; then
    info "installing Azure CLI ..."
    if can_apt; then
      curl -sL https://aka.ms/InstallAzureCLIDeb | DIST_CODE=bookworm $SUDO bash 2>/dev/null || pipx install azure-cli 2>/dev/null || warn "azure cli install failed"
    elif have pipx; then
      pipx install azure-cli 2>/dev/null || warn "azure cli pipx install failed"
    else
      pip_install azure-cli 2>/dev/null || warn "azure cli install failed"
    fi
  else info "az: already installed"; fi

  if ! have aws; then
    info "installing AWS CLI v2 ..."
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscli.zip \
      && unzip -q -o /tmp/awscli.zip -d /tmp/awscli 2>/dev/null
    if [ -f "/tmp/awscli/aws/install" ]; then
      if can_apt; then
        $SUDO /tmp/awscli/aws/install --update >/dev/null 2>&1 || true
      else
        /tmp/awscli/aws/install --update -b "$BIN_INSTALL_DIR" -i "$TOOLS_DIR/aws-cli" >/dev/null 2>&1 || true
      fi
    else
      warn "aws cli download/unzip failed"
    fi
    rm -rf /tmp/awscli.zip /tmp/awscli 2>/dev/null || true
  else info "aws: already installed"; fi

  if ! have gcloud; then
    if can_apt; then
      info "installing Google Cloud SDK ..."
      echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | $SUDO tee /etc/apt/sources.list.d/google-cloud-sdk.list >/dev/null 2>&1 || true
      curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor 2>/dev/null | $SUDO tee /usr/share/keyrings/cloud.google.gpg >/dev/null 2>&1 || true
      $SUDO apt-get update -qq >/dev/null 2>&1 || true
      DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq google-cloud-cli >/dev/null 2>&1 || warn "gcloud failed"
    fi
  else info "gcloud: already installed"; fi

  # AZ PowerShell + AzureAD modules (optional - enables AADInternals/MicroBurst/PowerZure)
  if have pwsh; then
    pwsh -NoProfile -Command "Install-Module AZ -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue" >/dev/null 2>&1 || true
    pwsh -NoProfile -Command "Install-Module AzureAD -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue" >/dev/null 2>&1 || warn "AzureAD module install skipped"
    pwsh -NoProfile -Command "Install-Module AADInternals -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue" >/dev/null 2>&1 || true
  else
    warn "pwsh not installed - PowerShell/AADInternals/PowerZure/MicroBurst modules skipped (install powershell via apt to enable)"
  fi

  # Entra / cloud recon & audit (Python/pipx CLIs)
  pipx_install scoutsuite scout || true
  pipx_install prowler          || true
  # pipx_install cloud_enum removed: PyPI cloud_enum is a squatted placeholder (no CLI); real tool installed via git clone

  # Entra / Azure AD git-cloned tooling
  git_clone "$TOOLS_DIR/MSOLSpray"    https://github.com/dafthack/MSOLSpray.git
  git_clone "$TOOLS_DIR/o365spray"    https://github.com/0xZDH/o365spray.git
  git_clone "$TOOLS_DIR/AADInternals" https://github.com/Gerenios/AADInternals.git
  git_clone "$TOOLS_DIR/ROADtools"    https://github.com/dirkjanm/ROADtools.git
  git_clone "$TOOLS_DIR/AzureHound"   https://github.com/BloodHoundAD/AzureHound.git
  git_clone "$TOOLS_DIR/StormSpotter" https://github.com/Azure/Stormspotter.git
  git_clone "$TOOLS_DIR/cloudfox"     https://github.com/BishopFox/cloudfox.git
  git_clone "$TOOLS_DIR/microburst"   https://github.com/NetSPI/MicroBurst.git
  git_clone "$TOOLS_DIR/PowerZure"    https://github.com/hausec/PowerZure.git

  # MSOLSpray pwsh wrapper
  if [ -f "$TOOLS_DIR/MSOLSpray/MSOLSpray.ps1" ] && have pwsh; then
    cat << WRAP_EOF > "$BIN_INSTALL_DIR/msolspray"
#!/usr/bin/env bash
exec pwsh -NoProfile -ExecutionPolicy Bypass -File "$TOOLS_DIR/MSOLSpray/MSOLSpray.ps1" "\$@"
WRAP_EOF
    chmod +x "$BIN_INSTALL_DIR/msolspray" 2>/dev/null || true
    link_to_usr_bin "$BIN_INSTALL_DIR/msolspray" "msolspray"
  fi

  # o365spray setup & wrapper
  if [ -d "$TOOLS_DIR/o365spray" ]; then
    "$TOOLS_PIP" install --no-cache-dir --quiet -e "$TOOLS_DIR/o365spray" 2>/dev/null || true
    if [ -f "$TOOLS_DIR/venv/bin/o365spray" ]; then
      ln -sf "$TOOLS_DIR/venv/bin/o365spray" "$BIN_INSTALL_DIR/o365spray" 2>/dev/null || true
    elif [ -f "$TOOLS_DIR/o365spray/o365spray.py" ]; then
      wrap_cli o365spray "$TOOLS_PYTHON" "$TOOLS_DIR/o365spray/o365spray.py"
    fi
  fi

  # StormSpotter collector wrapper
  if [ -f "$TOOLS_DIR/StormSpotter/stormcollector/collector.py" ]; then
    wrap_cli stormcollector "$TOOLS_PYTHON" "$TOOLS_DIR/StormSpotter/stormcollector/collector.py" true
    wrap_cli stormspotter "$TOOLS_PYTHON" "$TOOLS_DIR/StormSpotter/stormcollector/collector.py" true
  fi

  # ROADtools submodules setup
  if [ -d "$TOOLS_DIR/ROADtools" ]; then
    "$TOOLS_PIP" install --no-cache-dir --quiet -e "$TOOLS_DIR/ROADtools/roadlib" -e "$TOOLS_DIR/ROADtools/roadrecon" -e "$TOOLS_DIR/ROADtools/roadtx" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/roadrecon" ] && ln -sf "$TOOLS_DIR/venv/bin/roadrecon" "$BIN_INSTALL_DIR/roadrecon" 2>/dev/null || true
    [ -f "$TOOLS_DIR/venv/bin/roadtx" ]    && ln -sf "$TOOLS_DIR/venv/bin/roadtx" "$BIN_INSTALL_DIR/roadtx" 2>/dev/null || true
  fi

  # PowerShell modules directory symlinks
  mkdir -p "$HOME/.local/share/powershell/Modules" 2>/dev/null || true
  [ -d "$TOOLS_DIR/AADInternals" ] && ln -sfn "$TOOLS_DIR/AADInternals" "$HOME/.local/share/powershell/Modules/AADInternals" 2>/dev/null || true
  [ -d "$TOOLS_DIR/microburst" ]   && ln -sfn "$TOOLS_DIR/microburst" "$HOME/.local/share/powershell/Modules/MicroBurst" 2>/dev/null || true
  [ -d "$TOOLS_DIR/PowerZure" ]    && ln -sfn "$TOOLS_DIR/PowerZure" "$HOME/.local/share/powershell/Modules/PowerZure" 2>/dev/null || true

  # Azure Resource enumeration via az cli helper
  if have az; then
    az extension add --name resource-graph -y 2>/dev/null || true
  fi

  # Source build fallbacks for azurehound and cloudfox if prebuilt binary was skipped
  if ! have azurehound && [ -d "$TOOLS_DIR/AzureHound" ] && have go; then
    (cd "$TOOLS_DIR/AzureHound" && go build -o "$BIN_INSTALL_DIR/azurehound" . 2>/dev/null || true)
    [ -f "$BIN_INSTALL_DIR/azurehound" ] && link_to_usr_bin "$BIN_INSTALL_DIR/azurehound" "azurehound"
  fi
  if ! have cloudfox && [ -d "$TOOLS_DIR/cloudfox" ] && have go; then
    (cd "$TOOLS_DIR/cloudfox" && go build -o "$BIN_INSTALL_DIR/cloudfox" . 2>/dev/null || true)
    [ -f "$BIN_INSTALL_DIR/cloudfox" ] && link_to_usr_bin "$BIN_INSTALL_DIR/cloudfox" "cloudfox"
  fi

  # trufflehog via go (secrets): prefer prebuilt binary from cmd_bin, fallback to go
  if ! have trufflehog; then
    go install -v github.com/trufflesecurity/trufflehog/v3@latest 2>/dev/null || warn "trufflehog go install failed"
  fi
}

# ==============================================================================
# SECTION: Wordlists (SecLists, rockyou, FuzzDB, Assetnote, raft, ...)
# ==============================================================================
cmd_wordlists() {
  say "=== installing / linking wordlists ==="
  local wl
  if [ "$EUID" -eq 0 ] || [ -w /usr/share/wordlists ]; then
    wl=/usr/share/wordlists
  else
    wl="$TOOLS_DIR/wordlists"
  fi
  mkdir -p "$wl" 2>/dev/null || wl="$TOOLS_DIR/wordlists"
  mkdir -p "$wl" 2>/dev/null || true

  # rockyou (from Kali 'wordlists' meta package)
  if [ -f "/usr/share/wordlists/rockyou.txt.gz" ]; then
    info "rockyou.txt.gz found"
    if [ ! -f "$wl/rockyou.txt" ]; then
      zcat /usr/share/wordlists/rockyou.txt.gz > "$wl/rockyou.txt" 2>/dev/null && info "extracted rockyou.txt" || true
    fi
  elif [ -f "$wl/rockyou.txt.gz" ]; then
    info "rockyou.txt.gz found in $wl"
    if [ ! -f "$wl/rockyou.txt" ]; then
      zcat "$wl/rockyou.txt.gz" > "$wl/rockyou.txt" 2>/dev/null && info "extracted rockyou.txt" || true
    fi
  else
    warn "rockyou.txt.gz not present (ensure Kali 'wordlists' package is installed)"
  fi

  # Symlink dirb + seclists into wordlists for convenience, with git clone fallback
  [ -e /usr/share/dirb/wordlists ] && { ln -sfn /usr/share/dirb/wordlists "$wl/dirb" 2>/dev/null || true; info "linked dirb wordlists"; } || true
  if [ -e /usr/share/seclists ]; then
    ln -sfn /usr/share/seclists "$wl/seclists" 2>/dev/null || true
    info "linked seclists"
  elif [ ! -d "$wl/seclists" ]; then
    info "cloning SecLists wordlist collection..."
    git clone --depth 1 https://github.com/danielmiessler/SecLists.git "$wl/seclists" 2>/dev/null && info "SecLists cloned -> $wl/seclists" || warn "SecLists clone failed"
  fi

  # FuzzDB (git)
  if [ ! -d "$TOOLS_DIR/FuzzDB" ]; then
    git clone --depth 1 https://github.com/fuzzdb-project/fuzzdb.git "$TOOLS_DIR/FuzzDB" \
      >/dev/null 2>&1 && info "FuzzDB cloned -> $TOOLS_DIR/FuzzDB" || warn "FuzzDB clone failed"
  fi

  # Assetnote wordlists (best-effort, larger lists)
  mkdir -p "$TOOLS_DIR/wordlists/assetnote"
  for f in 2m-subdomains.txt best-dns-wordlist.txt; do
    [ -s "$TOOLS_DIR/wordlists/assetnote/$f" ] || \
      curl -fsSL --retry 3 --connect-timeout 15 --max-time 120 "https://wordlists-cdn.assetnote.io/data/manual/$f" \
        -o "$TOOLS_DIR/wordlists/assetnote/$f" >/dev/null 2>&1 \
        && info "assetnote: $f" || warn "assetnote $f download failed"
  done

  # Extra payload/wordlist convenience links
  [ -d "$TOOLS_DIR/PayloadsAllTheThings" ] && { ln -sfn "$TOOLS_DIR/PayloadsAllTheThings" "$wl/PayloadsAllTheThings"; info "linked PayloadsAllTheThings"; } || true
  [ -d "$TOOLS_DIR/FuzzDB" ] && { ln -sfn "$TOOLS_DIR/FuzzDB" "$wl/FuzzDB"; info "linked FuzzDB"; } || true
  [ -d "$TOOLS_DIR/HackTricks" ] && { ln -sfn "$TOOLS_DIR/HackTricks" "$wl/HackTricks"; info "linked HackTricks"; } || true
  [ -d "$TOOLS_DIR/HackTricks" ] && [ -d /usr/share/doc ] && can_sudo && { $SUDO ln -sfn "$TOOLS_DIR/HackTricks" /usr/share/doc/HackTricks 2>/dev/null || true; } || true

  info "wordlists ready: /usr/share/wordlists, /usr/share/seclists, $TOOLS_DIR/FuzzDB, $TOOLS_DIR/wordlists"
}

# ==============================================================================
# SECTION: Full System Binary Synchronization (/usr/bin and /usr/local/bin)
# ==============================================================================
sync_all_to_usr_bin() {
  say "=== synchronizing all installed tools into /usr/bin and /usr/local/bin ==="
  if ! can_sudo && [ "$EUID" -ne 0 ]; then
    warn "Root/sudo privileges not detected; skipping /usr/bin symlink creation."
    warn "All tools remain accessible via $TOOLS_DIR/bin and PATH."
    return 0
  fi

  local count=0

  # 1. Sweep TOOLS_DIR/bin
  if [ -d "$TOOLS_DIR/bin" ]; then
    for f in "$TOOLS_DIR/bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 2. Sweep BIN_INSTALL_DIR if different
  if [ -d "$BIN_INSTALL_DIR" ] && [ "$BIN_INSTALL_DIR" != "$TOOLS_DIR/bin" ]; then
    for f in "$BIN_INSTALL_DIR"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 3. Sweep GOPATH/bin
  local gopath_bin="$GOPATH/bin"
  if command -v go >/dev/null 2>&1; then
    local env_gp
    env_gp="$(go env GOPATH 2>/dev/null || true)"
    [ -n "$env_gp" ] && [ -d "$env_gp/bin" ] && gopath_bin="$env_gp/bin"
  fi
  if [ -d "$gopath_bin" ]; then
    for f in "$gopath_bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 4. Sweep TOOLS_DIR/venv/bin for Python CLI packages
  if [ -d "$TOOLS_DIR/venv/bin" ]; then
    for f in "$TOOLS_DIR/venv/bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        case "$bname" in
          python*|pip*|easy_install*|activate*|wheel*)
            ;;
          *)
            link_to_usr_bin "$f" "$bname"
            count=$((count + 1))
            ;;
        esac
      fi
    done
  fi

  # 5. Sweep ~/.local/bin (pipx tools)
  if [ -d "$HOME/.local/bin" ]; then
    for f in "$HOME/.local/bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 6. Sweep ~/.cargo/bin (Rust tools)
  if [ -d "$HOME/.cargo/bin" ]; then
    for f in "$HOME/.cargo/bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 7. Sweep ~/.foundry/bin (cast, forge, anvil, chisel)
  if [ -d "$HOME/.foundry/bin" ]; then
    for f in "$HOME/.foundry/bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 8. Sweep ~/.kubescape/bin (kubescape)
  if [ -d "$HOME/.kubescape/bin" ]; then
    for f in "$HOME/.kubescape/bin"/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        local bname
        bname="$(basename "$f")"
        link_to_usr_bin "$f" "$bname"
        count=$((count + 1))
      fi
    done
  fi

  # 9. Ensure all cataloged tools in TOOL_CATEGORIES are linked if found
  for cat in "${!TOOL_CATEGORIES[@]}"; do
    for tool in ${TOOL_CATEGORIES[$cat]}; do
      local tloc
      tloc="$(find_tool_bin "$tool")"
      if [ -n "$tloc" ] && [ -x "$tloc" ]; then
        link_to_usr_bin "$tloc" "$tool"
      fi
    done
  done

  info "system binary synchronization complete (/usr/bin and /usr/local/bin)"
}

# ==============================================================================
# SECTION: CLI Tool Catalog & One-Liner Verification
# ==============================================================================
declare -A TOOL_CATEGORIES=(
  ["Network & Discovery"]="nmap masscan rustscan naabu zmap unicornscan hping3 arp-scan fping netdiscover nbtscan onesixtyone ike-scan tshark tcpdump ngrep tcpreplay dsniff bettercap ettercap macchanger dhcpdump socat nc whois dig"
  ["Web Security & APIs"]="sqlmap ghauri nosqlmap commix ffuf feroxbuster gobuster dirsearch dirb wfuzz nikto wpscan katana gospider hakrawler nuclei dalfox xsstrike kxss gxss sstimap ssrfmap jwt_tool jwt wafw00f sslyze tlsx arjun paramspider x8 qsreplace unfurl uro waybackurls gau waymore httpx httprobe interactsh-client kiterunner dotdotpwn subjs jsluice secretfinder pencode meg gopherus lfisuite jsfinder"
  ["Active Directory & Windows"]="impacket-secretsdump secretsdump.py kerbrute certipy bloodyAD ldeep adidnsdump coercer pre2k pywerview enum4linux-ng smbclient smbmap rpcclient ldapdomaindump ldapsearch pypykatz"
  ["Cloud & Kubernetes"]="aws az gcloud kubectl helm cloudfox azurehound roadrecon roadtx prowler scout checkov tfsec kics trivy grype syft dive crane hadolint kube-bench kube-hunter kubeaudit kubescape popeye falcoctl docker podman buildah skopeo s3scanner s3-inspector"
  ["OSINT & Recon"]="amass subfinder findomain assetfinder chaos-client dnsx puredns alterx dnsgen dnsenum dnsrecon fierce theHarvester shodan censys uncover sherlock maigret holehe instaloader gallery-dl yt-dlp finalrecon photon recon-ng reconftw sniper urlfinder"
  ["Secrets & Source Audit"]="trufflehog gitleaks detect-secrets semgrep codeql gitdorker githacker octosuite dumpsterdiver shhgit"
  ["Password Cracking"]="hashcat john hydra medusa ncrack crowbar brutehash cracklib-check hashid cewl crunch cupp pipal rsmangler maskprocessor princeprocessor kwprocessor stegcracker"
  ["Wireless & Hardware"]="aircrack-ng wifite kismet reaver bully pixiewps hcxpcapngtool hcxdumptool bluetoothctl ubertooth rtl_sdr hackrf_info candump caringcaribou minicom picocom sigrok-cli flashrom openocd avrdude"
  ["Forensics & Reverse Eng"]="fls vol binwalk foremost scalpel bulk_extractor testdisk dc3dd dcfldd extundelete hashdeep radare2 r2 gdb pwndbg gef ropper ROPgadget one_gadget pwn z3 readpe patchelf strace ltrace yara clamscan olevba apktool jadx androguard apkleaks apkid frida objection adb fastboot"
  ["Crypto & Stego"]="steghide stegseek zsteg outguess stegano-lsb xortool openssl base58 qrencode zbarimg exiftool identify xxd hexedit"
  ["Exploitation & C2"]="msfconsole searchsploit empire rsf ysoserial phpggc penelope updog cloudflared ngrok swaks smtp-user-enum sipvicious boofuzz brutex"
  ["Web3 & Blockchain"]="slither myth cast forge anvil chisel"
  ["Toolchains & Runtimes"]="python3 pip3 pipx go node npm ruby gem rustc cargo java pwsh zig"
)

cmd_check() {
  say "=== verifying installed CLI security tools ==="
  local total=0
  local installed=0
  local missing=0

  for cat in "Network & Discovery" "Web Security & APIs" "Active Directory & Windows" \
             "Cloud & Kubernetes" "OSINT & Recon" "Secrets & Source Audit" \
             "Password Cracking" "Wireless & Hardware" "Forensics & Reverse Eng" \
             "Crypto & Stego" "Exploitation & C2" "Web3 & Blockchain" \
             "Toolchains & Runtimes"; do
    local cat_installed=0
    local cat_total=0
    for tool in ${TOOL_CATEGORIES[$cat]}; do
      total=$((total + 1))
      cat_total=$((cat_total + 1))
      if have "$tool"; then
        installed=$((installed + 1))
        cat_installed=$((cat_installed + 1))
      fi
    done
    printf "  %-30s %3d/%3d ready\n" "$cat:" "$cat_installed" "$cat_total"
  done

  echo "  --------------------------------------------------------------"
  printf "  \033[1;32m[ok]\033[0m %d/%d CLI tools verified and ready in environment\n" "$installed" "$total"
  if [ "$installed" -lt "$total" ]; then
    printf "  \033[1;33m[info]\033[0m %d optional tools can be provisioned via ./tools.sh all\n" "$((total - installed))"
  fi
}

cmd_list() {
  say "=== KerberoSec Comprehensive CLI Tool Catalog ==="
  local total=0
  for cat in "Network & Discovery" "Web Security & APIs" "Active Directory & Windows" \
             "Cloud & Kubernetes" "OSINT & Recon" "Secrets & Source Audit" \
             "Password Cracking" "Wireless & Hardware" "Forensics & Reverse Eng" \
             "Crypto & Stego" "Exploitation & C2" "Web3 & Blockchain" \
             "Toolchains & Runtimes"; do
    printf "\n\033[1;34m[%s]\033[0m\n" "$cat"
    for tool in ${TOOL_CATEGORIES[$cat]}; do
      total=$((total + 1))
      if have "$tool"; then
        printf "  \033[1;32m✓\033[0m %s\n" "$tool"
      else
        printf "  \033[1;31m✗\033[0m %s\n" "$tool"
      fi
    done
  done
  echo "------------------------------------------------------------------"
  printf "Total cataloged CLI tools: %d\n" "$total"
}

# ==============================================================================
# main dispatcher
# ==============================================================================
cmd_all() {
  ensure_prerequisites
  # Toolchains first so rust/cargo/go/java/python/docker exist before tool builds
  cmd_toolchains; cmd_apt; cmd_python; cmd_go; cmd_bin; cmd_git; cmd_more; cmd_azure; cmd_wordlists; sync_all_to_usr_bin
}

case "${1:-all}" in
  all)        cmd_all ;;
  check)      cmd_check ;;
  list)       cmd_list ;;
  link|sync)  sync_all_to_usr_bin ;;
  apt)        ensure_prerequisites; cmd_apt; sync_all_to_usr_bin ;;
  python)     ensure_prerequisites; cmd_python; sync_all_to_usr_bin ;;
  go)         ensure_prerequisites; cmd_go; sync_all_to_usr_bin ;;
  bin)        ensure_prerequisites; cmd_bin; sync_all_to_usr_bin ;;
  git)        ensure_prerequisites; cmd_git; sync_all_to_usr_bin ;;
  more)       ensure_prerequisites; cmd_more; sync_all_to_usr_bin ;;
  azure)      ensure_prerequisites; cmd_azure; sync_all_to_usr_bin ;;
  wordlists)  ensure_prerequisites; cmd_wordlists ;;
  toolchains) ensure_prerequisites; cmd_toolchains; sync_all_to_usr_bin ;;
  -h|--help|help)
    show_help
    ;;
  *)
    echo "usage: $(basename "$0") [all|check|list|link|sync|apt|python|go|bin|git|more|azure|wordlists|toolchains]" >&2
    exit 2
    ;;
esac
