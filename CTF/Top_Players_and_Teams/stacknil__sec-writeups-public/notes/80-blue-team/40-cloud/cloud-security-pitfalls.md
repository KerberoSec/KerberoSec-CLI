---
status: done
created: 2026-04-12
updated: 2026-04-12
date: 2026-04-12
platform: tryhackme
room: Cloud Security Pitfalls
slug: cloud-security-pitfalls
path: notes/80-blue-team/40-cloud/cloud-security-pitfalls.md
topic: 80-blue-team
domain: [cloud, security-operations, detection-engineering]
skills: [infra-basics, risk-management, threat-modeling, logging, detection-engineering]
artifacts: [concept-notes, pattern-card, room-notes]
type: resource-note
source: user-provided room text and screenshots; terminology and product classification checked against current official vendor documentation
next_action: Expand this note into an AWS-focused detection note covering CloudTrail, IAM abuse, and control-plane monitoring.
---

# Cloud Security Pitfalls

## Summary

* Cloud adoption does not remove security work. It redistributes it.
* The core abstraction layers are IaaS, PaaS, and SaaS. The higher the abstraction, the less infrastructure you manage and the less raw visibility you usually have.
* Cloud security is split into two ideas: security of the cloud and security in the cloud.
* The cloud provider is responsible for protecting its own infrastructure, but the customer still has to protect identities, workloads, data, configurations, and tenant activity.
* A major SOC problem in cloud environments is visibility asymmetry: you can see your tenant activity, but you cannot see inside the provider's internal environment.
* Cloud migration often fails at the operational layer, not the marketing layer. Teams move workloads without rethinking authentication, logging, segmentation, or detection logic.
* For blue teams, cloud monitoring means watching three planes at once: control plane, workloads, and data/service activity.

```text
On-prem mindset:
  "We own the servers, so we see everything."

Cloud reality:
  "We own only a slice of the stack, and visibility shrinks as abstraction increases."
```

## 1. What "Cloud" Actually Means

Cloud is not magic. It is a delivery and management model.

A third-party provider operates computing resources and exposes them on demand over the Internet. The customer consumes those resources without owning the physical data center and, depending on the model, without managing large parts of the software stack.

This means cloud is best understood as managed abstraction.

The provider takes some burden away. In exchange, the customer gives up some control and some visibility.

That trade-off sits at the center of this room.

## 2. Service Models: IaaS, PaaS, SaaS

## 2.1 IaaS: Infrastructure as a Service

IaaS gives you virtualized infrastructure in the cloud.

Typical customer responsibilities still include:

* guest operating systems
* patching inside launched VMs
* application deployment
* access control to your own workloads
* security monitoring of your tenant resources

Typical provider responsibilities include:

* physical hardware
* data center facilities
* base virtualization layer
* foundational cloud infrastructure

**Mental model**

You are renting computing building blocks, not a finished application.

**Examples**

* Amazon EC2 / AWS infrastructure services
* Google Compute Engine
* Microsoft Azure VMs

**Best use case**

Lift-and-shift migrations, custom infrastructure, or workloads needing maximum control.

## 2.2 PaaS: Platform as a Service

PaaS removes most infrastructure management and gives you a platform to deploy code or applications.

You focus more on:

* application logic
* app configuration
* secrets handling
* identity and authorization
* application telemetry

The provider manages more of:

* runtime platform
* scaling layer
* patching of platform-managed components
* base hosting stack

**Mental model**

You are renting an application runway, not raw servers.

**Examples**

* Azure App Service
* Google App Engine
* Vercel
* Heroku

**Best use case**

Rapid application development and hosting where infrastructure management is secondary to shipping software.

## 2.3 SaaS: Software as a Service

SaaS gives you a finished cloud application.

The provider manages almost everything in the stack. The customer mainly manages:

* tenant configuration
* users and identities
* permissions
* data governance
* acceptable use
* audit and monitoring of tenant activity

### Mental model

You are renting a finished product, not a platform.

### Examples

* Google Docs
* Slack
* Zoom
* Dropbox
* Salesforce
* Asana
* Confluence

### Best use case

Business-ready applications for technical and non-technical teams.

## 3. Comparison Table

| Model | What you mostly consume | Customer effort | Typical visibility | Typical security focus |
| --- | --- | --- | --- | --- |
| IaaS | Compute, storage, networking, virtualization | Highest | Highest among cloud models, but still incomplete | OS hardening, IAM, workload logging, network controls |
| PaaS | Application hosting platform | Medium | Lower than IaaS | App security, secrets, auth, API abuse, platform logs |
| SaaS | Finished software product | Lowest | Often lowest / tenant-scoped only | Identity, tenant config, data sharing, abnormal user actions |

### Key principle

```text
More abstraction -> less infrastructure work
More abstraction -> usually less forensic depth and less raw telemetry
```

## 4. Security of the Cloud vs Security in the Cloud

This distinction is foundational.

## 4.1 Security of the cloud

This is the provider's side.

It includes:

* physical facilities
* core infrastructure
* hypervisor / virtualization foundations
* provider-managed service internals
* provider-side platform resilience and patching

If this layer is compromised, many tenants may be affected at once.

This is effectively a supply chain risk at cloud scale.

## 4.2 Security in the cloud

This is the customer's side.

It includes:

* tenant identities
* user access
* cloud workload security
* data access control
* configuration hygiene
* monitoring and alerting for tenant actions
* patching of customer-managed systems in IaaS

### Important conclusion

Cloud security is not outsourced security.

It is shared security with uneven visibility.

## 5. Shared Responsibility: What Changes by Model

The user screenshots in the room are teaching exactly one habit:

Do not memorize slogans. Map the responsibility to the layer.

## 5.1 In IaaS

The provider secures:

* physical data center
* foundational infrastructure
* virtualization substrate
* cloud-managed services at the provider layer

The customer secures:

* data in tenant resources
* VM operating systems and software inside them
* identity and access within the tenant
* workload logs and detection coverage

### Example reasoning

* "Secure the cloud datacenters from unauthorized physical access" -> provider
* "Manage software dependencies in the virtual machines you launch" -> customer
* "Collect VM logs and monitor launched workloads for cyber threats" -> customer
* "Patch vulnerabilities in a provider-managed storage service" -> provider

This is the kind of layer-based thinking the room wants.

## 6. Core Cloud Security Pitfalls

## 6.1 Misplaced trust in the provider

Teams often assume:

```text
Cloud provider = secure by default = my environment is secure.
```

That logic is structurally wrong.

A secure provider does not automatically mean:

* your identities are secure
* your tenant is hardened
* your SaaS sharing is controlled
* your workloads are patched
* your logs are retained and analyzed

## 6.2 Rehosting instead of redesigning

An unpatched server moved to the cloud is still an unpatched server.

Cloud migration does not launder technical debt.

It often preserves:

* stale packages
* weak passwords
* poor internal trust assumptions
* no MFA
* overbroad admin roles
* broken logging

## 6.3 On-prem controls copied blindly into cloud

This is common and costly.

Examples:

* weak password-only admin access left exposed to the Internet
* assuming internal trust zones still exist in the same way
* over-reliance on endpoint logs while ignoring control-plane telemetry
* expecting forensics parity with on-prem memory/disk acquisition

## 6.4 Shadow IT and uncontrolled SaaS usage

Business teams adopt tools quickly.

Security teams often discover them late.

That creates:

* unmanaged data movement
* unknown sharing exposure
* weak retention
* no SIEM integration
* unclear incident ownership

## 6.5 Limited visibility and black-box risk

The deeper the provider-owned layer, the less you can see.

This is especially severe in SaaS.

In many SaaS incidents, a customer can observe only:

* user logins
* admin changes
* export activity
* some sharing events

But not:

* provider-side session theft paths
* support-system compromise
* hidden internal abuse chains
* provider-side malware or persistence

## 7. Visibility Model for the SOC

The room's strongest operational idea is not the cloud-model taxonomy. It is the visibility gradient.

## 7.1 On-prem visibility

On-prem generally allows the richest telemetry set:

* endpoint logs
* network logs
* registry / filesystem / memory artifacts
* EDR visibility
* flexible retention and forensic acquisition

## 7.2 IaaS visibility

In IaaS, visibility becomes split:

* you can still monitor workloads you launch
* but you depend on provider APIs for control-plane and service activity logs
* you do not see the provider's internal infrastructure

## 7.3 PaaS / SaaS visibility

Higher abstraction often means lower visibility.

You are usually limited to:

* activity logs
* admin events
* sharing events
* auth lifecycle events
* export / download actions

That is still useful, but it is narrower and often inconsistent.

## 8. What the SOC Must Monitor in Cloud Environments

A practical SOC view should split cloud monitoring into three domains.

## 8.1 Control plane

This is the administration layer.

Examples:

* console logins
* IAM role changes
* policy updates
* API key creation
* configuration changes
* new service enablement

**Why it matters**

Control-plane compromise often precedes persistence, privilege escalation, and lateral reach inside the tenant.

## 8.2 Workloads

These are the VMs, containers, and compute resources actually doing the business work.

Examples:

* process execution
* package installation
* suspicious outbound traffic
* container runtime anomalies
* interactive shell behavior

**Why it matters**

This is where traditional compromise still happens.

## 8.3 Data and service activity

These are service-level actions within storage, SaaS, and managed resources.

Examples:

* storage bucket access
* document sharing changes
* bulk export behavior
* database query anomalies
* repository cloning / downloading

### Why it matters

In many cloud incidents, the attacker's objective is data access, not host takeover.

## 9. Logging Challenges in the Cloud

Cloud logging is not just turn on syslog in the cloud.

The room highlights three real obstacles.

## 9.1 Paid logs

Some vendors restrict high-value audit exports behind licensing or premium plans.

This creates a blunt operational problem:

**the first obstacle may be commercial, not technical**.

## 9.2 Poor log quality

Common issues:

* missing fields
* inconsistent schemas
* weak documentation
* poor normalization across event types

## 9.3 Weak integration paths

Some cloud or SaaS products do not integrate cleanly with SIEMs.

That means:

* delayed ingestion
* fragile collectors
* custom parsers
* partial telemetry only

## 10. Cloud-Native Security Tool Families

The room briefly mentions several categories. The important thing is to understand their role, not just the acronym.

## 10.1 CASB: Cloud Access Security Broker

Used to enforce and monitor security policy around cloud application usage, especially SaaS.

Typical focus:

* sanctioned vs unsanctioned SaaS use
* sharing policy enforcement
* DLP-like controls
* risky user actions

## 10.2 CSPM: Cloud Security Posture Management

Used to identify cloud misconfigurations.

Typical focus:

* public storage exposure
* weak IAM roles
* insecure network exposure
* policy drift

## 10.3 CWPP: Cloud Workload Protection Platform

Used to secure workloads such as VMs, containers, and Kubernetes environments.

Typical focus:

* runtime detection
* malware / suspicious process behavior
* workload-level policy enforcement
* container or host activity monitoring

### Study note

In the room's classification logic, tools such as Falco and Tetragon fit best under the CWPP / runtime workload protection idea, even though vendor ecosystems may describe them with overlapping terms like runtime security, observability, or cloud-native detection.

## 11. Lab / Question-Oriented Takeaways

This section captures the room's core answer logic in note form.

### Service model questions

* A big on-prem network migration maps best to IaaS.
* Products like Elastic Cloud and CrowdStrike Falcon are consumed primarily as SaaS / cloud-delivered managed platforms in this room's abstraction frame.

### Responsibility questions

* Is the provider responsible for securing and monitoring its own infrastructure? -> Yes
* Should you trust the provider blindly and ignore supply-chain risk? -> No
* Does moving an unpatched server to the cloud make it secure again? -> No
* First major obstacle to SIEM integration for many cloud products? -> Paid logs / licensing barrier
* Compute resources like VMs or containers are best called workloads.
* Falco and Tetragon fit best under CWPP / runtime workload security.

## 12. Pattern Cards

## Pattern Card: Shared responsibility confusion

**Signal:** team assumes provider secures everything  
**Likely outcome:** weak tenant controls, missed logging, no ownership  
**Correction:** map responsibility by layer, not by vendor marketing

## Pattern Card: Lift-and-shift security debt

**Signal:** old VMs moved to cloud without redesign  
**Likely outcome:** same vulnerabilities, larger exposure  
**Correction:** re-baseline auth, patching, segmentation, and logging

## Pattern Card: SaaS black-box monitoring gap

**Signal:** critical business data stored in SaaS but minimal logs in SIEM  
**Likely outcome:** late detection, weak investigation  
**Correction:** enable audit APIs, collect tenant activity logs, define anomaly rules

## 13. Recommended SOC Action Plan

```text
1. inventory cloud usage
2. classify by IaaS / PaaS / SaaS
3. map shared responsibilities per product
4. enable all available audit logging
5. forward logs to SIEM before retention expires
6. build detections for risky logins and admin changes
7. monitor workloads in IaaS the same way you monitor on-prem endpoints
8. document incident assumptions and visibility limits for each cloud
```

### Minimal practical checklist

* Know every cloud used by the organization
* Turn on provider audit logs
* Protect cloud identities with MFA and strong policy
* Collect workload logs in IaaS
* Monitor control-plane changes
* Watch for risky SaaS exports, downloads, and sharing changes
* Treat provider compromise as a real but low-frequency supply-chain scenario

## 14. ASCII Diagram

```text
                +----------------------+
                |  Provider layer      |
                |  infra / facilities  |
                +----------------------+
                           |
                 security OF the cloud
                           |
                +----------------------+
                |   Your tenant        |
                | identities, data,    |
                | workloads, configs   |
                +----------------------+
                           |
                 security IN the cloud
```

## 15. CN-EN Glossary

* Cloud tenant: 云租户 / 云账户边界
* IaaS (Infrastructure as a Service): 基础设施即服务
* PaaS (Platform as a Service): 平台即服务
* SaaS (Software as a Service): 软件即服务
* Shared Responsibility Model: 共享责任模型
* Security of the cloud: 云本身的安全 / 提供商基础设施安全
* Security in the cloud: 云中资源的安全 / 客户侧安全
* Control plane: 控制平面
* Workload: 工作负载（VM、container 等）
* Audit log: 审计日志
* Visibility gap: 可见性缺口
* Shadow IT: 影子 IT
* CASB: 云访问安全代理
* CSPM: 云安全态势管理
* CWPP: 云工作负载保护平台

## 16. Final Takeaway

Cloud security becomes simpler only in marketing diagrams.

Operationally, it becomes a question of:

* which layer you still own
* which logs you can still obtain
* which assumptions must be dropped
* and how much visibility you lose as abstraction increases

The mature SOC lesson is straightforward:

**Do not ask whether a system is in the cloud. Ask which cloud model it uses, what layer you control, and what telemetry still exists.**
