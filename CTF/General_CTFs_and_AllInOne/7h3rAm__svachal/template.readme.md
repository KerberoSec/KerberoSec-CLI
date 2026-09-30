# 📖 ReadMe

[![License: CC BY-SA 4.0](https://raw.githubusercontent.com/7h3rAm/7h3rAm.github.io/master/static/files/ccbysa4.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

<a name="contents"></a>
## 🔖 Contents
- ☀️ [Methodology](#methodology)
  * ⚙️ [Phase 0: Recon](#mrecon)
  * ⚙️ [Phase 1: Enumerate](#menumerate)
  * ⚙️ [Phase 2: Exploit](#mexploit)
  * ⚙️ [Phase 3: PrivEsc](#mprivesc)

- ☀️ [Stats](#stats)
  * 📊 [Counts](#counts)
  * 📊 [Top Categories](#topcategories)
  * 📊 [Top Ports/Protocols/Services](#topportsprotocolsservices)
  * 📊 [Top TTPs](#topttps)

- ⚡ [Mapping](#mapping)

- 💥 [Machines](#machines)

- ☢️ [TTPs](#ttps)
  * ⚙️ [Enumerate](#enumerate)
  * ⚙️ [Exploit](#exploit)
  * ⚙️ [PrivEsc](#privesc)

- ⚡ [Tips](#tips)

- 💥 [Tools](#tools)

- 🔥 [Loot](#loot)
  * 🔑 [Credentials](#credentials)
  * 🔑 [Hashes](#hashes)

<a name="methodology"></a>
## ☀️ Methodology [↟](#contents)
<a name="mrecon"></a>
### ⚙️ Phase #0: Recon [🡑](#methodology)
**Goal**: {{ summary.methodology.recon.goal|e }}  
**Process**:
{% for item in summary.methodology.recon.process %}
* {{ item|e }}
{% endfor %}

<a name="menumerate"></a>
### ⚙️ Phase #1: Enumerate [🡑](#methodology)
**Goal**: {{ summary.methodology.enumerate.goal|e }}  
**Process**:
{% for item in summary.methodology.enumerate.process %}
* {{ item|e }}
{% endfor %}

<a name="mexploit"></a>
### ⚙️ Phase #2: Exploit [🡑](#methodology)
**Goal**: {{ summary.methodology.exploit.goal|e }}  
**Process**:
{% for item in summary.methodology.exploit.process %}
* {{ item|e }}
{% endfor %}

<a name="mprivesc"></a>
### ⚙️ Phase #3: PrivEsc [🡑](#methodology)
**Goal**: {{ summary.methodology.privesc.goal|e }}  
**Process**:
{% for item in summary.methodology.privesc.process %}
* {{ item|e }}
{% endfor %}

<a name="stats"></a>
## ☀️ Stats [↟](#contents)
### 📊 Counts [🡑](#stats)
{{ summary.stats.counts }}

<a name="topcategories"></a>
### 📊 Top Categories [🡑](#stats)

<a name="topportsprotocolsservices"></a>
### 📊 Top Ports/Protocols/Services [🡑](#stats)

---

---

<a name="topttps"></a>
### 📊 Top TTPs [🡑](#stats)

---

---

<a name="mapping"></a>
## ⚡ Mapping [↟](#contents)
| # | Port | Service | TTPs | TTPs: ITW |
|---|------|-----------|------|------------|
{% for item in summary.ttpsitw|customsort %}
| {{ loop.index }}. | `{{ item }}/{{ summary.ttpsitw[item].l4 }}` | {{ summary.ttpsitw[item].protokeys|monojoin }} | {{ summary.ttpsitw[item].ttps|anchorformat("https://github.com/7h3rAm/writeups") }} | {{ summary.ttpsitw[item].ttpsitw|anchorformat("https://github.com/7h3rAm/writeups") }} |
{% endfor %}

<a name="machines"></a>
## 💥 Machines [↟](#contents)
{{ summary.stats.owned }}

<a name="ttps"></a>
## ☢️ TTPs [↟](#contents)
<a name="enumerate"></a>
### ⚙️ Enumerate [🡑](#ttps)
{% for item in summary.techniques.enumerate %}
{% set outerloop = loop %}
<a name="{{ item }}"></a>
#### {{ item }} [⇡](#enumerate)  
{% if summary.techniques.enumerate[item].description %}
{{ summary.techniques.enumerate[item].description }}  
{% endif %}
{% if summary.techniques.enumerate[item].cli %}
```shell
{{ summary.techniques.enumerate[item].cli }}
```
{% endif %}  
{% if summary.techniques.enumerate[item].writeups|length > 0 %}
| # | Name | Infra | Killchain | TTPs |
|---|------|-------|-----------|------|
{% for entry in summary.techniques.enumerate[item].writeups|sort(attribute="datetime", reverse=True) %}
| {{ loop.index }}. | [{{ entry.name }}]({{ entry.writeup }}) | [{{ entry.verbose_id }}]({{ entry.url }}) | {{ entry.overview }} | {{ entry.tags|anchorformat("https://github.com/7h3rAm/writeups") }} |
{% endfor %}  
{% endif %}
{% for reference in summary.techniques.enumerate[item].references %}
{% if reference %}
[+] {{ reference }}  
{% endif %}
{% endfor %}  
---
{% endfor %}

<a name="exploit"></a>
### ⚙️ Exploit [🡑](#ttps)
{% for item in summary.techniques.exploit %}
{% set outerloop = loop %}
<a name="{{ item }}"></a>
#### {{ item }} [⇡](#exploit)  
{% if summary.techniques.exploit[item].description %}
{{ summary.techniques.exploit[item].description }}  
{% endif %}
{% if summary.techniques.exploit[item].cli %}
```shell
{{ summary.techniques.exploit[item].cli }}
```
{% endif %}  
{% if summary.techniques.exploit[item].writeups|length > 0 %}
| # | Name | Infra | Killchain | TTPs |
|---|------|-------|-----------|------|
{% for entry in summary.techniques.exploit[item].writeups|sort(attribute="datetime", reverse=True) %}
| {{ loop.index }}. | [{{ entry.name }}]({{ entry.writeup }}) | [{{ entry.verbose_id }}]({{ entry.url }}) | {{ entry.overview }} | {{ entry.tags|anchorformat("https://github.com/7h3rAm/writeups") }} |
{% endfor %}  
{% endif %}
{% for reference in summary.techniques.exploit[item].references %}
{% if reference %}
[+] {{ reference }}  
{% endif %}
{% endfor %}  
---
{% endfor %}

<a name="privesc"></a>
### ⚙️ PrivEsc [🡑](#ttps)
{% for item in summary.techniques.privesc %}
{% set outerloop = loop %}
<a name="{{ item }}"></a>
#### {{ item }} [⇡](#privesc)  
{% if summary.techniques.privesc[item].description %}
{{ summary.techniques.privesc[item].description }}  
{% endif %}
{% if summary.techniques.privesc[item].cli %}
```shell
{{ summary.techniques.privesc[item].cli }}
```
{% endif %}  
{% if summary.techniques.privesc[item].writeups|length > 0 %}
| # | Name | Infra | Killchain | TTPs |
|---|------|-------|-----------|------|
{% for entry in summary.techniques.privesc[item].writeups|sort(attribute="datetime", reverse=True) %}
| {{ loop.index }}. | [{{ entry.name }}]({{ entry.writeup }}) | [{{ entry.verbose_id }}]({{ entry.url }}) | {{ entry.overview }} | {{ entry.tags|anchorformat("https://github.com/7h3rAm/writeups") }} |
{% endfor %}  
{% endif %}
{% for reference in summary.techniques.privesc[item].references %}
{% if reference %}
[+] {{ reference }}  
{% endif %}
{% endfor %}  
---
{% endfor %}

<a name="tips"></a>
## ⚡ Tips [↟](#contents)
{% for entry in summary.tips %}
### {{ entry.description|trim }} [🡑](#tips)  
```
{{ entry.cli|trim }}
```  
{% endfor %}

<a name="tools"></a>
## 💥 Tools [↟](#contents)
{% for entry in summary.tools %}
### {{ entry.description|trim }} [🡑](#tools)  
```
{{ entry.cli|trim }}
```  
{% endfor %}

<a name="loot"></a>
## 🔥 Loot [↟](#contents)
<a name="credentials"></a>
### 🔑 Credentials [🡑](#loot)
| # | Username | Password | Type |
|---|----------|----------|------|
{% for item in summary.loot.credentials|sort(attribute="credtype", reverse=False) %}
| {{ loop.index }}. | {% if item.username %}`{{ item.username }}`{% endif %} | `{{ item.password|obfuscate }}` | `{{ item.credtype }}` |
{% endfor %}

<a name="hashes"></a>
### 🔑 Hashes [🡑](#loot)
| # | Hash |
|---|------|
{% for item in summary.loot.hashes|sort %}
| {{ loop.index }}. | `{{ item }}` |
{% endfor %}
