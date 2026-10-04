# machinescli

[![License: CC BY-SA 4.0](https://raw.githubusercontent.com/7h3rAm/7h3rAm.github.io/master/static/files/ccbysa4.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

This tool provides commandline access for [HackTheBox](https://www.hackthebox.eu), [TryHackMe](https://tryhackme.com/) and [VulnHub](https://www.vulnhub.com/) machines. Here's a quick listing of useful features:

- Look up machine details across HTB/THM/VH
- Track owned/pending/todo machines
- Interact with HTB portal and assign/remove/own/query machines
- Search writeup descriptions using [ippsec.rocks](https://ippsec.rocks/?#) like option
- Search machine details using `jq`-style query language

> `machinescli` works in conjuction with [svachal](https://github.com/7h3rAm/svachal) framework.
> As such, if you wish to extend and use writeup metadata, it will be natively accessible via the shared `machines.json` file.

## Installation

Follow the steps below and run `machinescli` to create the `machines.json` file (to get your `HTBAPIKEY` from [HackTheBox](https://www.hackthebox.com/home/settings), go to your username tab > Classic HTB > Settings > API Key):

```
$ mkdir -pv cd $HOME/toolbox/projects && cd $HOME/toolbox/projects
$ git clone https://github.com/7h3rAm/machinescli && cd machinescli
$ python3 -m venv --copies venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ mkdir -pv $HOME/toolbox/bootstrap # this directory will be used to store and access machines.json file
$ export HTBAPIKEY=<APIKEYHERE>
$ python3 machinescli.py --update
```

## Usage
*[Image: Usage]*

## Usecases
1. Show counts for tracked and owned machines:
*[Image: Counts]*

1. Show stats for machine named `bashed`, show extended details as JSON, export results for GSheet import:
*[Image: Info]*

1. Search machine descriptions for keywords `buffer overflow` and `bash`:
*[Image: Search]*

1. Query `owned` machines using the built-in filter:
*[Image: Query-Owned]*

1. Query `owned AND oscplike HackTheBox` machines using the built-in filter:
*[Image: Query-OwnedHTB]*

1. Query `owned AND oscplike HackTheBox` machines using the built-in filter and show TTPs if machine writeups are available:
*[Image: Query-OwnedHTB]*

1. Query `owned AND NOT OSCPlike` machines using `jq`-style syntax:
*[Image: QueryJQ]*

1. Show global stats from HackTheBox platform:
*[Image: HTB-Stats]*

1. Show `spawned` machines and `expiry` stats from HackTheBox platform:
*[Image: HTB-Spawned-Expiry]*

1. Perform `assign` and `remove` operations on a HackTheBox machine:
*[Image: HTB-Assign-Remove]*

1. Show global stats from TryHackMe platform:
*[Image: THM-Stats]*

## Argument Autocomplete
Source the `.bash-completion` file within a shell to trigger auto-complete for arguments. This will require the following alias:
```console
alias machinescli='python3 $HOME/toolbox/projects/machinescli/machinescli.py'
```

> You will need a [Nerd Fonts patched font](https://github.com/ryanoasis/nerd-fonts/tree/master/patched-fonts) for OS icons and other symbols to be rendered correctly.
